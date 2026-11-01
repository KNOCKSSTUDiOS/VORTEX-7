import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Cpu,
  Video,
  Music,
  Image,
  Box,
  FileText,
  Sliders,
  Plus,
  Play,
  RotateCw,
  Zap,
  FolderOpen,
  Film,
} from 'lucide-react';
import { MediaMedium, TimelineClip } from '../types';

interface LeftToolDockProps {
  activeMedium: MediaMedium;
  onSynthesizeClip: (newClip: TimelineClip) => void;
  onSelectSourceClip: (title: string) => void;
}

export const LeftToolDock: React.FC<LeftToolDockProps> = ({
  activeMedium,
  onSynthesizeClip,
  onSelectSourceClip,
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'assets' | 'models'>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Form states for Video Generator
  const [videoPrompt, setVideoPrompt] = useState(
    'Hyper-detailed cyberpunk aerial flythrough over Neo-Kowloon neon megastructures, wet asphalt reflections, volumetric pearlescent fog'
  );
  const [cameraMove, setCameraMove] = useState('Orbital 360 Flythrough');
  const [lensChoice, setLensChoice] = useState('70mm IMAX 1.43:1 Prime');
  const [fpsChoice, setFpsChoice] = useState('60 FPS');
  const [styleMatrix, setStyleMatrix] = useState('Sci-Fi Brutalism');

  // Form states for Audio Generator
  const [audioPrompt, setAudioPrompt] = useState(
    'Heavy 808 sub-bass drop with punchy kick, metallic hi-hat roll, and dark cyberpunk cinematic drone'
  );
  const [audioBpm, setAudioBpm] = useState(128);
  const [audioKey, setAudioKey] = useState('D Minor');
  const [audioGenre, setAudioGenre] = useState('Cyberpunk Industrial 808');

  // Form states for Picture Generator
  const [picturePrompt, setPicturePrompt] = useState(
    'Bioluminescent pearlescent cybernetic helmet with brass pneumatic valves, studio rim lighting, 8k render'
  );
  const [pictureSeed, setPictureSeed] = useState(4829104);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  // Form states for 3D Mesh Generator
  const [meshModelType, setMeshModelType] = useState('Combat Drone Rig');
  const [polyBudget, setPolyBudget] = useState('64K Vertices (Game-Engine Ready)');
  const [lifeMeshTracking, setLifeMeshTracking] = useState(true);

  // Form states for Story & Script Generator
  const [storyPrompt, setStoryPrompt] = useState(
    'Act 1 Scene 3: The pilot encounters an encrypted beacon emitting unknown sub-bass harmonic frequencies in the asteroid belt.'
  );

  // Pre-loaded studio assets
  const ASSET_LIBRARY = [
    { title: 'CAM_A_NEO_KOWLOON_RAW.mov', duration: '6.2s', type: 'video', track: 'V1', color: '#3A86FF' },
    { title: 'DRONE_SURVEILLANCE_BROLL.mp4', duration: '4.0s', type: 'video', track: 'V2', color: '#00F5D4' },
    { title: 'SUB_808_CINEMATIC_DROP.wav', duration: '5.5s', type: 'audio', track: 'A2', color: '#FFDAB9' },
    { title: 'DIALOGUE_VO_PILOT_PHONEMES.wav', duration: '4.8s', type: 'audio', track: 'A1', color: '#FC8EAC' },
    { title: 'CYBER_HELMET_PBR_RIG.obj', duration: '—', type: 'mesh3d', track: 'V1', color: '#E0FFFF' },
    { title: 'OBSIDIAN_COLOR_MATRIX_LUT.cube', duration: '—', type: 'fx', track: 'FX', color: '#9B5DE5' },
  ];

  // Execute AI Synthesis
  const handleSynthesize = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);

          // Add synthetic clip to timeline
          const trackId =
            activeMedium === 'video'
              ? 'V1'
              : activeMedium === 'audio'
              ? 'A2'
              : activeMedium === 'picture'
              ? 'V2'
              : activeMedium === 'mesh3d'
              ? 'V1'
              : activeMedium === 'storage'
              ? 'FX'
              : 'LIP';

          const newClip: TimelineClip = {
            id: 'clip_' + Date.now(),
            trackId,
            title:
              activeMedium === 'video'
                ? `SYNTH_SHOT_${cameraMove.substring(0, 6).toUpperCase()}`
                : activeMedium === 'audio'
                ? `SYNTH_808_${audioBpm}BPM`
                : activeMedium === 'picture'
                ? 'CREYA_MATRIX_FRAME'
                : activeMedium === 'mesh3d'
                ? 'TRACKED_LIFE_MESH'
                : activeMedium === 'storage'
                ? 'CLOUD_DRIVE_INGEST_TAKE'
                : activeMedium === 'nch_suite'
                ? 'KNOCKS_MASTER_SUITE_ASSET'
                : 'SCRIPT_BEAT_VISEME',

            startSec: 12.0,
            durationSec: 5.0,
            color:
              activeMedium === 'video'
                ? '#FC8EAC'
                : activeMedium === 'audio'
                ? '#FFDAB9'
                : activeMedium === 'picture'
                ? '#E0FFFF'
                : activeMedium === 'storage'
                ? '#00F5D4'
                : '#8A2BE2',
            visemePhoneme: activeMedium === 'content' ? 'AA EE OH UH' : undefined,
          };
          onSynthesizeClip(newClip);
          onSelectSourceClip(newClip.title);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#111319] border-r border-[#242834] select-none text-xs font-mono">
      {/* Top Dock Navigation Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#151821] border-b border-[#212633]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-[#202533] text-[#FFDAB9] font-bold border border-[#FFDAB9]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            GENERATOR
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'assets'
                ? 'bg-[#202533] text-[#E0FFFF] font-bold border border-[#E0FFFF]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            ASSET BIN
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'models'
                ? 'bg-[#202533] text-[#FC8EAC] font-bold border border-[#FC8EAC]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            MODELS
          </button>
        </div>

        <span className="text-[10px] text-[#6D7787] uppercase">{activeMedium}</span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'generator' && (
          <div className="space-y-3.5">
            {/* Header info */}
            <div className="p-2.5 bg-[#171B24] border border-[#272D3D] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FFDAB9] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFDAB9]" />
                  {activeMedium} AI SYNTHESIZER
                </span>
                <span className="text-[10px] text-[#E0FFFF] bg-[#1F2533] px-1.5 py-0.2 rounded-xs">
                  LOCAL-FIRST
                </span>
              </div>
              <p className="text-[11px] text-[#8E99A8] leading-tight">
                Synthesize high-fidelity cinema assets routed through local WASM/Compute kernels directly into NLE.
              </p>
            </div>

            {/* VIDEO GENERATOR CONTROLS */}
            {activeMedium === 'video' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">PROMPT / CINEMATIC DIRECTIVE</label>
                  <textarea
                    rows={3}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-2 text-[#F5FFFA] rounded-xs focus:border-[#FFDAB9] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">CAMERA MOVEMENT</label>
                    <select
                      value={cameraMove}
                      onChange={(e) => setCameraMove(e.target.value)}
                      className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                    >
                      <option>Orbital 360 Flythrough</option>
                      <option>Dolly Zoom (Vertigo)</option>
                      <option>FP-Roll Aerial Drone</option>
                      <option>High-Speed Crane Track</option>
                      <option>Macro Handheld Whip</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">LENS &amp; RATIO</label>
                    <select
                      value={lensChoice}
                      onChange={(e) => setLensChoice(e.target.value)}
                      className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                    >
                      <option>70mm IMAX 1.43:1 Prime</option>
                      <option>Anamorphic 2.39:1 Cine</option>
                      <option>35mm Master Prime T1.3</option>
                      <option>18mm Ultra-Wide Angle</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">FPS TIMELINE</label>
                    <select
                      value={fpsChoice}
                      onChange={(e) => setFpsChoice(e.target.value)}
                      className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                    >
                      <option>24.000 FPS (Cinema)</option>
                      <option>60 FPS (Pro Master)</option>
                      <option>120 FPS (High-Speed FX)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">STYLE MATRIX</label>
                    <select
                      value={styleMatrix}
                      onChange={(e) => setStyleMatrix(e.target.value)}
                      className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                    >
                      <option>Sci-Fi Brutalism</option>
                      <option>Cyberpunk Noir</option>
                      <option>High-FPS Combat</option>
                      <option>Retro Chrome Metallic</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIO / MUSIC GENERATOR CONTROLS */}
            {activeMedium === 'audio' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">AUDIO STEM SYNTHESIS PROMPT</label>
                  <textarea
                    rows={3}
                    value={audioPrompt}
                    onChange={(e) => setAudioPrompt(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-2 text-[#F5FFFA] rounded-xs focus:border-[#FFDAB9] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">BPM: {audioBpm}</label>
                    <input
                      type="range"
                      min={70}
                      max={180}
                      value={audioBpm}
                      onChange={(e) => setAudioBpm(Number(e.target.value))}
                      className="w-full accent-[#FFDAB9] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">MUSICAL KEY</label>
                    <select
                      value={audioKey}
                      onChange={(e) => setAudioKey(e.target.value)}
                      className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                    >
                      <option>D Minor</option>
                      <option>F# Minor</option>
                      <option>A Minor</option>
                      <option>C Harmonic Minor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">GENRE &amp; SUB-BASS ARCHITECTURE</label>
                  <select
                    value={audioGenre}
                    onChange={(e) => setAudioGenre(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                  >
                    <option>Cyberpunk Industrial 808</option>
                    <option>Cinematic Hybrid Orchestral</option>
                    <option>Dark Synthwave &amp; Viseme Sync</option>
                    <option>Sub-Harmonic Drop &amp; Impact</option>
                  </select>
                </div>
              </div>
            )}

            {/* PICTURES / IMAGERY GENERATOR CONTROLS */}
            {activeMedium === 'picture' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">CREYA / NANO MATRIX PROMPT</label>
                  <textarea
                    rows={3}
                    value={picturePrompt}
                    onChange={(e) => setPicturePrompt(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-2 text-[#F5FFFA] rounded-xs focus:border-[#FFDAB9] outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">SEED: {pictureSeed}</label>
                    <button
                      onClick={() => setPictureSeed(Math.floor(Math.random() * 9000000 + 1000000))}
                      className="w-full py-1 bg-[#1A1E29] border border-[#2A3142] rounded-xs text-[#E0FFFF] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" /> RANDOMIZE
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">CFG GUIDANCE: {guidanceScale}</label>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      step={0.5}
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(Number(e.target.value))}
                      className="w-full accent-[#FC8EAC] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3D & MESH GENERATOR CONTROLS */}
            {activeMedium === 'mesh3d' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">LIFE-MESH ARCHETYPE</label>
                  <select
                    value={meshModelType}
                    onChange={(e) => setMeshModelType(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                  >
                    <option>Combat Drone Rig</option>
                    <option>Cybernetic Helmet Mesh</option>
                    <option>Mech Heavy Chassis</option>
                    <option>Humanoid Facial Viseme Head</option>
                    <option>Cyber Blade Weapon</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">POLYGON BUDGET</label>
                  <select
                    value={polyBudget}
                    onChange={(e) => setPolyBudget(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                  >
                    <option>64K Vertices (Game-Engine Ready)</option>
                    <option>128K Vertices (PBR Master)</option>
                    <option>256K Vertices (Nanite Geometry)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#0E1117] border border-[#232936] rounded-xs">
                  <span className="text-[11px] text-[#A6B0BE]">Modern Warfare Tracking Rig</span>
                  <input
                    type="checkbox"
                    checked={lifeMeshTracking}
                    onChange={(e) => setLifeMeshTracking(e.target.checked)}
                    className="accent-[#E0FFFF] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* CONTENT & STORY GENERATOR CONTROLS */}
            {activeMedium === 'content' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">STORY / SCREENPLAY BEAT PROMPT</label>
                  <textarea
                    rows={4}
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    className="w-full bg-[#0B0D11] border border-[#262B37] p-2 text-[#F5FFFA] rounded-xs focus:border-[#FFDAB9] outline-none resize-none"
                  />
                </div>
                <div className="text-[11px] text-[#8E99A8]">
                  Automated Phoneme Viseme tagging enabled: speech will generate corresponding facial mesh phoneme curves for the Lip-Sync track.
                </div>
              </div>
            )}

            {/* KNOCKS MASTER SUITE QUICK CONTROLS */}
            {activeMedium === 'nch_suite' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#0B0D11] border border-[#262B37] rounded-xs space-y-1.5">
                  <span className="text-[#FFDAB9] font-bold block text-[11px]">KNOCKS MASTER SUITE (40+ APPS)</span>
                  <p className="text-[10px] text-[#8E99A8]">
                    Click any application tile in the central launcher to immediately open WaveStorm, MixVortex, PhotoMatrix, PadEdit, or 3D Rigging.
                  </p>
                </div>
              </div>
            )}


            {/* STORAGE & INGESTION QUICK CONTROLS */}
            {activeMedium === 'storage' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-[#0B0D11] border border-[#262B37] rounded-xs space-y-1.5">
                  <span className="text-[#E0FFFF] font-bold block text-[11px]">TRANSFER &amp; REPOSITORY INGEST</span>
                  <p className="text-[10px] text-[#8E99A8]">
                    Google Drive, Copper FTP, SQLite database sweeping, and MCP server connectors are active.
                  </p>
                </div>
              </div>
            )}

            {/* SYNTHESIZE TRIGGER BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleSynthesize}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold tracking-wider uppercase rounded-xs transition-all hover:shadow-[0_0_20px_rgba(255,218,185,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isGenerating ? `SYNTHESIZING ${generationProgress}%` : `SYNTHESIZE ${activeMedium.toUpperCase()}`}</span>
              </button>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="w-full h-1.5 bg-[#090A0D] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] transition-all duration-200"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSET BIN TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#232733] text-[11px] text-[#8E99A8]">
              <span>LOCAL PROJECT ASSETS</span>
              <span>{ASSET_LIBRARY.length} ITEMS</span>
            </div>

            {ASSET_LIBRARY.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSourceClip(item.title)}
                className="p-2 bg-[#141720] border border-[#232836] hover:border-[#FFDAB9]/60 rounded-xs transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="truncate">
                    <span className="text-[#F5FFFA] block truncate group-hover:text-[#FFDAB9]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#6D7787]">
                      {item.type.toUpperCase()} · TRACK {item.track}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#8E99A8] shrink-0 font-mono">{item.duration}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI MODELS TAB */}
        {activeTab === 'models' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-[#8E99A8]">ROUTING COMPUTE KERNELS &amp; BALANCER</div>

            <div className="p-2.5 bg-[#141720] border border-[#262B38] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[#E0FFFF] font-bold">
                <span>TEMPEST_STUDiO v4.2</span>
                <span className="text-[10px] text-[#FFDAB9]">PRIMARY (LOCAL)</span>
              </div>
              <p className="text-[11px] text-[#8E99A8]">
                High-density multi-threaded video &amp; audio synthesis running locally on Rust/WASM eframe.
              </p>
            </div>

            <div className="p-2.5 bg-[#141720] border border-[#262B38] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[#FC8EAC] font-bold">
                <span>INFINITY-CORE-ENGINE</span>
                <span className="text-[10px] text-[#E0FFFF]">STANDBY</span>
              </div>
              <p className="text-[11px] text-[#8E99A8]">
                Distributed neural network cluster for 16K master frames and deep 3D PBR vertex baking.
              </p>
            </div>

            <div className="p-2.5 bg-[#141720] border border-[#262B38] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[#F5FFFA] font-bold">
                <span>CREYA NANO MATRIX</span>
                <span className="text-[10px] text-[#FC8EAC]">ACTIVE</span>
              </div>
              <p className="text-[11px] text-[#8E99A8]">
                Instant photorealistic texture &amp; pencil-sketch crosshatch generator.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
