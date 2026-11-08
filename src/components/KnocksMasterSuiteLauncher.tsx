import React, { useState } from 'react';
import {
  Volume2,
  Image,
  Film,
  UploadCloud,
  Box,
  Flame,
  Sparkles,
  Database,
  Search,
  ExternalLink,
  Zap,
  Play,
  Layers,
  ShieldCheck,
  Cpu,
  Radio,
  FileText,
  Sliders,
  CheckCircle,
  FolderSync,
  Network,
  Share2,
  Gamepad2,
  Dna,
  Bot,
} from 'lucide-react';
import { MediaMedium, NchAppTile } from '../types';

interface KnocksMasterSuiteLauncherProps {
  onLaunchApp: (tile: NchAppTile) => void;
  onSelectMedium: (medium: MediaMedium) => void;
  onOpenTierModal: () => void;
  onExecuteCommand: (cmd: string) => void;
}

const KNOCKS_TILES: NchAppTile[] = [
  // 1. SOUND N (AUDIO)
  {
    id: 'knocks_wave',
    name: 'KnocksWave Sound Editor',
    subTitle: 'KNOCKSWAVE EDITOR',
    description: 'Precision waveform editing, spectral noise reduction, 808 sub bass synthesis, and high-frequency harmonic restoration.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Volume2',
    targetMedium: 'audio',
    actionId: 'launch_knockswave',
    badge: 'PRO DSP',
  },
  {
    id: 'knocks_mix',
    name: 'KnocksMix Multi-Track Studio',
    subTitle: 'KNOCKSMIX STUDIO',
    description: 'Unlimited multi-track music production, sovereign 808 bass sculpting, and multi-stem bus routing.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Sliders',
    targetMedium: 'audio',
    actionId: 'launch_knocksmix',
    badge: 'MULTI-TRACK',
  },
  {
    id: 'knocks_switch',
    name: 'KnocksSwitch Format Converter',
    subTitle: 'FORMAT CONVERTER',
    description: 'Instant batch conversion between 32-bit float WAV, FLAC, MP3, AAC, and uncompressed broadcast PCM.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Zap',
    targetMedium: 'audio',
    actionId: 'launch_knocksswitch',
    badge: 'LOSSLESS',
  },
  {
    id: 'knocks_voice',
    name: 'KnocksVoice Audio Studio',
    subTitle: 'VOICE RECORDER',
    description: 'High-definition vocal, Foley, and narration capture with automated sovereign noise gate.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Radio',
    targetMedium: 'audio',
    actionId: 'launch_knocksvoice',
    badge: 'VOICE REC',
  },
  {
    id: 'knocks_burn',
    name: 'KnocksMaster Audio Burner',
    subTitle: 'MASTER BURNER',
    description: 'Master audio stems, DDP images, and lossless cinema tracks for studio archival distribution.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Flame',
    targetMedium: 'audio',
    actionId: 'launch_knocksburn',
  },
  {
    id: 'knocks_vst',
    name: 'KnocksVST Studio Rack & EQ',
    subTitle: 'VST RACK PLUG',
    description: 'Real-time parametric 5-band EQ, 808 sub sculptor, and DTS spatial surround 360 panner.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Sliders',
    targetMedium: 'audio',
    actionId: 'launch_knocksvst',
    badge: 'DSP RACK',
  },

  // 2. PICTURE STUDIO
  {
    id: 'knocks_photo',
    name: 'KnocksPhoto Matrix Editor',
    subTitle: 'PHOTO MATRIX',
    description: 'Layered compositing, masks, ACEScc color wheels, curves, and non-destructive cinema grading.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Image',
    targetMedium: 'picture',
    actionId: 'launch_knocksphoto',
    badge: '32-BIT RAW',
  },
  {
    id: 'knocks_stage',
    name: 'KnocksStage Slideshow Engine',
    subTitle: 'SLIDESHOW MAKER',
    description: 'Cinematic pan-zoom transitions, keyframed camera motions, and synchronized tempo cuts.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Film',
    targetMedium: 'picture',
    actionId: 'launch_knocksstage',
  },
  {
    id: 'knocks_batch',
    name: 'KnocksBatch Image Scaler',
    subTitle: 'IMAGE RESIZER',
    description: 'Process thousands of graphic and cinematic stills simultaneously with zero-copy Rust buffers.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Layers',
    targetMedium: 'picture',
    actionId: 'launch_knocksbatch',
  },
  {
    id: 'knocks_rig',
    name: 'KnocksAnimate Rigging Studio',
    subTitle: 'ANIMATE RIGGING',
    description: '2D/3D puppet rigging, vector kinematics, and motion graphics keyframing.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_knocksrig',
    badge: 'RIGGING',
  },
  {
    id: 'knocks_colorizer',
    name: 'KnocksColor B&W to 4K Colorizer',
    subTitle: 'B&W COLORIZER',
    description: 'Neural color restoration, Kodachrome vintage matrix, and noir high-contrast curves.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Sparkles',
    targetMedium: 'picture',
    actionId: 'launch_knockscolor',
    badge: 'AI MATRIX',
  },

  // 3. VIDEO PLUS STUDIO
  {
    id: 'knocks_padedit',
    name: 'KnocksPadEdit 4K/8K Editor',
    subTitle: 'PADEDIT 4K/8K',
    description: 'High-density cinema mastering for IMAX 1.43:1 and Cinemascope 2.39:1 multi-track pipelines.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_knockspadedit',
    badge: 'IMAX READY',
  },
  {
    id: 'knocks_cinema',
    name: 'KnocksCinema Pro NLE Workstation',
    subTitle: 'CINEMA PRO NLE',
    description: 'Multi-track timeline editing with dual-engine source/program monitors, razor cuts, and slip/slide.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Film',
    targetMedium: 'video',
    actionId: 'launch_knockscinema',
    badge: 'NLE MASTER',
  },
  {
    id: 'knocks_capture',
    name: 'KnocksCapture Screen & Cam',
    subTitle: 'VIDEO CAPTURE',
    description: 'Record live multi-camera feeds, virtual sets, and 60FPS WebGL game engine output.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Radio',
    targetMedium: 'video',
    actionId: 'launch_knockscapture',
  },
  {
    id: 'knocks_prism',
    name: 'KnocksPrism Video Transcoder',
    subTitle: 'PRISM CONVERTER',
    description: 'Hardware wire-speed ProRes 4444 XQ, DNxHR, H.265, and AV1 video encoding.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_knocksprism',
    badge: 'PRESETS',
  },

  // 4. 3D, GAMES & AVATARS
  {
    id: 'knocks_game_3d',
    name: 'KnocksCyber 3D Hero Battle Game',
    subTitle: '3D CYBER BATTLE',
    description: 'Playable 60FPS Three.js WebGL game shell fighting against Goku & Cyber Titans with low-occlusion UI and Web Audio FX.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Gamepad2',
    targetMedium: 'ai_battle',
    actionId: 'launch_game_3d',
    badge: '60FPS 3D GAME',
  },
  {
    id: 'knocks_bone_rig',
    name: 'KnocksRig Neural Bone Kinematics',
    subTitle: 'NEURAL RIGGING',
    description: 'Real-time skeletal bone tracking and mecha chassis character kinematics.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_bone_rig',
    badge: '3D KINEMATICS',
  },
  {
    id: 'knocks_pbr_skin',
    name: 'KnocksShaders Subsurface PBR',
    subTitle: 'SUBSURFACE PBR',
    description: 'Physical subsurface light scattering, clearcoat lacquer, and micro-vertex displacement.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Sparkles',
    targetMedium: 'mesh3d',
    actionId: 'launch_pbr_skin',
  },

  // 5. GRAPHICS & SHADERS
  {
    id: 'knocks_pyro',
    name: 'KnocksPyro Volumetric Pyrotechnics',
    subTitle: 'VOLUMETRIC PYRO',
    description: 'GPU-accelerated Navier-Stokes fluid simulations for ki blasts, thrusters, and cinematic explosions.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Flame',
    targetMedium: 'video',
    actionId: 'launch_pyro',
    badge: 'GPU FLUID',
  },
  {
    id: 'knocks_ocean',
    name: 'KnocksOcean Gerstner Waves',
    subTitle: 'GERSTNER WAVES',
    description: 'Trochoidal ocean wave displacement equations with foam crest generation and refraction.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Radio',
    targetMedium: 'mesh3d',
    actionId: 'launch_ocean',
  },

  // 6. AI, BIOSCIENCE & SCREENPLAY
  {
    id: 'knocks_bio_scout',
    name: 'KnocksBio Biomolecular & Protein Scout',
    subTitle: 'BIOMOLECULAR SCOUT',
    description: 'Interactive 3D molecular viewer with 4-band AlphaFold pLDDT confidence scale, ClinVar variants, and target pharmacophores.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'Dna',
    targetMedium: 'bioscience',
    actionId: 'launch_bio_scout',
    badge: 'SCIENCE ENGINE',
  },
  {
    id: 'knocks_ai_cinema',
    name: 'KnocksAI Cinema Multi-Modal Studio',
    subTitle: 'GEMINI AI STUDIO',
    description: 'Gemini 3.8 Flash chatbot, Omni 1.1 video generator, Lyria music composer, live voice, and grounding.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'Bot',
    targetMedium: 'gemini_ai',
    actionId: 'launch_ai_cinema',
    badge: 'MULTI-MODAL',
  },
  {
    id: 'knocks_storyboard',
    name: 'KnocksStory AI Storyboard & Beat Sheet',
    subTitle: 'STORYBOARD GENERATOR',
    description: 'Generate camera shot lists, director beats, dialogue lines, and visual framing prompts.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'FileText',
    targetMedium: 'content',
    actionId: 'launch_storyboard',
    badge: 'SCREENPLAY',
  },

  // 7. UPLOADS & REPOSITORY
  {
    id: 'knocks_drive',
    name: 'KnocksDrive Cloud Synchronizer',
    subTitle: 'CLOUD DRIVE MASTER',
    description: 'Automated backup to sovereign cloud nodes, Google Drive, and decentralized clusters.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'FolderSync',
    targetMedium: 'storage',
    actionId: 'launch_cloud_drive',
    badge: 'SYNC NODE',
  },
  {
    id: 'knocks_ingest',
    name: 'KnocksIngest Database Portal',
    subTitle: 'DATABASE INGEST',
    description: 'Automated disk sweeping, SQLite indexing, asset tagging, and metadata ingestion.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'Database',
    targetMedium: 'storage',
    actionId: 'launch_db_ingest',
    badge: 'SQL INGEST',
  },
  {
    id: 'knocks_rust_core',
    name: 'KnocksCore Rust Memory-Safe Engine',
    subTitle: 'RUST CORE KERNEL',
    description: 'Native SIMD-accelerated non-blocking NLE timeline math and borrow-checker memory safety.',
    category: 'repo',
    categoryLabel: 'SOVEREIGN REPO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_rust_core',
    badge: 'RUST / WASM',
  },
];

export const KnocksMasterSuiteLauncher: React.FC<KnocksMasterSuiteLauncherProps> = ({
  onLaunchApp,
  onSelectMedium,
  onOpenTierModal,
  onExecuteCommand,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [launchedTileId, setLaunchedTileId] = useState<string | null>(null);

  const CATEGORIES = [
    { id: 'all', label: 'ALL SUITE APPS (32+)' },
    { id: 'sound', label: 'SOUND N (AUDIO)' },
    { id: 'picture', label: 'PICTURE STUDIO' },
    { id: 'video', label: 'VIDEO PLUS STUDIO' },
    { id: 'avatar', label: '3D, GAMES & AVATARS' },
    { id: 'shaders', label: 'GRAPHICS & SHADERS' },
    { id: 'ai', label: 'AI, BIO & STORYBOARDS' },
    { id: 'upload', label: 'UPLOADS & DL' },
    { id: 'repo', label: 'SOVEREIGN REPO' },
  ];

  const filteredTiles = KNOCKS_TILES.filter((tile) => {
    const matchesCategory = selectedCategory === 'all' || tile.category === selectedCategory;
    const matchesSearch =
      tile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.subTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tile.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTileClick = (tile: NchAppTile) => {
    setLaunchedTileId(tile.id);
    onLaunchApp(tile);
    if (tile.targetMedium) {
      onSelectMedium(tile.targetMedium);
    }
    onExecuteCommand(`launch "${tile.name}" [category: ${tile.categoryLabel}]`);

    setTimeout(() => {
      setLaunchedTileId(null);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] select-none text-xs font-mono overflow-y-auto">
      {/* 1. HOLLYWOOD MOTiON PiCTURES OFFICIAL HEADER & BANNER */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#12141D] via-[#1A1D27] to-[#12141D] border-b border-[#252A38] shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-gradient-chrome uppercase">
                KNOCKSSTUDiOS™ ©
              </span>
              <span className="text-[11px] text-[#FFDAB9] border border-[#FFDAB9]/40 px-2 py-0.5 rounded-xs font-mono tracking-widest uppercase">
                HOLLYWOOD MOTiON PiCTURES
              </span>
            </div>
            <div className="text-[12px] text-[#E0FFFF] font-bold">
              KNOCKSSTUDiOS™ © MASTER SUITE LAUNCHER · 100% SOVEREIGN IN-HOUSE ENGINE
            </div>
            <div className="text-[11px] text-[#8E99A8]">
              (SOUND), PICTURE, VIDEO, 3D GAME, BIOMOLECULAR, AI &amp; SOVEREIGN RUST REPO
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#0C0E14] border border-[#232838] rounded-xs text-[11px] text-[#A6B0BE]">
              <span className="text-[#6D7787] block text-[9px]">STUDIO INITIALIZED</span>
              <span className="text-[#00F5D4] font-bold">RUST &amp; WASM MEMORY SAFE (0 LEAKS)</span>
            </div>

            <button
              onClick={onOpenTierModal}
              className="px-4 py-2 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold rounded-xs cursor-pointer shadow-[0_0_15px_rgba(255,218,185,0.35)] hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>[LAUNCH NOW]</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & DISPATCH BAR */}
      <div className="px-6 py-3 bg-[#11131A] border-b border-[#1E232F] sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6D7787]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH KNOCKSSTUDiOS SOVEREIGN MODULES..."
              className="w-full bg-[#08090D] border border-[#262B3A] pl-9 pr-3 py-2 text-[#F5FFFA] rounded-xs text-xs outline-none focus:border-[#FFDAB9] placeholder:text-[#6D7787]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8E99A8] hover:text-[#F5FFFA]"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8E99A8] shrink-0">
            <span>MODULES:</span>
            <span className="text-[#FFDAB9] font-bold">{filteredTiles.length} ACTIVE</span>
            <span className="text-[#3A4150]">·</span>
            <span className="text-[#00F5D4] font-bold">100% IN-HOUSE PROCEDURAL</span>
          </div>
        </div>

        {/* Category Navigation Ribbon */}
        <div className="max-w-7xl mx-auto mt-2.5 flex items-center gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#1E2333] text-[#FFDAB9] border border-[#FFDAB9]/40 font-bold shadow-sm'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#151822]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TILES GRID */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredTiles.map((tile) => {
            const isJustLaunched = launchedTileId === tile.id;

            return (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`p-3.5 rounded-xs border flex flex-col justify-between cursor-pointer transition-all duration-200 group ${
                  isJustLaunched
                    ? 'bg-[#1E2838] border-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.4)] scale-[1.02]'
                    : 'bg-[#12141C] border-[#222736] hover:border-[#FFDAB9]/70 hover:bg-[#161924] shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#FFDAB9] font-bold">
                      {tile.subTitle}
                    </span>
                    {tile.badge && (
                      <span className="text-[9px] text-[#00F5D4] border border-[#00F5D4]/40 px-1 py-0.2 rounded-xs">
                        {tile.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-[#F5FFFA] group-hover:text-[#FFDAB9] transition-colors leading-snug">
                    {tile.name}
                  </div>

                  <p className="text-[11px] text-[#8E99A8] leading-relaxed line-clamp-3">
                    {tile.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1C202C] flex items-center justify-between text-[10px]">
                  <span className="text-[#6D7787] uppercase truncate max-w-[140px]">
                    {tile.categoryLabel}
                  </span>

                  <button
                    className={`px-2.5 py-1 rounded-xs font-bold transition-all flex items-center gap-1 ${
                      isJustLaunched
                        ? 'bg-[#00F5D4] text-[#0A0A0A]'
                        : 'bg-[#1A1E29] text-[#E0FFFF] group-hover:bg-[#FFDAB9] group-hover:text-[#0A0A0A]'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{isJustLaunched ? 'RUNNING...' : 'LAUNCH'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. FOOTER */}
        <footer className="pt-6 pb-8 border-t border-[#212634] space-y-2 text-center text-[#8E99A8]">
          <div className="text-[11px] font-bold text-[#FFDAB9] tracking-wider uppercase">
            KNOCKSSTUDiOS™ © — HOLLYWOOD MOTiON PiCTURES
          </div>
          <p className="text-[11px] text-[#A6B0BE] max-w-2xl mx-auto leading-relaxed">
            ALL ASSETS, DSP KERNELS, THREE.JS SIMULATIONS &amp; PROCEDURAL AUDIO SYNTHESIZERS DEVELOPED IN-HOUSE UNDER SOVEREIGN STUDIO TRADEMARK PROTOCOLS.
          </p>
          <div className="text-[10px] text-[#6D7787] pt-1 font-mono">
            © 2024–2026 KNOCKSSTUDiOS™ © // HOLLYWOOD MOTiON PiCTURES · ALL RIGHTS RESERVED
          </div>
        </footer>
      </div>
    </div>
  );
};
