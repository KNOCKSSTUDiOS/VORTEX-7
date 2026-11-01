import React, { useRef, useEffect, useState } from 'react';
import {
  Volume2,
  Sliders,
  Radio,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Smile,
} from 'lucide-react';
import { AudioEngineState, ParametricBand, VisemePhoneme } from '../types';
import { audioEngine, PHONEME_VISEME_MAP, parseTextToVisemes } from '../utils/audioEngine';

interface AudioMasterEditorProps {
  audioState: AudioEngineState;
  onChangeAudioState: (newState: Partial<AudioEngineState>) => void;
  onUpdateEqBand: (bandId: number, freq: number, gain: number, q: number) => void;
}

export const AudioMasterEditor: React.FC<AudioMasterEditorProps> = ({
  audioState,
  onChangeAudioState,
  onUpdateEqBand,
}) => {
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visemeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedBandId, setSelectedBandId] = useState<number>(2);
  const [isDraggingNode, setIsDraggingNode] = useState<boolean>(false);
  const [testSpeechText, setTestSpeechText] = useState('CYBERPUNK CINEMA KNOCKS STUDIOS LIP SYNC');
  const [visemeSequence, setVisemeSequence] = useState<VisemePhoneme[]>([]);
  const [visemeIndex, setVisemeIndex] = useState(0);

  // Parse speech test to phonemes
  useEffect(() => {
    const list = parseTextToVisemes(testSpeechText);
    setVisemeSequence(list);
    setVisemeIndex(0);
  }, [testSpeechText]);

  // Animate phoneme-to-viseme sequence
  useEffect(() => {
    if (visemeSequence.length === 0) return;
    const interval = setInterval(() => {
      setVisemeIndex((prev) => (prev + 1) % visemeSequence.length);
    }, 180);
    return () => clearInterval(interval);
  }, [visemeSequence]);

  const activeVisemeObj = visemeSequence[visemeIndex] || PHONEME_VISEME_MAP.REST;

  // Render 5-Band Parametric EQ Curve on Canvas
  useEffect(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#08090C';
    ctx.fillRect(0, 0, w, h);

    // Grid lines for frequency (20Hz to 20kHz logarithmic) and Gain (-15dB to +15dB)
    ctx.strokeStyle = '#1D222E';
    ctx.lineWidth = 1;

    // Horizontal dB lines: -12, -6, 0, +6, +12
    const dbSteps = [-12, -6, 0, 6, 12];
    dbSteps.forEach((db) => {
      const y = h / 2 - (db / 15) * (h / 2 * 0.85);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      ctx.fillStyle = db === 0 ? '#FFDAB9' : '#4F586B';
      ctx.font = '8px "JetBrains Mono"';
      ctx.fillText(`${db > 0 ? `+${db}` : db}dB`, 4, y - 2);
    });

    // Vertical Frequency lines: 100Hz, 1kHz, 10kHz
    const freqs = [100, 1000, 10000];
    freqs.forEach((f) => {
      const x = (Math.log10(f / 20) / Math.log10(20000 / 20)) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      ctx.fillStyle = '#4F586B';
      ctx.font = '8px "JetBrains Mono"';
      ctx.fillText(f >= 1000 ? `${f / 1000}kHz` : `${f}Hz`, x + 4, h - 6);
    });

    // Draw Parametric Response Curve
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#E0FFFF');
    grad.addColorStop(0.5, '#FFDAB9');
    grad.addColorStop(1, '#FC8EAC');
    ctx.strokeStyle = grad;

    for (let x = 0; x < w; x += 3) {
      // Calculate summed gain from 5 bands
      const f = 20 * Math.pow(1000, x / w);
      let totalGainDb = 0;

      audioState.eqBands.forEach((band) => {
        const diff = Math.log10(f / band.freq);
        const bandGain = band.gain * Math.exp(-Math.pow(diff * band.q * 1.8, 2));
        totalGainDb += bandGain;
      });

      const y = h / 2 - (totalGainDb / 15) * (h / 2 * 0.85);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Interactive Node Handles
    audioState.eqBands.forEach((band) => {
      const x = (Math.log10(band.freq / 20) / Math.log10(20000 / 20)) * w;
      const y = h / 2 - (band.gain / 15) * (h / 2 * 0.85);

      const isSelected = band.id === selectedBandId;
      ctx.fillStyle = isSelected ? '#FC8EAC' : '#FFDAB9';
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#08090C';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#F5FFFA';
      ctx.font = '9px "JetBrains Mono"';
      ctx.fillText(`${band.id}`, x - 3, y - 8);
    });
  }, [audioState.eqBands, selectedBandId]);

  // Handle Dragging EQ node
  const handleEqCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest band node
    let closestId = 1;
    let minDist = 9999;
    audioState.eqBands.forEach((band) => {
      const bx = (Math.log10(band.freq / 20) / Math.log10(20000 / 20)) * canvas.width;
      const by = canvas.height / 2 - (band.gain / 15) * (canvas.height / 2 * 0.85);
      const d = Math.hypot(bx - x, by - y);
      if (d < minDist) {
        minDist = d;
        closestId = band.id;
      }
    });

    if (minDist < 30) {
      setSelectedBandId(closestId);
      setIsDraggingNode(true);
    }
  };

  const handleEqCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingNode) return;
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));

    // Convert x to frequency (20 to 20000 Hz)
    const freq = Math.round(20 * Math.pow(1000, x / canvas.width));
    // Convert y to gain (-15 to +15 dB)
    const gain = Math.round(((canvas.height / 2 - y) / (canvas.height / 2 * 0.85)) * 15);

    const activeBand = audioState.eqBands.find((b) => b.id === selectedBandId);
    if (activeBand) {
      onUpdateEqBand(selectedBandId, freq, Math.max(-15, Math.min(15, gain)), activeBand.q);
      audioEngine.updateFilterBand(selectedBandId, freq, gain, activeBand.q);
    }
  };

  const handleEqCanvasMouseUp = () => {
    setIsDraggingNode(false);
  };

  // Render Automated Lip-Sync Phoneme-to-Viseme Facial Mesh Canvas
  useEffect(() => {
    const canvas = visemeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090A0E';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 - 5;

    // Draw Cybernetic Head Contour Wireframe
    ctx.strokeStyle = 'rgba(224, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 65, 85, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#E0FFFF';
    ctx.fillRect(cx - 30, cy - 25, 14, 4);
    ctx.fillRect(cx + 16, cy - 25, 14, 4);

    // Nose bridge
    ctx.strokeStyle = '#4F586B';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx + 6, cy + 14);
    ctx.stroke();

    // Mouth Viseme Mesh reacting to current phoneme
    const jawOpen = activeVisemeObj.jawOpen * 25;
    const mouthWide = (activeVisemeObj.mouthWide - 0.5) * 35;
    const mouthPucker = activeVisemeObj.mouthPucker * 20;

    const mw = Math.max(12, 35 + mouthWide - mouthPucker);
    const mh = Math.max(3, 4 + jawOpen);

    // Mouth outer lips
    ctx.strokeStyle = '#FC8EAC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 38 + jawOpen * 0.3, mw, mh, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Mouth interior cavity
    ctx.fillStyle = '#1a0d18';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 38 + jawOpen * 0.3, mw - 2, mh - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth highlight if open
    if (jawOpen > 6) {
      ctx.fillStyle = '#F5FFFA';
      ctx.fillRect(cx - 8, cy + 34, 16, 3);
    }

    // Overlay Tag
    ctx.fillStyle = '#FFDAB9';
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillText(`PHONEME: [${activeVisemeObj.phoneme}] → VISEME: ${activeVisemeObj.viseme}`, 10, h - 8);
  }, [activeVisemeObj]);

  const activeBand = audioState.eqBands.find((b) => b.id === selectedBandId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] border-t border-[#232734] select-none text-xs font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12141C] border-b border-[#212634]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#FC8EAC] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#FC8EAC]" />
            MASTER AUDIO SUITE &amp; 808 SUB SCULPTOR
          </span>
          <span className="text-[#2E3444]">|</span>
          <span className="text-[#8E99A8]">DSP: 64-BIT PRECISION WEB AUDIO ENGINE</span>
        </div>

        {/* 808 Sub Trigger Test Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => audioEngine.trigger808Bass(50, audioState.sub808Decay, audioState.sub808Drive)}
            className="px-3 py-1 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(252,142,172,0.35)]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>TRIGGER 808 SUB-BASS HIT</span>
          </button>
        </div>
      </div>

      {/* Main Grid: EQ curve + 808 Shaping + Spatial Pan + Lip-Sync Mapper */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden items-stretch">
        {/* Parametric EQ Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-[#08090C] border border-[#232734] rounded-xs p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#1E232F] text-[11px]">
            <span className="text-[#E0FFFF] font-bold">5-BAND PARAMETRIC EQUALIZER</span>
            <span className="text-[#8E99A8]">CLICK &amp; DRAG NODES TO SCULPT</span>
          </div>

          <div className="relative flex-1 min-h-[160px] bg-[#050608] border border-[#1A1E29] rounded-xs overflow-hidden">
            <canvas
              ref={eqCanvasRef}
              width={540}
              height={180}
              onMouseDown={handleEqCanvasMouseDown}
              onMouseMove={handleEqCanvasMouseMove}
              onMouseUp={handleEqCanvasMouseUp}
              className="w-full h-full cursor-crosshair"
            />
          </div>

          {/* Active Band Parameter Controls */}
          {activeBand && (
            <div className="grid grid-cols-3 gap-2 pt-1 bg-[#11141B] p-2 border border-[#212635] rounded-xs text-[11px]">
              <div>
                <span className="text-[#8E99A8] block">BAND {activeBand.id} FREQ</span>
                <span className="text-[#E0FFFF] font-bold">{activeBand.freq} Hz</span>
              </div>
              <div>
                <span className="text-[#8E99A8] block">GAIN</span>
                <span className="text-[#FFDAB9] font-bold">{activeBand.gain > 0 ? `+${activeBand.gain}` : activeBand.gain} dB</span>
              </div>
              <div>
                <span className="text-[#8E99A8] block">Q FACTOR: {activeBand.q.toFixed(1)}</span>
                <input
                  type="range"
                  min="0.3"
                  max="4.0"
                  step="0.1"
                  value={activeBand.q}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    onUpdateEqBand(activeBand.id, activeBand.freq, activeBand.gain, q);
                    audioEngine.updateFilterBand(activeBand.id, activeBand.freq, activeBand.gain, q);
                  }}
                  className="w-full accent-[#FC8EAC] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 808 Sub Shaping & Spatial Surround (3 cols) */}
        <div className="lg:col-span-3 flex flex-col bg-[#11141A] border border-[#232734] rounded-xs p-3 space-y-3 overflow-y-auto">
          <div className="text-[11px] font-bold text-[#FFDAB9] pb-1 border-b border-[#212634] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#FFDAB9]" />
            808 SUB-BASS SHAPING
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>SUB DECAY ENVELOPE</span>
              <span className="text-[#FFDAB9]">{audioState.sub808Decay.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={audioState.sub808Decay}
              onChange={(e) => onChangeAudioState({ sub808Decay: Number(e.target.value) })}
              className="w-full accent-[#FFDAB9] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
              <span>SATURATION / DRIVE</span>
              <span className="text-[#FC8EAC]">{(audioState.sub808Drive * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioState.sub808Drive}
              onChange={(e) => onChangeAudioState({ sub808Drive: Number(e.target.value) })}
              className="w-full accent-[#FC8EAC] cursor-pointer"
            />
          </div>

          {/* DTS / Dolby 360 Spatial Surround Radar */}
          <div className="pt-2 border-t border-[#212634]">
            <div className="text-[11px] font-bold text-[#E0FFFF] pb-1 flex items-center justify-between">
              <span>DTS SPATIAL 360 PAN</span>
              <span className="text-[10px] text-[#8E99A8]">{audioState.spatialX}%</span>
            </div>

            <div className="relative w-full h-24 bg-[#08090C] border border-[#222736] rounded-xs flex items-center justify-center p-2">
              {/* Radar rings */}
              <div className="w-20 h-20 rounded-full border border-[#262E3E] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-[#1E2533]" />
              </div>

              {/* Sound stage interactive emitter */}
              <div
                className="absolute w-3.5 h-3.5 bg-[#E0FFFF] rounded-full shadow-[0_0_8px_#E0FFFF] cursor-pointer transition-transform"
                style={{
                  transform: `translate(${audioState.spatialX * 0.4}px, ${audioState.spatialY * 0.4}px)`,
                }}
              />
            </div>

            <div className="pt-1.5">
              <input
                type="range"
                min="-100"
                max="100"
                value={audioState.spatialX}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChangeAudioState({ spatialX: val });
                  audioEngine.updateSpatialPan(val);
                }}
                className="w-full accent-[#E0FFFF] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Automated Lip-Sync Phoneme-to-Viseme Mesh Mapper (3 cols) */}
        <div className="lg:col-span-3 flex flex-col bg-[#11141A] border border-[#232734] rounded-xs p-3 space-y-2">
          <div className="text-[11px] font-bold text-[#E0FFFF] pb-1 border-b border-[#212634] flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-[#E0FFFF]" />
            LIP-SYNC VISEME MESH MAPPER
          </div>

          {/* Facial mesh canvas */}
          <div className="relative flex-1 min-h-[160px] bg-[#07080B] border border-[#1F2533] rounded-xs overflow-hidden">
            <canvas ref={visemeCanvasRef} width={260} height={180} className="w-full h-full" />
          </div>

          {/* Dialogue / Speech Text Input */}
          <div className="pt-1">
            <label className="text-[10px] text-[#8E99A8] block mb-0.5">VOICE PHONEME TEXT</label>
            <input
              type="text"
              value={testSpeechText}
              onChange={(e) => setTestSpeechText(e.target.value)}
              className="w-full bg-[#08090C] border border-[#222736] p-1.5 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
