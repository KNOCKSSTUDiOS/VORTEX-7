import React, { useEffect, useRef } from 'react';
import { Play, Sparkles, Cpu, ShieldCheck, ChevronRight, Layers, Volume2 } from 'lucide-react';
import { SubscriptionTierId } from '../types';
import { SUBSCRIPTION_TIERS } from '../utils/tierConfig';
import { audioEngine } from '../utils/audioEngine';

interface StartupSplashProps {
  onEnterStudio: () => void;
  currentTier: SubscriptionTierId;
  onOpenTierModal: () => void;
}

const GALLERY_PREVIEWS = [
  {
    title: 'CYBERPUNK HIGHWAY 2099',
    aspect: '2.39:1 CINEMASCOPE',
    medium: 'VIDEO RENDER',
    gradient: 'from-[#0A0A0A] via-[#1b1220] to-[#250d18]',
    accent: '#FC8EAC',
    tag: '4K HDR · 60 FPS',
  },
  {
    title: 'MECH INFANTRY RIG // LIFE-MESH',
    aspect: '1.43:1 IMAX',
    medium: '3D MESH TRACKING',
    gradient: 'from-[#0A0A0A] via-[#0f1f24] to-[#122e33]',
    accent: '#E0FFFF',
    tag: '128K VERTICES · PBR',
  },
  {
    title: 'NEO-TOKYO 808 SUB HARMONICS',
    aspect: 'DTS SPATIAL 360',
    medium: 'AUDIO SYNTHESIS',
    gradient: 'from-[#0A0A0A] via-[#24170d] to-[#362013]',
    accent: '#FFDAB9',
    tag: '5-BAND EQ · 45Hz SUB',
  },
  {
    title: 'OBSIDIAN SKETCH // VINTAGE COLOR',
    aspect: 'CREYA MATRIX',
    medium: 'PICTURE STYLIZER',
    gradient: 'from-[#0A0A0A] via-[#1d152b] to-[#2c133b]',
    accent: '#8A2BE2',
    tag: 'SOBEL HATCH · KODACHROME',
  },
];

export const StartupSplash: React.FC<StartupSplashProps> = ({
  onEnterStudio,
  currentTier,
  onOpenTierModal,
}) => {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tier = SUBSCRIPTION_TIERS[currentTier];

  // 24/7 Live Shuffling Gallery background rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % GALLERY_PREVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Ambient Audio Visualizer on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      audioEngine.getByteFrequencyData(freqData);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / freqData.length;

      for (let i = 0; i < freqData.length; i++) {
        const val = freqData[i] / 255;
        const barHeight = val * (height * 0.85);

        // Pearlescent bioluminescent gradient
        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, 'rgba(252, 142, 172, 0.15)');
        grad.addColorStop(0.5, 'rgba(255, 218, 185, 0.4)');
        grad.addColorStop(1, 'rgba(224, 255, 255, 0.85)');

        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1.5, barHeight);

        // Highlight cap
        ctx.fillStyle = '#E0FFFF';
        ctx.fillRect(i * barWidth, height - barHeight - 2, barWidth - 1.5, 1.5);
      }
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleLaunch = () => {
    audioEngine.triggerCinematicPulse();
    onEnterStudio();
  };

  const preview = GALLERY_PREVIEWS[activeSlide];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0A0A0A] text-[#F5FFFA] overflow-hidden select-none">
      {/* Dynamic Background Gallery Layer */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
        <div className={`absolute inset-0 bg-gradient-to-br ${preview.gradient} opacity-75`} />
        {/* Subtle Cybernetic Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(224,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(224,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0A0A0A_95%)]" />
      </div>

      {/* Top Metallic Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#2A2D34] bg-[#0E1014]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E0FFFF] via-[#FFDAB9] to-[#FC8EAC] flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(255,218,185,0.3)]">
            <div className="w-full h-full bg-[#0A0A0A] rounded-xs flex items-center justify-center font-bold text-xs tracking-tighter text-[#E0FFFF]">
              KS
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-gradient-chrome">
                KNOCKSSTUDiOS
              </span>
              <span className="text-[10px] tracking-widest text-[#FFDAB9] font-mono border border-[#FFDAB9]/30 px-1.5 py-0.2 rounded-xs">
                CINEMA &amp; FX
              </span>
            </div>
            <div className="text-[11px] text-[#A6B0BE] tracking-tight font-mono">
              LOCAL-FIRST DUAL ENGINE · TEMPEST PIPELINE · INFINITY CORE
            </div>
          </div>
        </div>

        {/* Telemetry quick badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#16181D] border border-[#2D313B] rounded">
            <Cpu className="w-3.5 h-3.5 text-[#E0FFFF]" />
            <span className="text-[#A6B0BE]">SMART-ROUTER:</span>
            <span className="text-[#E0FFFF] font-semibold">ACTIVE (Rust/WASM)</span>
          </div>

          <button
            onClick={onOpenTierModal}
            className="flex items-center gap-2 px-3 py-1 bg-[#1C1F26] border border-[#FFDAB9]/40 rounded hover:border-[#FFDAB9] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFDAB9]" />
            <span className="text-[#A6B0BE]">TIER:</span>
            <span className="text-[#FFDAB9] font-semibold">{tier.badge}</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Gallery Showcase */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Studio Pitch & Enter CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#181A20] border border-[#FC8EAC]/30 rounded-xs text-xs font-mono text-[#FC8EAC]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE ULTIMATE DUAL-ENGINE AI CINEMA WORKSTATION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-gradient-pearlescent">
              DIRECT. SYNTHESIZE. MASTER.
            </h1>

            <p className="text-[#A6B0BE] text-base leading-relaxed max-w-xl">
              Equipped with simultaneous Generator and Pro Editor pairs across <strong>Video (IMAX/Cinemascope)</strong>,{' '}
              <strong>Master Audio &amp; 808 Sub Sculptor</strong>, <strong>Creya Picture Matrix</strong>,{' '}
              <strong>3D Life-Mesh Viewport</strong>, and <strong>Protectionist Script &amp; Storyboard</strong>.
            </p>

            {/* Launch Action Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunch}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold text-sm tracking-wider uppercase rounded-xs transition-all duration-300 hover:shadow-[0_0_25px_rgba(252,142,172,0.45)] flex items-center gap-3 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>ENTER KNOCKSSTUDiOS WORKSPACE</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenTierModal}
                className="px-5 py-4 bg-[#16181D] border border-[#3A404F] hover:border-[#E0FFFF]/60 text-xs font-mono tracking-wide text-[#F5FFFA] rounded-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#E0FFFF]" />
                <span>CRYPTOGRAPHIC ACCESS &amp; TIERS</span>
              </button>
            </div>

            {/* Micro specs indicator */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#262A34] text-xs font-mono">
              <div>
                <span className="text-[#6D7787] block text-[10px]">PIPELINE ENGINE</span>
                <span className="text-[#E0FFFF] font-semibold">TEMPEST_STUDiO v4.2</span>
              </div>
              <div>
                <span className="text-[#6D7787] block text-[10px]">ROUTING ACCELERATION</span>
                <span className="text-[#FFDAB9] font-semibold">Rust / WASM eframe</span>
              </div>
              <div>
                <span className="text-[#6D7787] block text-[10px]">COMPLIANCE</span>
                <span className="text-[#FC8EAC] font-semibold">Zero-Bloat / Local First</span>
              </div>
            </div>
          </div>

          {/* Right Column: 24/7 Live Shuffling Display Reel Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded bg-[#13151A] border border-[#2E3340] shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Metallic Card Bevel Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1D24] border-b border-[#2B303C] text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E0FFFF] animate-pulse" />
                  <span className="text-[#F5FFFA] font-semibold">LIVE ROTATING FEED</span>
                </div>
                <span className="text-[#FFDAB9] font-mono">{preview.medium}</span>
              </div>

              {/* Shuffling Screen Frame */}
              <div className="relative h-64 p-6 flex flex-col justify-between bg-gradient-to-b from-[#161920] to-[#0A0B0E]">
                <div className="flex justify-between items-start">
                  <span
                    className="text-xs font-mono px-2 py-0.5 border rounded-xs uppercase tracking-wider"
                    style={{ borderColor: preview.accent, color: preview.accent }}
                  >
                    {preview.aspect}
                  </span>
                  <span className="text-[11px] font-mono text-[#A6B0BE]">{preview.tag}</span>
                </div>

                {/* Animated graphic mockup */}
                <div className="space-y-2 my-auto text-center">
                  <div className="text-xl font-bold tracking-tight text-white">{preview.title}</div>
                  <div className="text-xs text-[#8E99A8] font-mono flex items-center justify-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#E0FFFF]" />
                    <span>DUAL-ENGINE REALTIME SYNTHESIS ACTIVE</span>
                  </div>
                </div>

                {/* Shuffling Indicators */}
                <div className="flex items-center justify-between pt-4 border-t border-[#252934] text-[10px] font-mono text-[#8E99A8]">
                  <span>SHUFFLE 24/7 · TEMPEST NODE</span>
                  <div className="flex gap-1.5">
                    {GALLERY_PREVIEWS.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === activeSlide ? 'bg-[#FFDAB9] scale-125' : 'bg-[#2E3340]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ambient Audio Visualizer Ribbon */}
      <footer className="relative z-10 px-8 py-3 bg-[#0D0F13] border-t border-[#232731] flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-[#A6B0BE]">
          <Volume2 className="w-4 h-4 text-[#FFDAB9]" />
          <span>AMBIENT ENGINE VISUALIZER</span>
          <span className="text-[#6D7787]">|</span>
          <span className="text-[11px] text-[#E0FFFF]">48kHz 24-BIT DOLBY MASTERED</span>
        </div>

        {/* Realtime Canvas Visualizer */}
        <div className="w-72 h-8 bg-[#090A0D] border border-[#262A34] rounded-xs overflow-hidden px-1">
          <canvas ref={canvasRef} width={280} height={32} className="w-full h-full" />
        </div>

        <div className="text-[11px] font-mono text-[#6D7787]">
          KNOCKSSTUDiOS // KNOCKS CORE PIPELINE © 2026
        </div>
      </footer>
    </div>
  );
};
