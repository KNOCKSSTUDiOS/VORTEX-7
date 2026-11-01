import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Crop,
  Maximize,
  Compass,
  Radio,
  Eye,
  Sliders,
  Sparkles,
  Camera,
  Film,
  ZoomIn,
} from 'lucide-react';
import { AspectRatioType, ColorGradeState } from '../types';

interface DualMonitorWorkspaceProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  aspectRatio: AspectRatioType;
  onChangeAspectRatio: (ar: AspectRatioType) => void;
  colorGrade: ColorGradeState;
  currentPlayheadSec: number;
  onSeek: (sec: number) => void;
  sourceClipTitle?: string;
  programClipTitle?: string;
  onInsertClip: () => void;
  onOverwriteClip: () => void;
}

export const DualMonitorWorkspace: React.FC<DualMonitorWorkspaceProps> = ({
  isPlaying,
  onTogglePlay,
  aspectRatio,
  onChangeAspectRatio,
  colorGrade,
  currentPlayheadSec,
  onSeek,
  sourceClipTitle = 'RAW_SYNTH_TAKE_01 [4K]',
  programClipTitle = 'MASTER_SEQUENCE_NLE [IMAX 1.43:1]',
  onInsertClip,
  onOverwriteClip,
}) => {
  const [activeScope, setActiveScope] = useState<'none' | 'vectorscope' | 'rgb_parade' | 'histogram'>('vectorscope');
  const [world360Mode, setWorld360Mode] = useState<boolean>(false);
  const [markInSec, setMarkInSec] = useState<number>(0.0);
  const [markOutSec, setMarkOutSec] = useState<number>(4.5);
  const [pan360Angle, setPan360Angle] = useState<number>(0);

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const programCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Format timecode (HH:MM:SS:FF) assuming 24 fps
  const formatTimecode = (sec: number) => {
    const totalFrames = Math.floor(sec * 24);
    const ff = String(totalFrames % 24).padStart(2, '0');
    const ss = String(Math.floor(sec) % 60).padStart(2, '0');
    const mm = String(Math.floor(sec / 60) % 60).padStart(2, '0');
    const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
    return `${hh}:${mm}:${ss}:${ff}`;
  };

  // Aspect ratio dimensions CSS
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'imax_1.43':
        return 'aspect-[1.43/1] max-w-[500px]';
      case 'cinemascope_2.39':
        return 'aspect-[2.39/1] max-w-[620px]';
      case 'portrait_9_16':
        return 'aspect-[9/16] max-h-[380px]';
      case 'standard_16_9':
      default:
        return 'aspect-[16/9] max-w-[560px]';
    }
  };

  // Render Source Monitor Canvas
  useEffect(() => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderSource = () => {
      animId = requestAnimationFrame(renderSource);
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic scene render
      ctx.fillStyle = '#08090C';
      ctx.fillRect(0, 0, w, h);

      // Cyber grid background
      ctx.strokeStyle = 'rgba(224, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated Cyber Hologram Drone Wireframe
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.sin(t * 0.4) * 0.15);

      // Hologram ring
      ctx.strokeStyle = '#FFDAB9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 30, t * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Core sphere
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
      grad.addColorStop(0, 'rgba(252, 142, 172, 0.9)');
      grad.addColorStop(0.5, 'rgba(224, 255, 255, 0.4)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.fill();

      // Targeting crosshairs
      ctx.strokeStyle = '#E0FFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(-15, -15, 30, 30);
      ctx.beginPath();
      ctx.moveTo(-25, 0); ctx.lineTo(25, 0);
      ctx.moveTo(0, -25); ctx.lineTo(0, 25);
      ctx.stroke();

      ctx.restore();

      // Overlay text
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillStyle = '#E0FFFF';
      ctx.fillText('SOURCE FEED // CAM_01 [4K RAW]', 12, 20);
      ctx.fillStyle = '#FFDAB9';
      ctx.fillText(`ISO 800 · 1/48s · T1.8 · ${aspectRatio.toUpperCase()}`, 12, h - 14);
    };
    renderSource();

    return () => cancelAnimationFrame(animId);
  }, [aspectRatio]);

  // Render Program Monitor Canvas (Master Output with Color Grade & Pencil Sketch applied)
  useEffect(() => {
    const canvas = programCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = currentPlayheadSec;

    const renderProgram = () => {
      animId = requestAnimationFrame(renderProgram);
      const w = canvas.width;
      const h = canvas.height;

      // Apply 360 World Pan if active
      ctx.save();
      if (world360Mode) {
        ctx.translate((pan360Angle % w), 0);
      }

      // Base background
      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, w, h);

      // Cinematic Horizon & Cityscape synthesis
      const horizonY = h * 0.62;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#090c14');
      skyGrad.addColorStop(0.5, '#151624');
      skyGrad.addColorStop(1, '#2c1926');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Bioluminescent Sun / Flare
      const sunX = w * 0.65;
      const sunY = horizonY * 0.55;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 90);
      sunGrad.addColorStop(0, '#FFDAB9');
      sunGrad.addColorStop(0.3, 'rgba(252, 142, 172, 0.7)');
      sunGrad.addColorStop(0.8, 'rgba(224, 255, 255, 0.15)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Cyberpunk Skyline Silhouettes
      ctx.fillStyle = '#0B0D12';
      const buildingWidth = 32;
      for (let bx = 0; bx < w + 60; bx += buildingWidth) {
        const bh = Math.sin(bx * 0.05 + 1.2) * 50 + 70;
        ctx.fillRect(bx - 20, horizonY - bh, buildingWidth - 2, bh);

        // Building window luminescence
        ctx.fillStyle = (bx % 2 === 0) ? '#E0FFFF' : '#FC8EAC';
        ctx.fillRect(bx - 14, horizonY - bh + 10, 4, 15);
        ctx.fillStyle = '#0B0D12';
      }

      // Ground plane grid perspective
      ctx.fillStyle = '#08090D';
      ctx.fillRect(0, horizonY, w, h - horizonY);

      ctx.strokeStyle = 'rgba(255, 218, 185, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizonY);
        ctx.lineTo(i * 2 - w / 2, h);
        ctx.stroke();
      }

      // If Pencil-Sketch Mode is active on Program Monitor:
      if (colorGrade.pencilSketchMode) {
        ctx.fillStyle = 'rgba(245, 255, 250, 0.15)';
        for (let i = 0; i < 25; i++) {
          const sx = Math.random() * w;
          const sy = Math.random() * h;
          const len = colorGrade.pencilLineWeight * 12;
          ctx.strokeStyle = '#F5FFFA';
          ctx.lineWidth = colorGrade.pencilLineWeight;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + len, sy + len * 0.7);
          ctx.stroke();
        }
      }

      // If Vintage B&W conversion is active:
      if (colorGrade.bwConversion) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      // Safe Area Guides (Action Safe 90% / Title Safe 80%)
      ctx.strokeStyle = 'rgba(224, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
      ctx.strokeStyle = 'rgba(255, 218, 185, 0.2)';
      ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      ctx.setLineDash([]);

      // Center crosshair
      ctx.strokeStyle = '#FC8EAC';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 10, h / 2); ctx.lineTo(w / 2 + 10, h / 2);
      ctx.moveTo(w / 2, h / 2 - 10); ctx.lineTo(w / 2, h / 2 + 10);
      ctx.stroke();

      // IMAX Crop mask overlay indicator
      if (aspectRatio === 'imax_1.43') {
        ctx.fillStyle = '#E0FFFF';
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillText('IMAX 1.43:1 FULL APERTURE', 10, 16);
      } else if (aspectRatio === 'cinemascope_2.39') {
        ctx.fillStyle = '#FFDAB9';
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillText('CINEMASCOPE 2.39:1 ANAMORPHIC', 10, 16);
      }
    };
    renderProgram();

    return () => cancelAnimationFrame(animId);
  }, [aspectRatio, colorGrade, currentPlayheadSec, world360Mode, pan360Angle]);

  // Real-time Vectorscope / Scopes Canvas
  useEffect(() => {
    const canvas = scopeCanvasRef.current;
    if (!canvas || activeScope === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderScope = () => {
      animId = requestAnimationFrame(renderScope);
      t += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#08090C';
      ctx.fillRect(0, 0, w, h);

      if (activeScope === 'vectorscope') {
        // Polar vectorscope grid
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(cx, cy) - 10;

        ctx.strokeStyle = '#1F2633';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
        ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
        ctx.stroke();

        // Color target boxes (R, G, B, Cy, Mg, Yl)
        ctx.fillStyle = '#FFDAB9';
        ctx.font = '8px "JetBrains Mono"';
        ctx.fillText('R', cx + r * 0.6, cy - r * 0.4);
        ctx.fillText('B', cx - r * 0.5, cy + r * 0.5);
        ctx.fillText('G', cx - r * 0.6, cy - r * 0.5);
        ctx.fillText('Cy', cx - r * 0.3, cy - r * 0.6);
        ctx.fillText('Mg', cx + r * 0.4, cy + r * 0.5);

        // Simulated chrominance cloud reacting to color grade
        const saturationScale = colorGrade.saturation / 100;
        const tintOffset = colorGrade.tint * 0.2;
        const tempOffset = colorGrade.temperature * 0.2;

        ctx.fillStyle = 'rgba(224, 255, 255, 0.4)';
        for (let i = 0; i < 40; i++) {
          const angle = Math.sin(i * 3 + t) * Math.PI + (tempOffset * 0.05);
          const dist = (Math.cos(i * 7 + t * 0.5) * 0.5 + 0.5) * (r * 0.7) * saturationScale;
          const px = cx + Math.cos(angle) * dist + tintOffset;
          const py = cy + Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeScope === 'rgb_parade') {
        // 3 Vertical Parade Channels: R, G, B
        const colW = w / 3;
        const channels = [
          { name: 'RED', color: '#FF4D6D' },
          { name: 'GREEN', color: '#2EC4B6' },
          { name: 'BLUE', color: '#3A86FF' },
        ];

        channels.forEach((ch, idx) => {
          const startX = idx * colW;
          ctx.strokeStyle = '#1D212A';
          ctx.strokeRect(startX, 0, colW, h);

          ctx.fillStyle = ch.color;
          ctx.font = '8px "JetBrains Mono"';
          ctx.fillText(ch.name, startX + 4, 12);

          // Waveform traces
          ctx.beginPath();
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1;
          for (let x = 0; x < colW; x += 3) {
            const y = h * 0.5 + Math.sin(x * 0.2 + t + idx) * (h * 0.3) * (colorGrade.contrast / 100);
            if (x === 0) ctx.moveTo(startX + x, y);
            else ctx.lineTo(startX + x, y);
          }
          ctx.stroke();
        });
      } else if (activeScope === 'histogram') {
        // Luminance histogram
        ctx.fillStyle = '#FC8EAC';
        ctx.font = '8px "JetBrains Mono"';
        ctx.fillText('LUMINANCE HISTOGRAM', 6, 12);

        const bins = 40;
        const binW = w / bins;
        for (let i = 0; i < bins; i++) {
          const val = (Math.sin(i * 0.25 + t) * 0.5 + 0.5) * (h * 0.7);
          ctx.fillStyle = 'rgba(255, 218, 185, 0.4)';
          ctx.fillRect(i * binW, h - val, binW - 1, val);
        }
      }
    };
    renderScope();

    return () => cancelAnimationFrame(animId);
  }, [activeScope, colorGrade]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0B0E] border-b border-[#2A2E3B] select-none">
      {/* Top Workspace Header: Aspect Switcher & Scope Tools */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#12141A] border-b border-[#212530] text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[#8E99A8] flex items-center gap-1.5 font-bold">
            <Film className="w-3.5 h-3.5 text-[#FFDAB9]" />
            DUAL-MONITOR WORKSPACE
          </span>
          <span className="text-[#2F3543]">|</span>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-1 bg-[#0A0B0D] p-0.5 border border-[#262B36] rounded-xs">
            <button
              onClick={() => onChangeAspectRatio('imax_1.43')}
              className={`px-2 py-0.5 text-[11px] rounded-xs transition-colors cursor-pointer ${
                aspectRatio === 'imax_1.43'
                  ? 'bg-[#1E2330] text-[#E0FFFF] font-bold border border-[#E0FFFF]/30'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA]'
              }`}
            >
              IMAX 1.43:1
            </button>
            <button
              onClick={() => onChangeAspectRatio('cinemascope_2.39')}
              className={`px-2 py-0.5 text-[11px] rounded-xs transition-colors cursor-pointer ${
                aspectRatio === 'cinemascope_2.39'
                  ? 'bg-[#1E2330] text-[#FFDAB9] font-bold border border-[#FFDAB9]/30'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA]'
              }`}
            >
              CINEMASCOPE 2.39:1
            </button>
            <button
              onClick={() => onChangeAspectRatio('standard_16_9')}
              className={`px-2 py-0.5 text-[11px] rounded-xs transition-colors cursor-pointer ${
                aspectRatio === 'standard_16_9'
                  ? 'bg-[#1E2330] text-[#FC8EAC] font-bold border border-[#FC8EAC]/30'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA]'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => onChangeAspectRatio('portrait_9_16')}
              className={`px-2 py-0.5 text-[11px] rounded-xs transition-colors cursor-pointer ${
                aspectRatio === 'portrait_9_16'
                  ? 'bg-[#1E2330] text-[#8A2BE2] font-bold border border-[#8A2BE2]/30'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA]'
              }`}
            >
              9:16
            </button>
          </div>
        </div>

        {/* Right Tools: Scopes, 360 World Panel */}
        <div className="flex items-center gap-2">
          {/* Scope selector */}
          <div className="flex items-center gap-1 bg-[#0A0B0D] p-0.5 border border-[#262B36] rounded-xs text-[11px]">
            <button
              onClick={() => setActiveScope('vectorscope')}
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                activeScope === 'vectorscope' ? 'bg-[#1E2430] text-[#E0FFFF]' : 'text-[#8E99A8]'
              }`}
            >
              VECTORSCOPE
            </button>
            <button
              onClick={() => setActiveScope('rgb_parade')}
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                activeScope === 'rgb_parade' ? 'bg-[#1E2430] text-[#FFDAB9]' : 'text-[#8E99A8]'
              }`}
            >
              RGB PARADE
            </button>
            <button
              onClick={() => setActiveScope('histogram')}
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                activeScope === 'histogram' ? 'bg-[#1E2430] text-[#FC8EAC]' : 'text-[#8E99A8]'
              }`}
            >
              HISTOGRAM
            </button>
            <button
              onClick={() => setActiveScope('none')}
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                activeScope === 'none' ? 'bg-[#1E2430] text-[#A6B0BE]' : 'text-[#6D7787]'
              }`}
            >
              HIDE SCOPES
            </button>
          </div>

          {/* 360 World Panel Toggle */}
          <button
            onClick={() => setWorld360Mode(!world360Mode)}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] border rounded-xs cursor-pointer ${
              world360Mode
                ? 'bg-[#2B1B33] border-[#FC8EAC] text-[#FC8EAC]'
                : 'bg-[#14171E] border-[#2A2F3D] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Toggle 360 World Spherical Panoramic Panel"
          >
            <Compass className="w-3 h-3" />
            <span>360 WORLD</span>
          </button>
        </div>
      </div>

      {/* Center Dual Monitors Row */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden items-center">
        {/* Source Monitor (Left - 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-[#111319] border border-[#232733] rounded-xs overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1 bg-[#171A22] border-b border-[#252A36] text-[11px] font-mono">
            <span className="text-[#E0FFFF] font-semibold flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-[#E0FFFF]" />
              SOURCE: {sourceClipTitle}
            </span>
            <span className="text-[#8E99A8]">IN: {formatTimecode(markInSec)}</span>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 flex items-center justify-center p-2 bg-[#08090C] overflow-hidden">
            <div className={`w-full relative shadow-lg ${getAspectClass()}`}>
              <canvas
                ref={sourceCanvasRef}
                width={560}
                height={350}
                className="w-full h-full object-contain border border-[#1E232F]"
              />
            </div>
          </div>

          {/* Source 3-Point Editing Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#141720] border-t border-[#212633] text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMarkInSec(currentPlayheadSec)}
                className="px-2 py-0.5 bg-[#1B202B] hover:bg-[#252C3C] text-[#E0FFFF] border border-[#2D3546] rounded-xs cursor-pointer"
                title="Mark In [I]"
              >
                [I] MARK IN
              </button>
              <button
                onClick={() => setMarkOutSec(currentPlayheadSec + 3)}
                className="px-2 py-0.5 bg-[#1B202B] hover:bg-[#252C3C] text-[#FFDAB9] border border-[#2D3546] rounded-xs cursor-pointer"
                title="Mark Out [O]"
              >
                [O] MARK OUT
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onInsertClip}
                className="px-2.5 py-0.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs cursor-pointer"
                title="Insert clip to timeline at playhead [B]"
              >
                INSERT [B]
              </button>
              <button
                onClick={onOverwriteClip}
                className="px-2.5 py-0.5 bg-[#1E2330] hover:bg-[#283042] text-[#E0FFFF] border border-[#E0FFFF]/40 font-bold rounded-xs cursor-pointer"
                title="Overwrite timeline at playhead [N]"
              >
                OVERWRITE [N]
              </button>
            </div>
          </div>
        </div>

        {/* Program Monitor (Right - 7 Cols with optional floating scope) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-[#111319] border border-[#232733] rounded-xs overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1 bg-[#171A22] border-b border-[#252A36] text-[11px] font-mono">
            <span className="text-[#FFDAB9] font-semibold flex items-center gap-1.5">
              <Film className="w-3 h-3 text-[#FFDAB9]" />
              PROGRAM: {programClipTitle}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#FC8EAC] font-bold">TC: {formatTimecode(currentPlayheadSec)}</span>
              <span className="text-[#8E99A8]">24.000 FPS</span>
            </div>
          </div>

          {/* Program Canvas & Scopes container */}
          <div className="flex-1 flex items-center justify-center p-2 bg-[#07080B] relative overflow-hidden">
            <div className={`w-full relative shadow-xl ${getAspectClass()}`}>
              <canvas
                ref={programCanvasRef}
                width={640}
                height={400}
                className="w-full h-full object-contain border border-[#252C3B]"
              />

              {/* 360 Pan Drag Handle Overlay */}
              {world360Mode && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-[#0A0B0E]/80 border border-[#FC8EAC]/40 rounded text-[10px] font-mono text-[#FC8EAC]">
                  <span>PAN 360°: </span>
                  <input
                    type="range"
                    min="0"
                    max="640"
                    value={pan360Angle}
                    onChange={(e) => setPan360Angle(Number(e.target.value))}
                    className="w-20 align-middle ml-1 cursor-pointer accent-[#FC8EAC]"
                  />
                </div>
              )}
            </div>

            {/* Picture-in-picture Scopes Display */}
            {activeScope !== 'none' && (
              <div className="absolute bottom-3 right-3 w-44 h-32 bg-[#090A0E]/90 border border-[#2F3647] rounded-xs shadow-2xl p-1 z-10">
                <canvas ref={scopeCanvasRef} width={170} height={120} className="w-full h-full" />
              </div>
            )}
          </div>

          {/* Master Transport & Jog Controls */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#141720] border-t border-[#212633] text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSeek(Math.max(0, currentPlayheadSec - 1 / 24))}
                className="p-1 hover:bg-[#1E2330] text-[#A6B0BE] rounded-xs cursor-pointer"
                title="Step 1 Frame Back [Left Arrow]"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onTogglePlay}
                className="px-3 py-1 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(255,218,185,0.3)]"
                title="Play / Stop [Spacebar]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={() => onSeek(currentPlayheadSec + 1 / 24)}
                className="p-1 hover:bg-[#1E2330] text-[#A6B0BE] rounded-xs cursor-pointer"
                title="Step 1 Frame Forward [Right Arrow]"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timecode scrub slider */}
            <div className="flex-1 max-w-xs mx-4 flex items-center gap-2">
              <span className="text-[10px] text-[#6D7787]">00:00</span>
              <input
                type="range"
                min="0"
                max="60"
                step="0.04"
                value={currentPlayheadSec}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="w-full accent-[#FFDAB9] cursor-pointer"
              />
              <span className="text-[10px] text-[#6D7787]">01:00</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8E99A8]">
              <span className="px-2 py-0.5 bg-[#0D0F14] border border-[#212633] rounded-xs text-[#E0FFFF]">
                {formatTimecode(currentPlayheadSec)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
