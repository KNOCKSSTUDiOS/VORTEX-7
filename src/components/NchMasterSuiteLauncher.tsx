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
} from 'lucide-react';
import { MediaMedium, NchAppTile } from '../types';

interface NchMasterSuiteLauncherProps {
  onLaunchApp: (tile: NchAppTile) => void;
  onSelectMedium: (medium: MediaMedium) => void;
  onOpenTierModal: () => void;
  onExecuteCommand: (cmd: string) => void;
}

const NCH_TILES: NchAppTile[] = [
  // 1. SOUND N (AUDIO)
  {
    id: 'wavepad',
    name: 'WavePad Sound Editor',
    subTitle: 'WAVEPAD EDITOR',
    description: 'Precision waveform editing, spectral noise reduction, and high-frequency harmonic restoration.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Volume2',
    targetMedium: 'audio',
    actionId: 'launch_wavepad',
    badge: 'PRO DSP',
  },
  {
    id: 'mixpad',
    name: 'MixPad Multi-Track Studio',
    subTitle: 'MIXPAD STUDIO',
    description: 'Unlimited multi-track music production, 808 bass synthesis, and stem separation.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Sliders',
    targetMedium: 'audio',
    actionId: 'launch_mixpad',
    badge: 'MULTI-TRACK',
  },
  {
    id: 'switch_audio',
    name: 'Switch Format Converter',
    subTitle: 'FORMAT CONVERTER',
    description: 'Instant batch conversion between MP3, WAV, FLAC, AAC, OGG, and broadcast PCM.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Zap',
    targetMedium: 'audio',
    actionId: 'launch_switch',
    badge: 'LOSSLESS',
  },
  {
    id: 'recordpad',
    name: 'RecordPad Voice Studio',
    subTitle: 'VOICE RECORDER',
    description: 'High-definition vocal, Foley, and narration capture with automated noise gate.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Radio',
    targetMedium: 'audio',
    actionId: 'launch_recordpad',
    badge: 'VOICE REC',
  },
  {
    id: 'express_burn',
    name: 'Express Burn Master',
    subTitle: 'EXPRESS BURN',
    description: 'Master audio, DDP images, and lossless cinema stems for archival distribution.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Flame',
    targetMedium: 'audio',
    actionId: 'launch_express_burn',
  },
  {
    id: 'vst_studio',
    name: 'VST Studio Rack & EQ',
    subTitle: 'VST STUDIO PLUG',
    description: 'Real-time parametric 5-band EQ, 808 sub sculptor, and DTS spatial surround panner.',
    category: 'sound',
    categoryLabel: 'SOUND N (AUDIO)',
    icon: 'Sliders',
    targetMedium: 'audio',
    actionId: 'launch_vst_rack',
    badge: 'DSP RACK',
  },

  // 2. PICTURE STUDIO
  {
    id: 'photopad',
    name: 'PhotoPad Image Editor',
    subTitle: 'PHOTOPAD EDITOR',
    description: 'Layered compositing, masks, ACEScc color wheels, curves, and non-destructive grading.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Image',
    targetMedium: 'picture',
    actionId: 'launch_photopad',
    badge: '32-BIT RAW',
  },
  {
    id: 'photostage',
    name: 'PhotoStage Slideshows',
    subTitle: 'SLIDESHOW MAKER',
    description: 'Cinematic pan-zoom transitions, keyframed camera motions, and synchronized beats.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Film',
    targetMedium: 'picture',
    actionId: 'launch_photostage',
  },
  {
    id: 'batch_resizer',
    name: 'Batch Image Resizer',
    subTitle: 'IMAGE RESIZER',
    description: 'Process thousands of graphic and cinematic stills simultaneously with GPU shaders.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Layers',
    targetMedium: 'picture',
    actionId: 'launch_batch_resizer',
  },
  {
    id: 'express_animate',
    name: 'Express Animate Rigging',
    subTitle: 'EXPRESS ANIMATE',
    description: '2D/3D puppet rigging, vector kinematics, and motion graphics keyframing.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_express_animate',
    badge: 'RIGGING',
  },
  {
    id: 'bw_restore',
    name: 'B&W to 4K Colorizer',
    subTitle: 'B&W COLORIZER',
    description: 'AI-powered neural color restoration and Technicolor/Kodachrome vintage film emulations.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Sparkles',
    targetMedium: 'picture',
    actionId: 'launch_bw_colorizer',
    badge: 'AI MATRIX',
  },
  {
    id: 'collage_creator',
    name: 'Collage Creator & Stitcher',
    subTitle: 'COLLAGE CREATOR',
    description: 'Custom multi-panel panoramic stitching and 360 world panel alignment.',
    category: 'picture',
    categoryLabel: 'PICTURE STUDIO',
    icon: 'Layers',
    targetMedium: 'picture',
    actionId: 'launch_collage',
  },

  // 3. VIDEO PLUS STUDIO
  {
    id: 'videopad',
    name: 'VideoPad Cinema Studio',
    subTitle: 'VIDEOPAD NLE',
    description: 'Intuitive multi-track timeline editing with Hollywood VFX and 3-point editing.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Film',
    targetMedium: 'video',
    actionId: 'launch_videopad',
    badge: 'NLE MASTER',
  },
  {
    id: 'padedit_8k',
    name: 'PadEdit 4K/8K Editor',
    subTitle: 'PADEDIT 4K/8K',
    description: 'High-density cinema mastering for IMAX 1.43:1 and Cinemascope 2.39:1 pipelines.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_padedit',
    badge: 'IMAX READY',
  },
  {
    id: 'debut_capture',
    name: 'Debut Video Capture',
    subTitle: 'VIDEO CAPTURE',
    description: 'Record multi-screen streams, game engine output, and HDMI camera capture cards.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Radio',
    targetMedium: 'video',
    actionId: 'launch_debut',
  },
  {
    id: 'prism_converter',
    name: 'Prism Video Converter',
    subTitle: 'VIDEO CONVERTER',
    description: 'Blazing ProRes 4444 XQ, DNxHR, H.265, and AV1 video encoding at hardware wire-speed.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_prism',
    badge: 'PRESETS',
  },
  {
    id: 'scribe_animator',
    name: 'Express Scribe Animator',
    subTitle: 'SCRIBE ANIMATOR',
    description: 'Storyboard beat animatics, whiteboard illustrations, and dynamic title cards.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'FileText',
    targetMedium: 'content',
    actionId: 'launch_scribe',
  },
  {
    id: 'clipjoiner',
    name: 'ClipJoiner Lossless Splice',
    subTitle: 'CLIPJOINER',
    description: 'Zero-re-encode concatenation of raw cinema footage with frame-accurate razor cuts.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Film',
    targetMedium: 'video',
    actionId: 'launch_clipjoiner',
  },
  {
    id: 'color_grade_master',
    name: 'Color Grading Suite & LUTs',
    subTitle: 'COLOR GRADING',
    description: '3-way Lift/Gamma/Gain color wheels, ACEScc transformations, and custom 3D LUT export.',
    category: 'video',
    categoryLabel: 'VIDEO PLUS STUDIO',
    icon: 'Sliders',
    targetMedium: 'picture',
    actionId: 'launch_color_grade',
    badge: 'ACES LUT',
  },

  // 4. UPLOADS & DOWNLOADS (TRANSFER & STORAGE)
  {
    id: 'cloud_drive',
    name: 'Cloud Drive Synchronizer',
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
    id: 'copper_ftp',
    name: 'Copper FTP Server Node',
    subTitle: 'COPPER FTP CLIENT',
    description: 'High-throughput FTP/SFTP server endpoint for multi-gigabyte cinema asset pipelines.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'UploadCloud',
    targetMedium: 'storage',
    actionId: 'launch_copper_ftp',
  },
  {
    id: 'express_zip',
    name: 'Express Zip Compressor',
    subTitle: 'EXPRESS ZIP',
    description: 'Ultra-fast multi-threaded tar, zip, 7z archiving, and cryptographic checksum validation.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'Box',
    targetMedium: 'storage',
    actionId: 'launch_express_zip',
  },
  {
    id: 'sqlite_ingest',
    name: 'Database Ingestion Portal',
    subTitle: 'SQLITE INGEST',
    description: 'Automated disk sweeping, SQLite indexing, asset tagging, and metadata ingestion.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'Database',
    targetMedium: 'storage',
    actionId: 'launch_sqlite_ingest',
    badge: 'SQL INGEST',
  },
  {
    id: 'ssl_tunnel',
    name: 'SSL / SFTP Secure Tunnel',
    subTitle: 'SSL / SFTP TUNNEL',
    description: 'End-to-end encrypted transfer tunnels with biometric and hardware signature tokens.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'ShieldCheck',
    targetMedium: 'storage',
    actionId: 'launch_ssl_tunnel',
  },
  {
    id: 'multi_thread_dl',
    name: 'Multi-Threaded Queue Buffer',
    subTitle: 'MULTI-THREAD DL',
    description: 'Parallelized multi-connection chunking to maximize transfer bandwidth.',
    category: 'upload',
    categoryLabel: 'UPLOADS & DL',
    icon: 'Zap',
    targetMedium: 'storage',
    actionId: 'launch_multithread_dl',
  },

  // 5. 3D & AVATAR SUITES
  {
    id: 'neural_bone',
    name: 'Neural Bone Rigging',
    subTitle: 'NEURAL RIGGING',
    description: 'Real-time skeletal bone tracking and Modern Warfare game-engine character kinematics.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_neural_rig',
    badge: '3D KINEMATICS',
  },
  {
    id: 'subsurface_pbr',
    name: 'Subsurface Skin PBR Shaders',
    subTitle: 'SUBSURFACE PBR',
    description: 'Physical subsurface light scattering, clearcoat lacquer, and micro-vertex displacement.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Sparkles',
    targetMedium: 'mesh3d',
    actionId: 'launch_pbr_skin',
    badge: 'PBR MASTER',
  },
  {
    id: 'cel_shaded',
    name: 'Cel-Shaded Comic Outlines',
    subTitle: 'CEL-SHADED OUTLINES',
    description: 'Real-time graphic novel ink shaders, halftone printing screens, and dynamic sketch edges.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Image',
    targetMedium: 'picture',
    actionId: 'launch_cel_shader',
  },
  {
    id: 'vector_stick',
    name: 'Vector Stick Rigging Studio',
    subTitle: 'VECTOR STICK RIGGING',
    description: 'Fast geometric stick and mechanical joint constraints for rapid visual choreography.',
    category: 'avatar',
    categoryLabel: '3D & AVATAR',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_vector_stick',
  },

  // 6. GRAPHICS & CYBER (SHADERS)
  {
    id: 'volumetric_pyro',
    name: 'Volumetric Pyrotechnics',
    subTitle: 'VOLUMETRIC PYRO',
    description: 'GPU-accelerated Navier-Stokes fluid simulations for explosions, thrusters, and embers.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Flame',
    targetMedium: 'video',
    actionId: 'launch_pyro',
    badge: 'GPU FLUID',
  },
  {
    id: 'gerstner_waves',
    name: 'Gerstner Ocean Waves',
    subTitle: 'GERSTNER WAVES',
    description: 'Trochoidal ocean wave displacement equations with foam crest generation and refraction.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Radio',
    targetMedium: 'mesh3d',
    actionId: 'launch_ocean_waves',
    badge: 'WAVE EQ',
  },
  {
    id: 'neon_bloom',
    name: 'Neon Bloom & Rain Reflections',
    subTitle: 'NEON BLOOM & RAIN',
    description: 'Cyberpunk wet-asphalt specular shaders with HDR glare and volumetric lens condensation.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Sparkles',
    targetMedium: 'video',
    actionId: 'launch_neon_bloom',
  },
  {
    id: 'megastructures',
    name: 'Orbital Megastructures 3D',
    subTitle: 'ORBITAL MEGASTRUCTURES',
    description: 'Procedural generation of monolithic space architectures and planetary rings.',
    category: 'shaders',
    categoryLabel: 'GRAPHICS & CYBER',
    icon: 'Box',
    targetMedium: 'mesh3d',
    actionId: 'launch_megastructures',
  },

  // 7. AI & STORYBOARDS
  {
    id: 'storyboard_gen',
    name: 'AI Storyboard & Beat Sheet',
    subTitle: 'STORYBOARD GENERATOR',
    description: 'Generate camera shot lists, director beats, dialogue lines, and visual framing prompts.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'FileText',
    targetMedium: 'content',
    actionId: 'launch_storyboard',
    badge: 'AI SCREENPLAY',
  },
  {
    id: 'ai_colorizer',
    name: 'Neural 4K Colorization',
    subTitle: 'B&W TO 4K COLOR',
    description: 'Deep neural frame-by-frame colorization with historical palette preservation.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'Image',
    targetMedium: 'picture',
    actionId: 'launch_ai_colorizer',
  },
  {
    id: 'text_to_video',
    name: 'Text-to-Video Synthesis Engine',
    subTitle: 'TEXT-TO-VIDEO ENGINE',
    description: 'Direct AI prompt-to-shot synthesis with camera choreography and timeline ingestion.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'Film',
    targetMedium: 'video',
    actionId: 'launch_text_to_video',
    badge: 'PRO SYNTH',
  },
  {
    id: 'mcp_hub',
    name: 'MCP Server Hub & LLM Mesh',
    subTitle: 'MCP SERVER HUB',
    description: 'Model Context Protocol endpoints connecting external tool chains, databases, and LLMs.',
    category: 'ai',
    categoryLabel: 'AI & STORYBOARDS',
    icon: 'Network',
    targetMedium: 'storage',
    actionId: 'launch_mcp_hub',
    badge: 'MCP PROTOCOL',
  },

  // 8. SOVEREIGN REPO & PIPELINES
  {
    id: 'asset_samples',
    name: 'Free Studio Asset Samples',
    subTitle: 'FREE ASSET SAMPLES',
    description: 'Curated 4K/8K B-roll clips, 808 sub hits, DTS audio stems, and 3D rig geometry.',
    category: 'repo',
    categoryLabel: 'SOVEREIGN REPO',
    icon: 'Box',
    targetMedium: 'video',
    actionId: 'launch_asset_samples',
  },
  {
    id: 'infinity_telemetry',
    name: 'Infinity Telemetry Node',
    subTitle: 'INFINITY TELEMETRY',
    description: 'Distributed supercluster load balancing, GPU thermal monitors, and queue diagnostics.',
    category: 'repo',
    categoryLabel: 'SOVEREIGN REPO',
    icon: 'Cpu',
    targetMedium: 'video',
    actionId: 'launch_infinity_telemetry',
    badge: 'TELEMETRY',
  },
  {
    id: 'tempest_timeline',
    name: 'Tempest Rust Timeline Engine',
    subTitle: 'TEMPEST RUST TIMELINE',
    description: 'Native SIMD-accelerated non-blocking NLE timeline math running in local WebAssembly.',
    category: 'repo',
    categoryLabel: 'SOVEREIGN REPO',
    icon: 'Zap',
    targetMedium: 'video',
    actionId: 'launch_tempest_rust',
    badge: 'RUST / WASM',
  },
  {
    id: 'licensing_desk',
    name: 'Hollywood Licensing & Support',
    subTitle: 'LICENSING & SUPPORT',
    description: 'Commercial licensing clearance, cryptographic identity certificates, and SLA desk.',
    category: 'repo',
    categoryLabel: 'SOVEREIGN REPO',
    icon: 'ShieldCheck',
    targetMedium: 'video',
    actionId: 'launch_licensing',
  },
];

export const NchMasterSuiteLauncher: React.FC<NchMasterSuiteLauncherProps> = ({
  onLaunchApp,
  onSelectMedium,
  onOpenTierModal,
  onExecuteCommand,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [launchedTileId, setLaunchedTileId] = useState<string | null>(null);

  const CATEGORIES = [
    { id: 'all', label: 'ALL SUITE APPS (40+)' },
    { id: 'sound', label: 'SOUND N (AUDIO)' },
    { id: 'picture', label: 'PICTURE STUDIO' },
    { id: 'video', label: 'VIDEO PLUS STUDIO' },
    { id: 'upload', label: 'UPLOADS & DL' },
    { id: 'avatar', label: '3D & AVATAR' },
    { id: 'shaders', label: 'GRAPHICS & CYBER' },
    { id: 'ai', label: 'AI & STORYBOARDS' },
    { id: 'repo', label: 'SOVEREIGN REPO' },
  ];

  const filteredTiles = NCH_TILES.filter((tile) => {
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
    onExecuteCommand(`nch launch "${tile.name}" [category: ${tile.categoryLabel}]`);

    setTimeout(() => {
      setLaunchedTileId(null);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] select-none text-xs font-mono overflow-y-auto">
      {/* 1. HOLLYWOOD MOTION PICTURES OFFICIAL HEADER & BANNER */}
      <div className="px-6 py-5 bg-gradient-to-r from-[#12141D] via-[#1A1D27] to-[#12141D] border-b border-[#252A38] shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-gradient-chrome">
                KNOCKSSTUDiOS
              </span>
              <span className="text-[11px] text-[#FFDAB9] border border-[#FFDAB9]/40 px-2 py-0.5 rounded-xs font-mono tracking-widest">
                HOLLYWOOD MOTiON PiCTURES
              </span>
            </div>
            <div className="text-[12px] text-[#E0FFFF] font-bold">
              KNOCKS MASTER SUITE · AUDIO, PICTURE, VIDEO PLUS &amp; UPLOADS
            </div>
            <div className="text-[11px] text-[#8E99A8]">
              (SOUND), PICTURE, VIDEO, UPLOADS, 3D, SHADERS, AI &amp; SOVEREIGN REPO
            </div>
          </div>

          {/* Quick Actions & Pipeline Node Status */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#0C0E14] border border-[#232838] rounded-xs text-[11px] text-[#A6B0BE]">
              <span className="text-[#6D7787] block text-[9px]">STUDIO INITIALIZED</span>
              <span className="text-[#E0FFFF] font-bold">CONNECTED TO LOCAL PIPELINE NODE</span>
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

      {/* 2. SEARCH & LIVE ASSET DISPATCH BAR */}
      <div className="px-6 py-3 bg-[#11131A] border-b border-[#1E232F] sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6D7787]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH KNOCKS SUITE &amp; STUDIO ASSETS..."
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
            <span>RESULTS:</span>
            <span className="text-[#FFDAB9] font-bold">{filteredTiles.length} SUITE MODULES</span>
            <span className="text-[#3A4150]">·</span>
            <span className="text-[#E0FFFF]">LOCAL DISK ZERO-BLOAT</span>
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

      {/* 3. MEGA TILES ARCHITECTURE GRID */}
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
                    ? 'bg-[#1E2838] border-[#E0FFFF] shadow-[0_0_20px_rgba(224,255,255,0.4)] scale-[1.02]'
                    : 'bg-[#12141C] border-[#222736] hover:border-[#FFDAB9]/70 hover:bg-[#161924] shadow-md'
                }`}
              >
                <div className="space-y-2">
                  {/* Top Bar: SubTitle & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#FFDAB9] font-bold">
                      {tile.subTitle}
                    </span>

                    {tile.badge && (
                      <span className="text-[9px] text-[#E0FFFF] border border-[#E0FFFF]/30 px-1 py-0.2 rounded-xs">
                        {tile.badge}
                      </span>
                    )}
                  </div>

                  {/* Tile Name */}
                  <div className="text-sm font-bold text-[#F5FFFA] group-hover:text-[#FFDAB9] transition-colors leading-snug">
                    {tile.name}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#8E99A8] leading-relaxed line-clamp-3">
                    {tile.description}
                  </p>
                </div>

                {/* Bottom Row: Category and Launch Action */}
                <div className="pt-3 mt-3 border-t border-[#1C202C] flex items-center justify-between text-[10px]">
                  <span className="text-[#6D7787] uppercase truncate max-w-[140px]">
                    {tile.categoryLabel}
                  </span>

                  <button
                    className={`px-2.5 py-1 rounded-xs font-bold transition-all flex items-center gap-1 ${
                      isJustLaunched
                        ? 'bg-[#E0FFFF] text-[#0A0A0A]'
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

        {/* 4. FRONT-END HOSTING & CONNECT DESK SECTION */}
        <div className="p-5 bg-[#12151E] border border-[#262C3D] rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#FC8EAC] font-mono tracking-wider font-bold block">
              FRONT-END HOSTING
            </span>
            <div className="text-sm font-bold text-[#F5FFFA]">
              SYNCHRONIZED WITH LOCAL WORKSPACE, INFINITY CORE &amp; MCP NODES
            </div>
            <p className="text-[11px] text-[#8E99A8]">
              Seamless local pipeline bridging to external Google Drive buffers, MCP servers, and social media export rails.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onExecuteCommand('tempest status --all')}
              className="px-3.5 py-2 bg-[#1A1F2C] hover:bg-[#252C3E] border border-[#2F374A] text-[#E0FFFF] rounded-xs cursor-pointer text-xs font-bold"
            >
              CONNECT DESK
            </button>
            <button
              onClick={onOpenTierModal}
              className="px-3.5 py-2 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] rounded-xs cursor-pointer text-xs font-bold"
            >
              LICENSING CLEARANCE
            </button>
          </div>
        </div>

        {/* 5. OFFICIAL HOLLYWOOD MOTION PICTURES COPYRIGHT & WATERMARK FOOTER */}
        <footer className="pt-6 pb-8 border-t border-[#212634] space-y-2 text-center text-[#8E99A8]">
          <div className="text-[11px] font-bold text-[#FFDAB9] tracking-wider uppercase">
            SUPPORT &amp; LICENSING
          </div>
          <p className="text-[11px] text-[#A6B0BE] max-w-2xl mx-auto leading-relaxed">
            KNOCKSSTUDiOS — HOLLYWOOD MOTiON PiCTURES HQ. ALL ASSETS PROTECTED UNDER STUDIO TRADEMARK PROTOCOLS. DIRECT INGESTION &amp; LICENSING SUPPORT.
          </p>
          <div className="text-[10px] text-[#6D7787] pt-1 font-mono">
            © 2024–2026 KNOCKSSTUDiOS — HOLLYWOOD MOTION PICTURES · PROTECTED UNDER INFINITY ENGINE
          </div>
        </footer>
      </div>
    </div>
  );
};
