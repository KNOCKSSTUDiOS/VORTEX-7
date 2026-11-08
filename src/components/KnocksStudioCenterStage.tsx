import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Film,
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Sparkles,
  Zap,
  Play,
  Pause,
  Sliders,
  Radio,
  Box,
  Flame,
  Search,
  Maximize2,
  ShieldCheck,
  FolderSync,
  ChevronRight,
  ChevronLeft,
  Camera,
  Send,
  Eye,
  CheckCircle2,
  Tv,
  Crosshair,
  Lock,
  Download,
} from 'lucide-react';
import { MediaMedium } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { useOwner } from '../context/OwnerContext';
import { usePWAInstall } from '../utils/usePWAInstall';

interface KnocksStudioCenterStageProps {
  onSelectMedium: (medium: MediaMedium) => void;
  onOpenGoogleDrive: () => void;
  onOpenIconModal: () => void;
  onOpenTierModal: () => void;
  onToggleImmersiveFullTile: () => void;
  onSwitchToProNLE: () => void;
  onExecuteCommand: (cmd: string) => void;
  onOpenPlatformModal?: () => void;
}

export const KnocksStudioCenterStage: React.FC<KnocksStudioCenterStageProps> = ({
  onSelectMedium,
  onOpenGoogleDrive,
  onOpenIconModal,
  onOpenTierModal,
  onToggleImmersiveFullTile,
  onSwitchToProNLE,
  onExecuteCommand,
  onOpenPlatformModal,
}) => {
  const { isOwnerMode, openAuthModal, openVault } = useOwner();
  const { isInstalled, install } = usePWAInstall();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeSoundCard, setActiveSoundCard] = useState<string>('WAVESTORM');
  const [activePictureCard, setActivePictureCard] = useState<string>('PHOTOMATRIX');
  const [activeVideoCard, setActiveVideoCard] = useState<string>('CINEMAPAD');
  const [activeUploadCard, setActiveUploadCard] = useState<string>('SYNC');

  // Interactive PFX states
  const [activePfx, setActivePfx] = useState<string | null>(null);

  // Hero Battle Cam states
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [heroMode, setHeroMode] = useState<'goku' | 'superman' | 'mecha' | 'cartoon_noir'>('goku');
  const [isChargingKi, setIsChargingKi] = useState<boolean>(false);
  const [isFiringLaser, setIsFiringLaser] = useState<boolean>(false);

  // Waveform canvas
  const waveformRef = useRef<HTMLCanvasElement | null>(null);
  const videoElemRef = useRef<HTMLVideoElement | null>(null);

  // Audio Play / Pause handler
  const handleToggleSound = () => {
    if (isPlayingAudio) {
      audioEngine.stopAmbientLoop();
      setIsPlayingAudio(false);
      onExecuteCommand('audio engine playback stopped');
    } else {
      audioEngine.startAmbientLoop();
      audioEngine.trigger808Bass(55, 1.2, 0.6);
      setIsPlayingAudio(true);
      onExecuteCommand('audio engine live synthesized playback online');
    }
  };

  // Play custom PFX sound
  const playPfx = (type: string) => {
    setActivePfx(type);
    onExecuteCommand(`PFX trigger: [${type}]`);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'goku_ki') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        audioEngine.trigger808Bass(45, 1.2, 0.7);
      } else if (type === 'superman_laser') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.8);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      } else {
        audioEngine.trigger808Bass(55, 1.0, 0.5);
      }
    } catch {
      // Audio fallback
    }
    setTimeout(() => setActivePfx(null), 1200);
  };

  // Waveform canvas animation
  useEffect(() => {
    let animId: number;
    const canvas = waveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const render = () => {
      offset += isPlayingAudio ? 0.08 : 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.beginPath();
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FFDAB9';
      ctx.shadowBlur = isPlayingAudio ? 14 : 4;

      for (let x = 0; x < width; x += 4) {
        const freq1 = Math.sin((x * 0.035) + offset) * (isPlayingAudio ? 22 : 6);
        const freq2 = Math.cos((x * 0.07) - offset * 1.4) * (isPlayingAudio ? 14 : 3);
        const y = mid + freq1 + freq2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlayingAudio]);

  // Webcam toggle
  const toggleCam = async () => {
    if (isCamActive) {
      if (videoElemRef.current && videoElemRef.current.srcObject) {
        const stream = videoElemRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoElemRef.current.srcObject = null;
      }
      setIsCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoElemRef.current) {
          videoElemRef.current.srcObject = stream;
        }
        setIsCamActive(true);
      } catch {
        setIsCamActive(true);
      }
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090C] text-[#F5FFFA] font-sans select-none overflow-y-auto">
      {/* =========================================================================
          1. HEADER (Exact match to user HTML with branding KNOCKSSTUDiOS)
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0C0E14]/95 border-b border-[#212635] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row items-baseline gap-3 text-center sm:text-left">
          <h1
            onClick={() => scrollTo('home')}
            className="text-2xl sm:text-3xl font-black tracking-wider text-cinema-3d cursor-pointer hover:brightness-125 transition-all uppercase"
          >
            KNOCKSSTUDiOS
          </h1>
          <p className="text-xs text-[#FFDAB9] font-mono tracking-widest border border-[#FFDAB9]/40 px-2 py-0.5 rounded-xs">
            HOLLYWOOD MOTiON PiCTURES
          </p>
        </div>

        {/* User's exact Nav links */}
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono font-bold tracking-wider">
          <button
            onClick={() => scrollTo('home')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            HOME
          </button>
          <button
            onClick={() => scrollTo('sound')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            SOUND N
          </button>
          <button
            onClick={() => scrollTo('picture')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            PICTURE
          </button>
          <button
            onClick={() => scrollTo('video')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            VIDEO PLUS
          </button>
          <button
            onClick={() => scrollTo('upload')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            UPLOADS &amp; DL
          </button>
          <button
            onClick={() => scrollTo('repository')}
            className="px-2.5 py-1 text-[#8E99A8] hover:text-[#FFDAB9] hover:bg-[#141724] rounded-xs cursor-pointer transition-colors"
          >
            REPOSITORY
          </button>

          {/* Action button to switch to Pro NLE editor */}
          <button
            onClick={onSwitchToProNLE}
            className="ml-2 px-3 py-1 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-extrabold rounded-xs cursor-pointer shadow-[0_0_12px_rgba(255,218,185,0.35)] hover:brightness-110 flex items-center gap-1"
          >
            <Film className="w-3.5 h-3.5 fill-current" />
            <span>PRO NLE DOCK</span>
          </button>

          {/* Pro Enterprise Owner Gate */}
          {isOwnerMode ? (
            <button
              onClick={openVault}
              className="px-3 py-1 bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4] font-extrabold rounded-xs cursor-pointer shadow-[0_0_12px_rgba(0,245,212,0.3)] hover:brightness-110 flex items-center gap-1 tracking-wider uppercase text-[11px]"
              title="Open Pro Enterprise Executive Vault"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span>OWNER VAULT</span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-2.5 py-1 bg-[#141724] border border-[#FFDAB9]/40 text-[#FFDAB9] hover:bg-[#1D2235] font-extrabold rounded-xs cursor-pointer flex items-center gap-1 tracking-wider uppercase text-[11px]"
              title="Authenticate Owner Profile"
            >
              <Lock className="w-3.5 h-3.5 text-[#FFDAB9]" />
              <span>OWNER GATE</span>
            </button>
          )}

          {/* Native 1-Tap Phone & Desktop App Install Button */}
          {!isInstalled && (
            <button
              onClick={install}
              className="px-3 py-1 bg-gradient-to-r from-[#FEE440] to-[#FFA500] hover:brightness-110 text-black font-extrabold rounded-xs cursor-pointer shadow-[0_0_12px_rgba(254,228,64,0.3)] flex items-center gap-1.5 tracking-wider uppercase text-[11px]"
              title="Install KNOCKSSTUDiOS directly to Phone or Desktop (1-Tap)"
            >
              <Download className="w-3.5 h-3.5 fill-current" />
              <span>INSTALL APP (1-TAP)</span>
            </button>
          )}

          {onOpenPlatformModal && (
            <button
              onClick={onOpenPlatformModal}
              className="px-3 py-1 bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4] hover:bg-[#00F5D4]/30 font-extrabold rounded-xs cursor-pointer shadow-[0_0_12px_rgba(0,245,212,0.3)] hover:brightness-110 flex items-center gap-1 tracking-wider uppercase text-[11px]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>UNITY · PHONE · LAPTOP · STORE</span>
            </button>
          )}
        </nav>
      </header>

      {/* =========================================================================
          2. MAIN CONTENT (Structured directly according to user HTML sections)
         ========================================================================= */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-10">
        {/* =====================================================================
            SECTION 1: HERO INITIALIZED & SEARCH (Front face of the application)
           ===================================================================== */}
        <section
          id="home"
          className="relative bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 sm:p-10 text-center shadow-2xl backdrop-blur-md overflow-hidden space-y-6"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFDAB9]/10 via-transparent to-transparent pointer-events-none" />

          {/* Studio Initialized Status & Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1E2434] pb-5 text-xs font-mono">
            <div className="text-left">
              <h2 className="text-sm font-bold text-[#E0FFFF] tracking-wider uppercase flex items-center gap-2">
                <span>STUDIO INITIALIZED</span>
                <span className="px-1.5 py-0.2 bg-[#FC8EAC]/15 border border-[#FC8EAC]/50 text-[#FC8EAC] text-[9px] rounded-xs font-mono">
                  RUST &amp; WASM MEMORY SAFE
                </span>
              </h2>
              <p className="text-[#8E99A8] text-[11px] mt-0.5">High-performance Rust/WASM zero-copy asset layer verified (0 dangling pointers, 0 leaks).</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenTierModal}
                className="px-4 py-2 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-extrabold rounded-xs cursor-pointer shadow-[0_0_15px_rgba(255,218,185,0.4)] hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>[LAUNCH NOW]</span>
              </button>

              <button
                onClick={onSwitchToProNLE}
                className="px-3.5 py-2 bg-[#1A1F2C] hover:bg-[#252C3E] border border-[#2F374A] text-[#8E99A8] hover:text-[#F5FFFA] rounded-xs cursor-pointer"
              >
                [CLOSE]
              </button>
            </div>
          </div>

          {/* Hollywood Motion Pictures Presents & Mega Typography */}
          <div className="space-y-2 py-4">
            <p className="text-xs sm:text-sm font-mono font-extrabold tracking-[0.3em] text-[#FC8EAC] uppercase drop-shadow-[0_0_8px_rgba(252,142,172,0.6)]">
              HOLLYWOOD MOTiON PiCTURES PRESENTS
            </p>
            <p className="text-sm sm:text-base font-mono font-bold tracking-widest text-[#E0FFFF]">
              MASTER SUITE · AUDIO, PICTURE, VIDEO PLUS &amp; UPLOADS
            </p>
            <p className="text-[11px] font-mono tracking-wider text-[#8E99A8]">
              (SOUND), PICTURE, VIDEO, UPLOADS, 3D, SHADERS
            </p>

            <div className="py-4">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-cinema-3d uppercase">
                KNOCKSSTUDiOS
              </h1>
            </div>
          </div>

          {/* Search Box from user HTML */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              onExecuteCommand(`search across studio: "${searchQuery}"`);
              scrollTo('launcher-hero');
            }}
            className="w-full max-w-2xl mx-auto flex items-center bg-[#090B10] border-2 border-[#FF9800] rounded-full p-1.5 shadow-[0_0_25px_rgba(255,152,0,0.35)]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH STUDIO ASSETS &amp; PIPELINES..."
              className="flex-1 bg-transparent px-5 py-2 text-xs sm:text-sm text-[#F5FFFA] font-mono outline-none placeholder:text-[#6D7787]"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF9800] hover:bg-[#FFA726] text-[#0A0A0A] font-black text-xs font-mono rounded-full cursor-pointer shadow-md transition-all uppercase tracking-wider"
            >
              [SEARCH]
            </button>
          </form>

          {/* Direct Link to Sound N Studio */}
          <div className="pt-2 flex justify-center">
            <p>
              <button
                onClick={() => scrollTo('sound')}
                className="text-xs font-mono font-bold text-[#FFDAB9] hover:text-[#FC8EAC] tracking-widest cursor-pointer transition-colors border-b border-[#FFDAB9]/40 pb-0.5"
              >
                [OPEN SOUND N STUDIO]
              </button>
            </p>
          </div>
        </section>

        {/* =====================================================================
            SECTION 2: KNOCKSSTUDiOS // MASTER SUITE LAUNCHER (App Categories)
           ===================================================================== */}
        <section
          id="launcher-hero"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-[#1E2434] pb-3 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-[#FFDAB9]">
              KNOCKSSTUDiOS // MASTER SUITE LAUNCHER
            </h2>
            <span className="text-[10px] font-mono text-[#8E99A8]">32 SOVEREIGN MODULES</span>
          </div>

          {/* Grid of the 8 suites from user's HTML */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* 1. SOUND N (AUDIO) */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FF9800] tracking-wider border-b border-[#1E2333] pb-1">
                SOUND N (AUDIO)
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li
                  onClick={() => {
                    scrollTo('sound');
                    setActiveSoundCard('WAVESTORM');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · WaveStorm Sound Editor
                </li>
                <li
                  onClick={() => {
                    scrollTo('sound');
                    setActiveSoundCard('MIXVORTEX');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · MixVortex Multi-Track Studio
                </li>
                <li
                  onClick={() => {
                    scrollTo('sound');
                    setActiveSoundCard('SWITCH');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Switch Format Converter
                </li>
                <li
                  onClick={() => {
                    scrollTo('sound');
                    setActiveSoundCard('RECORDPAD');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · RecordPad Voice Studio
                </li>
              </ul>
            </div>

            {/* 2. PICTURE STUDIO */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FF9800] tracking-wider border-b border-[#1E2333] pb-1">
                PICTURE STUDIO
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li
                  onClick={() => {
                    scrollTo('picture');
                    setActivePictureCard('PHOTOMATRIX');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · PhotoMatrix Image Editor
                </li>
                <li
                  onClick={() => {
                    scrollTo('picture');
                    setActivePictureCard('PHOTOSTAGE');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · PhotoStage Slideshows
                </li>
                <li
                  onClick={() => {
                    scrollTo('picture');
                    setActivePictureCard('BATCH');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Batch Image Resizer
                </li>
                <li
                  onClick={() => {
                    scrollTo('picture');
                    setActivePictureCard('ANIMATE');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Express Animate Rigging
                </li>
              </ul>
            </div>

            {/* 3. VIDEO PLUS STUDIO */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FF9800] tracking-wider border-b border-[#1E2333] pb-1">
                VIDEO PLUS STUDIO
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li
                  onClick={() => {
                    scrollTo('video');
                    setActiveVideoCard('CINEMAPAD');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · PadEdit 4K/8K Editor
                </li>
                <li
                  onClick={() => {
                    scrollTo('video');
                    setActiveVideoCard('DEBUT');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Debut Video Capture
                </li>
                <li
                  onClick={() => {
                    scrollTo('video');
                    setActiveVideoCard('PRISM');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Prism Video Converter
                </li>
                <li
                  onClick={() => {
                    scrollTo('video');
                    setActiveVideoCard('CINEMAPAD');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · CinemaPad Studio
                </li>
              </ul>
            </div>

            {/* 4. UPLOADS & DOWNLOADS */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FF9800] tracking-wider border-b border-[#1E2333] pb-1">
                UPLOADS &amp; DOWNLOADS
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li onClick={onOpenGoogleDrive} className="hover:text-[#FFDAB9] cursor-pointer">
                  · Cloud Drive Synchronizer
                </li>
                <li
                  onClick={() => {
                    scrollTo('upload');
                    setActiveUploadCard('FTP');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Copper FTP Server Node
                </li>
                <li
                  onClick={() => {
                    scrollTo('upload');
                    setActiveUploadCard('ZIP');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Express Zip Compressor
                </li>
                <li
                  onClick={() => {
                    scrollTo('upload');
                    setActiveUploadCard('DB');
                  }}
                  className="hover:text-[#FFDAB9] cursor-pointer"
                >
                  · Database Ingestion Portal
                </li>
              </ul>
            </div>

            {/* 5. 3D & AVATAR SUITES */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#E0FFFF] tracking-wider border-b border-[#1E2333] pb-1">
                3D &amp; AVATAR SUITES
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li onClick={() => scrollTo('hero-battle')} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Neural Bone Rigging
                </li>
                <li onClick={() => scrollTo('hero-battle')} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Subsurface Skin PBR
                </li>
                <li onClick={() => scrollTo('hero-battle')} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Cel-Shaded Outlines
                </li>
                <li onClick={() => scrollTo('hero-battle')} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Vector Stick Rigging
                </li>
              </ul>
            </div>

            {/* 6. GRAPHICS & CYBER */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#E0FFFF] tracking-wider border-b border-[#1E2333] pb-1">
                GRAPHICS &amp; CYBER
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li onClick={() => onToggleImmersiveFullTile()} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Volumetric Pyrotechnics
                </li>
                <li onClick={() => onToggleImmersiveFullTile()} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Gerstner Ocean Waves
                </li>
                <li onClick={() => onToggleImmersiveFullTile()} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Neon Bloom &amp; Rain
                </li>
                <li onClick={() => onToggleImmersiveFullTile()} className="hover:text-[#E0FFFF] cursor-pointer">
                  · Orbital Megastructures
                </li>
              </ul>
            </div>

            {/* 7. AI & STORYBOARDS */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FC8EAC] tracking-wider border-b border-[#1E2333] pb-1">
                AI &amp; STORYBOARDS
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li onClick={() => scrollTo('video')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Storyboard Generator
                </li>
                <li onClick={() => scrollTo('picture')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · B&amp;W to 4K Colorization
                </li>
                <li onClick={() => scrollTo('video')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Text-to-Video Engine
                </li>
                <li onClick={() => scrollTo('hosting')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · MCP Server Hub
                </li>
              </ul>
            </div>

            {/* 8. SOVEREIGN REPO */}
            <div className="p-3.5 bg-[#0A0C12] border border-[#1E2333] rounded-xs space-y-2">
              <h3 className="text-xs font-bold text-[#FC8EAC] tracking-wider border-b border-[#1E2333] pb-1">
                SOVEREIGN REPO
              </h3>
              <ul className="space-y-1.5 text-[11px] text-[#A6B0BE]">
                <li onClick={onOpenIconModal} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Free Asset Samples
                </li>
                <li onClick={() => onExecuteCommand('telemetry status: online')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Infinity Telemetry
                </li>
                <li onClick={() => onExecuteCommand('Tempest Rust engine: 60fps')} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Tempest Rust Timeline
                </li>
                <li onClick={onOpenTierModal} className="hover:text-[#FC8EAC] cursor-pointer">
                  · Licensing &amp; Support
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: MULTI-TRACK AUDIO SUITE (SOUND N)
           ===================================================================== */}
        <section
          id="sound"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2434] pb-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FF9800] tracking-widest uppercase">
                MULTI-TRACK AUDIO SUITE
              </h3>
              <h4 className="text-lg sm:text-xl font-bold text-[#F5FFFA] tracking-wide mt-1">
                Master Audio Recording, Editing &amp; Mixing
              </h4>
              <p className="text-xs text-[#8E99A8] mt-1">
                Professional multi-track sound engineering, VST effects processing, and lossless format conversion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSound}
                className={`px-3.5 py-1.5 rounded-xs font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                  isPlayingAudio
                    ? 'bg-[#FF9800] text-[#0A0A0A] shadow-[0_0_15px_rgba(255,152,0,0.5)]'
                    : 'bg-[#1D2333] hover:bg-[#273046] text-[#E0FFFF] border border-[#34405A]'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingAudio ? 'PAUSE DSP' : 'PLAY 808 DSP'}</span>
              </button>

              <button
                onClick={() => onSelectMedium('audio')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] rounded-xs font-mono font-bold text-xs cursor-pointer hover:brightness-110"
              >
                OPEN PRO RACK
              </button>
            </div>
          </div>

          {/* Scrubber & Waveform visualizer */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-[#8E99A8] text-[11px]">
              <span className="text-[#FFDAB9]">0:00 ______</span>
              <span>LIVE 808 SYNTHESIZER OSCILLATOR</span>
            </div>
            <div className="h-16 bg-[#090B10] border border-[#1C212E] rounded-xs overflow-hidden relative flex items-center justify-center">
              <canvas ref={waveformRef} width={800} height={64} className="w-full h-full" />
            </div>
          </div>

          {/* The 6 Cards from User HTML */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              {
                id: 'WAVESTORM',
                tag: 'WAVESTORM',
                sub: 'WAVESTORM EDITOR',
                desc: 'Precision waveform editing & spectral noise reduction.',
                action: () => audioEngine.trigger808Bass(55, 1.2, 0.6),
              },
              {
                id: 'MIXVORTEX',
                tag: 'MIXVORTEX',
                sub: 'MIXVORTEX STUDIO',
                desc: 'Unlimited track multi-track music production.',
                action: () => audioEngine.triggerCinematicPulse(),
              },
              {
                id: 'SWITCH',
                tag: 'SWITCH',
                sub: 'FORMAT CONVERTER',
                desc: 'Convert MP3, WAV, FLAC, AAC instantly.',
                action: () => onExecuteCommand('format converter ready'),
              },
              {
                id: 'RECORDPAD',
                tag: 'RECORDPAD',
                sub: 'VOICE RECORDER',
                desc: 'High-definition vocal & narration capture.',
                action: () => onExecuteCommand('voice recorder initialized'),
              },
              {
                id: 'BURN',
                tag: 'BURN',
                sub: 'EXPRESS BURN',
                desc: 'Master audio and MP3 CDs with ease.',
                action: () => onExecuteCommand('master burn CD ready'),
              },
              {
                id: 'FX',
                tag: 'FX',
                sub: 'VST STUDIO PLUG',
                desc: 'Real-time reverb, EQ, and compression racks.',
                action: () => playPfx('goku_ki'),
              },
            ].map((card) => {
              const isActive = activeSoundCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setActiveSoundCard(card.id);
                    card.action();
                  }}
                  className={`p-3 rounded-xs border cursor-pointer transition-all relative ${
                    isActive
                      ? 'bg-[#1A202E] border-[#FF9800] shadow-[0_0_12px_rgba(255,152,0,0.3)]'
                      : 'bg-[#0E1118] border-[#222837] hover:border-[#38425A] hover:bg-[#131722]'
                  }`}
                >
                  {isActive && <div className="h-0.5 bg-[#FF9800] absolute top-0 left-0 right-0" />}
                  <h5 className="text-xs font-mono font-bold text-[#FF9800]">{card.tag}</h5>
                  <h6 className="text-[10px] font-mono font-bold text-[#F5FFFA] mt-0.5 truncate">
                    {card.sub}
                  </h6>
                  <p className="text-[9px] text-[#8E99A8] mt-1 line-clamp-2">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: IMAGE & GRAPHICS SUITE (PICTURE)
           ===================================================================== */}
        <section
          id="picture"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2434] pb-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FF9800] tracking-widest uppercase">
                IMAGE &amp; GRAPHICS SUITE
              </h3>
              <h4 className="text-lg sm:text-xl font-bold text-[#F5FFFA] tracking-wide mt-1">
                Professional Image Editing &amp; Slideshows
              </h4>
              <p className="text-xs text-[#8E99A8] mt-1">
                Advanced photo retouching, batch conversion, and cinematic slideshow production.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectMedium('picture')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] rounded-xs font-mono font-bold text-xs cursor-pointer hover:brightness-110"
              >
                OPEN COLOR WHEELS
              </button>
            </div>
          </div>

          <div className="flex justify-between text-[#8E99A8] text-[11px] font-mono">
            <span className="text-[#FFDAB9]">0:00 ______</span>
            <span>32-BIT RAW · ACEScc COLOR SCIENCE</span>
          </div>

          {/* The 6 Cards from User HTML */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              {
                id: 'PHOTOMATRIX',
                tag: 'PHOTOMATRIX',
                sub: 'PHOTOMATRIX EDITOR',
                desc: 'Layers, masks, filters, and color correction.',
              },
              {
                id: 'PHOTOSTAGE',
                tag: 'PHOTOSTAGE',
                sub: 'SLIDESHOW MAKER',
                desc: 'Cinematic transitions, music, and pan-zoom.',
              },
              {
                id: 'BATCH',
                tag: 'BATCH',
                sub: 'IMAGE RESIZER',
                desc: 'Process thousands of graphic files at once.',
              },
              {
                id: 'ANIMATE',
                tag: 'ANIMATE',
                sub: 'EXPRESS ANIMATE',
                desc: '2D/3D puppet rigging and motion graphics.',
              },
              {
                id: 'RESTORE',
                tag: 'RESTORE',
                sub: 'B&W COLORIZER',
                desc: 'AI-powered automatic vintage photo coloring.',
              },
              {
                id: 'COLLAGE',
                tag: 'COLLAGE',
                sub: 'COLLAGE CREATOR',
                desc: 'Custom layouts and panoramic stitching.',
              },
            ].map((card) => {
              const isActive = activePictureCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setActivePictureCard(card.id);
                    onExecuteCommand(`picture module loaded: ${card.sub}`);
                  }}
                  className={`p-3 rounded-xs border cursor-pointer transition-all relative ${
                    isActive
                      ? 'bg-[#1A202E] border-[#FF9800] shadow-[0_0_12px_rgba(255,152,0,0.3)]'
                      : 'bg-[#0E1118] border-[#222837] hover:border-[#38425A] hover:bg-[#131722]'
                  }`}
                >
                  {isActive && <div className="h-0.5 bg-[#FF9800] absolute top-0 left-0 right-0" />}
                  <h5 className="text-xs font-mono font-bold text-[#FF9800]">{card.tag}</h5>
                  <h6 className="text-[10px] font-mono font-bold text-[#F5FFFA] mt-0.5 truncate">
                    {card.sub}
                  </h6>
                  <p className="text-[9px] text-[#8E99A8] mt-1 line-clamp-2">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: CINEMA & CAPTURE SUITE (VIDEO PLUS)
           ===================================================================== */}
        <section
          id="video"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2434] pb-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FF9800] tracking-widest uppercase">
                CINEMA &amp; CAPTURE SUITE
              </h3>
              <h4 className="text-lg sm:text-xl font-bold text-[#F5FFFA] tracking-wide mt-1">
                High-Definition Video Editing &amp; Capture
              </h4>
              <p className="text-xs text-[#8E99A8] mt-1">
                Professional non-linear video editing, screen recording, and 4K/8K rendering pipelines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSwitchToProNLE}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] rounded-xs font-mono font-bold text-xs cursor-pointer hover:brightness-110 shadow-[0_0_12px_rgba(255,218,185,0.3)]"
              >
                OPEN PRO NLE DUAL MONITOR
              </button>
            </div>
          </div>

          <div className="flex justify-between text-[#8E99A8] text-[11px] font-mono">
            <span className="text-[#FFDAB9]">0:00 ______</span>
            <span>IMAX 1.43:1 &amp; CINEMASCOPE 2.39:1 TIMELINES</span>
          </div>

          {/* The 6 Cards from User HTML */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              {
                id: 'CINEMAPAD',
                tag: 'CINEMAPAD',
                sub: 'CINEMAPAD NLE',
                desc: 'Intuitive timeline editing with Hollywood VFX.',
              },
              {
                id: 'DEBUT',
                tag: 'DEBUT',
                sub: 'VIDEO CAPTURE',
                desc: 'Record webcam, screen, and game streams.',
              },
              {
                id: 'PRISM',
                tag: 'PRISM',
                sub: 'VIDEO CONVERTER',
                desc: 'Convert AVI, MP4, MKV, MOV at blazing speed.',
              },
              {
                id: 'EXPRESS',
                tag: 'EXPRESS',
                sub: 'SCRIBE ANIMATOR',
                desc: 'Whiteboard animation and tutorial maker.',
              },
              {
                id: 'SPLICE',
                tag: 'SPLICE',
                sub: 'CLIPJOINER',
                desc: 'Seamless lossless video merging.',
              },
              {
                id: 'GRADE',
                tag: 'GRADE',
                sub: 'COLOR GRADING',
                desc: 'Advanced LUTs and cinematic grading.',
              },
            ].map((card) => {
              const isActive = activeVideoCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setActiveVideoCard(card.id);
                    onExecuteCommand(`video module loaded: ${card.sub}`);
                  }}
                  className={`p-3 rounded-xs border cursor-pointer transition-all relative ${
                    isActive
                      ? 'bg-[#1A202E] border-[#FF9800] shadow-[0_0_12px_rgba(255,152,0,0.3)]'
                      : 'bg-[#0E1118] border-[#222837] hover:border-[#38425A] hover:bg-[#131722]'
                  }`}
                >
                  {isActive && <div className="h-0.5 bg-[#FF9800] absolute top-0 left-0 right-0" />}
                  <h5 className="text-xs font-mono font-bold text-[#FF9800]">{card.tag}</h5>
                  <h6 className="text-[10px] font-mono font-bold text-[#F5FFFA] mt-0.5 truncate">
                    {card.sub}
                  </h6>
                  <p className="text-[9px] text-[#8E99A8] mt-1 line-clamp-2">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: HERO BATTLE & CAMERA FX (GOKU vs SUPERMAN LIVE STAGE)
           ===================================================================== */}
        <section
          id="hero-battle"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2434] pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FC8EAC] tracking-widest uppercase">
                3D &amp; AVATAR SUITES · HERO BATTLE CAM
              </h3>
              <h4 className="text-lg font-bold text-[#F5FFFA] tracking-wide mt-1">
                Record Yourself Fighting Goku or Superman
              </h4>
              <p className="text-xs text-[#8E99A8] mt-1">
                Live facial mesh tracking, golden Super Saiyan Ki aura, Kryptonian laser eyes, and 2D cartoon cel-shaders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleCam}
                className={`px-3.5 py-1.5 rounded-xs font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                  isCamActive
                    ? 'bg-[#E62E43] text-[#FFFFFF] shadow-[0_0_12px_rgba(230,46,67,0.5)]'
                    : 'bg-[#1C2333] hover:bg-[#283248] text-[#E0FFFF] border border-[#34425E]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCamActive ? 'STOP CAM' : 'START LIVE CAM'}</span>
              </button>

              <button
                onMouseDown={() => {
                  setIsChargingKi(true);
                  playPfx('goku_ki');
                }}
                onMouseUp={() => setIsChargingKi(false)}
                className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#FFE55C] text-[#0A0A0A] font-extrabold text-xs font-mono rounded-xs cursor-pointer shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              >
                GOKU KI AURA
              </button>

              <button
                onMouseDown={() => {
                  setIsFiringLaser(true);
                  playPfx('superman_laser');
                }}
                onMouseUp={() => setIsFiringLaser(false)}
                className="px-3.5 py-1.5 bg-[#FF0033] hover:bg-[#FF3355] text-[#FFFFFF] font-extrabold text-xs font-mono rounded-xs cursor-pointer shadow-[0_0_10px_rgba(255,0,51,0.5)]"
              >
                SUPERMAN LASER
              </button>
            </div>
          </div>

          <div className="h-60 bg-[#050608] border border-[#222837] rounded-xs relative overflow-hidden flex items-center justify-center">
            <video
              ref={videoElemRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${isCamActive ? 'opacity-85' : 'hidden'}`}
            />
            {!isCamActive && (
              <div className="text-center space-y-1 z-10 font-mono">
                <Tv className="w-8 h-8 text-[#6D7787] mx-auto animate-pulse" />
                <div className="text-xs font-bold text-[#FFDAB9]">BATTLE ARENA READY</div>
                <div className="text-[10px] text-[#8E99A8]">Click [START LIVE CAM] to fight against Goku / Superman</div>
              </div>
            )}
            {heroMode === 'goku' && (
              <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${isChargingKi ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/25 via-[#FFA500]/15 to-transparent animate-pulse" />
                <div className="absolute top-3 left-3 bg-[#0A0C14]/80 border border-[#FFD700] px-2 py-0.5 text-[10px] font-mono text-[#FFD700]">
                  GOKU SUPER SAIYAN AURA
                </div>
              </div>
            )}
            {isFiringLaser && (
              <div className="absolute top-1/2 left-0 right-0 h-3 bg-gradient-to-r from-[#FF0033] via-[#FFAA00] to-[#FFFFFF] shadow-[0_0_25px_#FF0033] animate-pulse pointer-events-none" />
            )}
          </div>
        </section>

        {/* =====================================================================
            SECTION 7: TRANSFER & STORAGE SUITE (UPLOADS & DOWNLOADS)
           ===================================================================== */}
        <section
          id="upload"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-6 shadow-xl space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2434] pb-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#FF9800] tracking-widest uppercase">
                TRANSFER &amp; STORAGE SUITE
              </h3>
              <h4 className="text-lg sm:text-xl font-bold text-[#F5FFFA] tracking-wide mt-1">
                Secure File Transfer, Cloud Sync &amp; Storage
              </h4>
              <p className="text-xs text-[#8E99A8] mt-1">
                Fast FTP file transfers, encrypted cloud synchronization, and local database ingestion.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenGoogleDrive}
                className="px-4 py-2 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-extrabold text-xs font-mono rounded-xs cursor-pointer shadow-[0_0_12px_rgba(255,218,185,0.35)] hover:brightness-110 flex items-center gap-1.5"
              >
                <FolderSync className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>BROWSE GOOGLE DRIVE</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between text-[#8E99A8] text-[11px] font-mono">
            <span className="text-[#FFDAB9]">0:00 ______</span>
            <span>SOVEREIGN DECENTRALIZED PIPELINE</span>
          </div>

          {/* The 6 Cards from User HTML */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {[
              {
                id: 'FTP',
                tag: 'FTP',
                sub: 'COPPER FTP CLIENT',
                desc: 'Reliable remote server upload and download.',
              },
              {
                id: 'SYNC',
                tag: 'SYNC',
                sub: 'CLOUD DRIVE MASTER',
                desc: 'Automated backup to sovereign cloud nodes.',
              },
              {
                id: 'ZIP',
                tag: 'ZIP',
                sub: 'EXPRESS ZIP',
                desc: 'Fast archiving, compression, and extraction.',
              },
              {
                id: 'DB',
                tag: 'DB',
                sub: 'SQLITE INGEST',
                desc: 'Local drive sweeping and database archival.',
              },
              {
                id: 'SECURE',
                tag: 'SECURE',
                sub: 'SSL / SFTP TUNNEL',
                desc: 'Encrypted transfer protocols for credentials.',
              },
              {
                id: 'SPEED',
                tag: 'SPEED',
                sub: 'MULTI-THREAD DL',
                desc: 'Maximized bandwidth connection queues.',
              },
            ].map((card) => {
              const isActive = activeUploadCard === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setActiveUploadCard(card.id);
                    if (card.id === 'SYNC') onOpenGoogleDrive();
                    onExecuteCommand(`storage module: ${card.sub}`);
                  }}
                  className={`p-3 rounded-xs border cursor-pointer transition-all relative ${
                    isActive
                      ? 'bg-[#1A202E] border-[#FF9800] shadow-[0_0_12px_rgba(255,152,0,0.3)]'
                      : 'bg-[#0E1118] border-[#222837] hover:border-[#38425A] hover:bg-[#131722]'
                  }`}
                >
                  {isActive && <div className="h-0.5 bg-[#FF9800] absolute top-0 left-0 right-0" />}
                  <h5 className="text-xs font-mono font-bold text-[#FF9800]">{card.tag}</h5>
                  <h6 className="text-[10px] font-mono font-bold text-[#F5FFFA] mt-0.5 truncate">
                    {card.sub}
                  </h6>
                  <p className="text-[9px] text-[#8E99A8] mt-1 line-clamp-2">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            SECTION 8: FRONT-END HOSTING & CONNECT DESK
           ===================================================================== */}
        <section
          id="hosting"
          className="bg-[#10131C]/90 border border-[#242A3B] rounded-xs p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-lg"
        >
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-[10px] text-[#FC8EAC] font-bold tracking-widest uppercase">
              FRONT-END HOSTING
            </p>
            <p className="text-sm font-bold text-[#F5FFFA]">
              SYNCHRONIZED WITH LOCAL WORKSPACE &amp; FIREBASE NODES
            </p>
          </div>

          <div>
            <button
              onClick={() => onExecuteCommand('telemetry connect desk: online')}
              className="px-4 py-2 bg-[#1A1F2C] hover:bg-[#252C3E] border border-[#2F374A] text-[#E0FFFF] font-bold rounded-xs cursor-pointer shadow-sm"
            >
              CONNECT DESK
            </button>
          </div>
        </section>
      </main>

      {/* =========================================================================
          3. FOOTER (Exact spelling KNOCKSSTUDiOS with lowercase 'i' & 2024-2026)
         ========================================================================= */}
      <footer className="mt-12 border-t border-[#212635] bg-[#0A0C11] py-8 px-6 text-center text-xs font-mono text-[#8E99A8] space-y-3">
        <p className="text-[11px] font-bold text-[#FFDAB9] tracking-widest uppercase">
          SUPPORT &amp; LICENSING
        </p>
        <p className="max-w-2xl mx-auto leading-relaxed text-[#A6B0BE]">
          KNOCKSSTUDiOS — HOLLYWOOD MOTiON PiCTURES HQ. ALL ASSETS PROTECTED UNDER STUDIO TRADEMARK PROTOCOLS. DIRECT INGESTION &amp; LICENSING SUPPORT.
        </p>
        <p>
          <button
            onClick={() => scrollTo('home')}
            className="text-[11px] text-[#E0FFFF] hover:text-[#FFDAB9] cursor-pointer transition-colors border-b border-[#E0FFFF]/30 pb-0.5"
          >
            BACK TO TOP
          </button>
        </p>
        <p className="text-[10px] text-[#6D7787] pt-2">
          © 2024–2026 KNOCKSSTUDiOS — HOLLYWOOD MOTiON PiCTURES · PROTECTED UNDER INFINITY ENGINE
        </p>
      </footer>
    </div>
  );
};
