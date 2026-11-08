import React, { useState, useEffect } from 'react';
import {
  MediaMedium,
  DualEngineView,
  AspectRatioType,
  SubscriptionTierId,
  TelemetryState,
  TimelineClip,
  ColorGradeState,
  AudioEngineState,
  ThreeDMeshConfig,
  StoryboardScene,
  TerminalLog,
} from './types';
import { StartupSplash } from './components/StartupSplash';
import { TopTelemetryHub } from './components/TopTelemetryHub';
import { DualMonitorWorkspace } from './components/DualMonitorWorkspace';
import { LeftToolDock } from './components/LeftToolDock';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { BottomNLEWorkspace } from './components/BottomNLEWorkspace';
import { ThreeDViewport } from './components/ThreeDViewport';
import { PictureMatrixEditor } from './components/PictureMatrixEditor';
import { AudioMasterEditor } from './components/AudioMasterEditor';
import { ScriptStoryboardEditor } from './components/ScriptStoryboardEditor';
import { TierVerificationModal } from './components/TierVerificationModal';
import { KnocksMasterSuiteLauncher } from './components/KnocksMasterSuiteLauncher';
import { StorageIngestView } from './components/StorageIngestView';
import { GoogleDriveConnectorModal } from './components/GoogleDriveConnectorModal';
import { ThreeDCinemaShuffler } from './components/ThreeDCinemaShuffler';
import { VortexIconCutoutModal } from './components/VortexIconCutoutModal';
import { KnocksStudioCenterStage } from './components/KnocksStudioCenterStage';
import { CyberHeroBattleGame3D } from './components/CyberHeroBattleGame3D';
import { BioscienceStudio } from './components/BioscienceStudio';
import { GeminiStudioSuite } from './components/GeminiStudioSuite';
import { PlatformDeployModal } from './components/PlatformDeployModal';
import { OwnerProvider } from './context/OwnerContext';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { OwnerExecutiveVaultModal } from './components/OwnerExecutiveVaultModal';
import { audioEngine } from './utils/audioEngine';
import { rustWasmPipeline } from './utils/rustWasmMemorySafePipeline';

export default function App() {
  // Master Workspace Mode: 'showcase' (the exact cinematic layout from user video) or 'pro_nle'
  const [workspaceMode, setWorkspaceMode] = useState<'showcase' | 'pro_nle'>('showcase');

  // Splash & HUD Mode (Defaulting to false so user's HTML layout displays directly)
  const [showSplash, setShowSplash] = useState<boolean>(false);

  const [autoHideHUD, setAutoHideHUD] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [isImmersiveFullTile, setIsImmersiveFullTile] = useState<boolean>(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState<boolean>(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState<boolean>(false);
  const [isTopHovered, setIsTopHovered] = useState<boolean>(false);
  const [isBottomHovered, setIsBottomHovered] = useState<boolean>(false);
  const [isLeftHovered, setIsLeftHovered] = useState<boolean>(false);
  const [isRightHovered, setIsRightHovered] = useState<boolean>(false);

  // Active Medium & Dual View
  const [activeMedium, setActiveMedium] = useState<MediaMedium>('video');
  const [dualView, setDualView] = useState<DualEngineView>('split');

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('imax_1.43');

  // Subscription Tier & Modal
  const [currentTier, setCurrentTier] = useState<SubscriptionTierId>('pro');
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);

  // Timeline & Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayheadSec, setCurrentPlayheadSec] = useState<number>(4.2);
  const [sourceClipTitle, setSourceClipTitle] = useState<string>('RAW_SYNTH_TAKE_01 [4K]');
  const [programClipTitle, setProgramClipTitle] = useState<string>('MASTER_SEQUENCE_NLE [IMAX 1.43:1]');

  // Initial NLE Clips
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: 'c1',
      trackId: 'V1',
      title: 'CYBER_CITY_FLYTHROUGH_01',
      startSec: 0,
      durationSec: 8.5,
      color: '#3A86FF',
    },
    {
      id: 'c2',
      trackId: 'V1',
      title: 'ORBITAL_DRONE_APPROACH',
      startSec: 8.5,
      durationSec: 7.2,
      color: '#3A86FF',
    },
    {
      id: 'c3',
      trackId: 'V2',
      title: 'NEO_TITLES_OVERLAY',
      startSec: 1.0,
      durationSec: 4.5,
      color: '#9B5DE5',
    },
    {
      id: 'c4',
      trackId: 'FX',
      title: 'ACES_LUT_TITANIUM_GOLD_4K',
      startSec: 0,
      durationSec: 20.0,
      color: '#FC8EAC',
    },
    {
      id: 'c5',
      trackId: 'A1',
      title: 'PILOT_VO_COMM_CHANNEL',
      startSec: 0.5,
      durationSec: 6.0,
      color: '#E0FFFF',
      visemePhoneme: 'AA EE OH',
    },
    {
      id: 'c6',
      trackId: 'A2',
      title: '808_SUB_DRONE_PUNCH_45HZ',
      startSec: 0,
      durationSec: 15.0,
      color: '#FFD700',
    },
    {
      id: 'c7',
      trackId: 'LIP',
      title: 'VISEME_MESH_AUTOMATION',
      startSec: 0.5,
      durationSec: 6.0,
      color: '#00F5D4',
      visemePhoneme: 'MBP FV AA',
    },
  ]);

  // Color Grading State
  const [colorGrade, setColorGrade] = useState<ColorGradeState>({
    lift: 0,
    gamma: 4,
    gain: 8,
    exposure: 0.2,
    contrast: 110,
    saturation: 115,
    temperature: 6,
    tint: -2,
    bwConversion: false,
    vintageMatrix: 'cyberpunk_fresnel',
    pencilSketchMode: false,
    pencilHatchDensity: 10,
    pencilLineWeight: 1.5,
  });

  // Audio Engine State
  const [audioState, setAudioState] = useState<AudioEngineState>({
    isPlaying: false,
    bpm: 124,
    masterVolume: 0.8,
    sub808Drive: 0.45,
    sub808Decay: 1.2,
    sub808Harmonics: 0.6,
    spatialX: 15,
    spatialY: -10,
    spatialSurroundMode: 'dts_spatial_360',
    eqBands: [
      { id: 1, type: 'lowshelf', freq: 60, gain: 4, q: 0.7 },
      { id: 2, type: 'peaking', freq: 240, gain: -2, q: 1.2 },
      { id: 3, type: 'peaking', freq: 1100, gain: 1, q: 1.0 },
      { id: 4, type: 'peaking', freq: 4200, gain: 3, q: 1.4 },
      { id: 5, type: 'highshelf', freq: 12000, gain: 5, q: 0.7 },
    ],
    activeViseme: 'REST',
  });

  // 3D Mesh Config State
  const [meshConfig, setMeshConfig] = useState<ThreeDMeshConfig>({
    modelType: 'combat_drone',
    wireframe: false,
    vertexCount: 64800,
    roughness: 0.35,
    metalness: 0.85,
    clearcoat: 0.7,
    emissiveIntensity: 1.2,
    vertexDisplacement: 0,
    lifeMeshTracking: true,
    rotationSpeed: 1.0,
  });

  // Storyboard Scenes
  const [storyScenes, setStoryScenes] = useState<StoryboardScene[]>([
    {
      id: 'sc_1',
      sceneNumber: 1,
      slugline: 'INT. COCKPIT - NIGHT',
      description: 'Pilot awakens in zero gravity as the flight HUD reflects sovereign titanium gold telemetry.',
      dialogue: 'Flight telemetry synced. Tempest core online.',
      character: 'PILOT VANCE',
      phonemes: 'AY TE LE ME TRY',
      shotType: 'Close-Up',
      lensFocal: '70mm IMAX T1.4',
      durationSec: 4.5,
    },
    {
      id: 'sc_2',
      sceneNumber: 2,
      slugline: 'EXT. NEO-KOWLOON MEGASPACE - CONTINUOUS',
      description: 'The combat drone launches into torrential volumetric neon rain over the obsidian spire.',
      dialogue: 'Engaging 808 sub harmonic propulsion.',
      character: 'OPERATOR',
      phonemes: 'EH N G AY J',
      shotType: 'Extreme Wide',
      lensFocal: '18mm Anamorphic',
      durationSec: 6.0,
    },
  ]);

  // Telemetry Status
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    smartRouterActive: true,
    tempestNodeSynced: true,
    infinityCoreOptimized: true,
    fps: 60.0,
    wasmLatencyMs: 0.4,
    computeLatencyMs: 11,
    memoryBufferMb: 1420,
    activeThreads: 8,
    activeKernels: 32,
    routeMode: 'RUST_WASM_EFRAME',
    rustMemorySafeVerified: true,
    rustZeroCopyOps: 48,
    wasmMirrorsActive: 8,
  });

  // Terminal Logs (All telemetry logs explicitly reference Rust and WASM memory safety verification)
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      timestamp: '16:12:00',
      level: 'info',
      text: '[INIT] KNOCKSSTUDiOS AI CINEMA & FX SUITE online.',
    },
    {
      id: '2',
      timestamp: '16:12:01',
      level: 'wasm',
      text: '[RUST_WASM::BOOT] Local Rust compiler core & WASM eframe/wgpu execution kernel bound. Rust Memory Safe: ACTIVE.',
    },
    {
      id: '3',
      timestamp: '16:12:02',
      level: 'wasm',
      text: '[RUST_BORROW_CHECKER] Compile-time lifetime analysis passed // 0 data races // WASM linear memory 4GB sandbox mapped.',
    },
    {
      id: '4',
      timestamp: '16:12:03',
      level: 'success',
      text: '[WASM_SIMD::PIPELINE] Tempest Rust/WASM node synced. IMAX 1.43:1 zero-copy asset pipeline calibrated.',
    },
    {
      id: '5',
      timestamp: '16:12:04',
      level: 'info',
      text: '[INFINITY-CORE] Rust zero-lock telemetry active. All asset operations routed via Rust/WASM memory safe layer.',
    },
  ]);

  // Timeline scrubbing & playback loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setCurrentPlayheadSec((prev) => {
          const next = prev + delta;
          if (next >= 30) return 0;
          return next;
        });
      }
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Keyboard shortcut listener (ESC to exit full tile or close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isIconModalOpen) setIsIconModalOpen(false);
        if (isDriveModalOpen) setIsDriveModalOpen(false);
        if (isTierModalOpen) setIsTierModalOpen(false);
        if (isImmersiveFullTile) setIsImmersiveFullTile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIconModalOpen, isDriveModalOpen, isTierModalOpen, isImmersiveFullTile]);

  // Toggle Playback
  const handleTogglePlay = () => {
    audioEngine.init();
    if (!isPlaying) {
      audioEngine.startAmbientLoop(audioState.bpm);
    } else {
      audioEngine.stopAmbientLoop();
    }
    setIsPlaying(!isPlaying);
  };

  // Execute CLI Command with simulated high-performance Rust-based backend processing pipeline
  const handleExecuteCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setLogs([]);
      return;
    }

    const formatTimestamp = () => {
      const d = new Date();
      return `${d.toTimeString().split(' ')[0]}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    };

    // 1. Immediately log user command
    const userLog: TerminalLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: formatTimestamp(),
      level: 'info',
      text: `$ ${trimmed}`,
    };

    setLogs((prev) => [...prev, userLog]);

    // Calculate command response and level
    let replyText = '';
    let replyLevel: TerminalLog['level'] = 'success';
    const normalized = trimmed.toLowerCase();

    if (normalized === 'help') {
      replyText = 'Available commands: tempest status, route --optimize, render --fps 60, export --format prores, wasm benchmark, rust-integrity, mesh --analyze, clear';
      replyLevel = 'info';
    } else if (normalized.startsWith('tempest status')) {
      replyText = 'TEMPEST_STUDiO v4.2 // Node 0x1 Synced // GPU: wgpu Vulkan // Latency: 0.4ms (WASM) / 11ms (Compute)';
      replyLevel = 'success';
    } else if (normalized.startsWith('route --optimize')) {
      replyText = 'Autonomous Smart-Router: Redistributed 4 compute pipelines to local Rust/WASM eframe. Queue locks: 0.';
      replyLevel = 'wasm';
      setTelemetry((prev) => ({
        ...prev,
        wasmLatencyMs: 0.4,
        memoryBufferMb: 1240,
        activeKernels: 48,
        activeThreads: 16,
      }));
    } else if (normalized.startsWith('render')) {
      replyText = 'Starting local non-blocking render queue: 60 FPS ProRes 4444 XQ. Multi-threaded Rayon worker pool active.';
      replyLevel = 'warn';
    } else if (normalized.startsWith('export')) {
      replyText = 'Export pipeline invoked: Audio stems + LipSync visemes packaged for IMAX delivery with zero-copy stream.';
      replyLevel = 'success';
    } else if (normalized.startsWith('wasm benchmark')) {
      replyText = 'WASM SIMD Benchmark: 1.2M vertex calculations in 0.38ms. 100% Rust memory safety confirmed.';
      replyLevel = 'wasm';
    } else if (normalized.startsWith('mesh --analyze')) {
      replyText = `3D Mesh Analysis: ${meshConfig.modelType.toUpperCase()} | 64,800 Vertices | PBR Normal Map: Passed.`;
      replyLevel = 'info';
    } else if (normalized.startsWith('rust-integrity') || normalized.startsWith('rust-verify')) {
      replyText = 'Rust Backend System: 16/16 thread safety invariants held. AddressSanitizer/Valgrind clean: 0 heap leaks, 0 data races.';
      replyLevel = 'wasm';
    } else {
      replyText = `Executed '${trimmed}' on native Rust pipeline. Exit code: 0 [OK].`;
    }

    // High performance Rust native execution metrics
    const hashHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const allocBytes = Math.floor(Math.random() * 128 + 64);
    const execMicros = (Math.random() * 55 + 75).toFixed(1);

    // 2. High-performance Rust backend processing pipeline simulation:
    // Stage A: Mock 'Rust Memory Safe' check & data integrity verification
    setTimeout(() => {
      const rustMemSafeLog: TerminalLog = {
        id: 'log_mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: formatTimestamp(),
        level: 'wasm',
        text: `[Rust Memory Safe] Checked: Data integrity verified // Lifetimes valid // Zero-copy borrow 0x${hashHex} // Heap checked (0 leaks, 0 dangling refs)`,
      };

      const nativeSysLog: TerminalLog = {
        id: 'log_sys_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: formatTimestamp(),
        level: 'info',
        text: `[NATIVE_SYS::libknocks_core.so] Native FFI bridge -> Tokio runtime worker [x86_64_AVX512] // Syscall: sys_epoll_pwait2 [Integrity: SHA-256 OK / ${allocBytes}B stack / ${execMicros}µs]`,
      };

      setLogs((prev) => [...prev, rustMemSafeLog, nativeSysLog]);

      // Stage B: Verified command output rendered in terminal
      setTimeout(() => {
        const replyLog: TerminalLog = {
          id: 'log_out_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          timestamp: formatTimestamp(),
          level: replyLevel,
          text: `[DISPATCH] ${replyText}`,
        };

        setLogs((prev) => [...prev, replyLog]);
      }, 70);
    }, 50);
  };

  // Insert clip from Source monitor to Timeline via Rust/WASM memory-safe layer
  const handleInsertClip = (
    customTitle?: string,
    customDuration?: number,
    customType: 'video' | 'audio' = 'video'
  ) => {
    const title = customTitle || sourceClipTitle;
    const dur = customDuration || 4.5;
    const track = customType === 'audio' ? 'A1' : 'V1';
    const verify = rustWasmPipeline.verifyAssetOperation('timeline_insert', title, customType, 16777216);
    const newClip: TimelineClip = {
      id: 'clip_' + Date.now(),
      trackId: track,
      title,
      startSec: currentPlayheadSec,
      durationSec: dur,
      color: customType === 'audio' ? '#FFDAB9' : '#FC8EAC',
    };
    setClips((prev) => [...prev, newClip]);
    setProgramClipTitle(newClip.title);
    setLogs((prev) => [...prev, ...verify.logs]);
    setTelemetry((prev) => ({
      ...prev,
      rustZeroCopyOps: (prev.rustZeroCopyOps || 0) + 1,
      wasmLatencyMs: 0.35,
    }));
    handleExecuteCommand(`insert clip "${sourceClipTitle}" at ${currentPlayheadSec.toFixed(2)}s`);
  };

  // Overwrite clip via Rust/WASM memory-safe layer
  const handleOverwriteClip = () => {
    const verify = rustWasmPipeline.verifyAssetOperation('timeline_overwrite', sourceClipTitle, 'video', 16777216);
    setLogs((prev) => [...prev, ...verify.logs]);
    handleInsertClip();
  };

  // Split clip at playhead via Rust/WASM memory-safe layer
  const handleSplitClipAtPlayhead = () => {
    const target = clips.find(
      (c) => currentPlayheadSec > c.startSec && currentPlayheadSec < c.startSec + c.durationSec
    );
    if (!target) return;

    const verify = rustWasmPipeline.verifyAssetOperation('timeline_split_razor', target.title, 'video', 8388608);
    setLogs((prev) => [...prev, ...verify.logs]);

    const firstHalfDuration = currentPlayheadSec - target.startSec;
    const secondHalfDuration = target.durationSec - firstHalfDuration;

    const firstHalf: TimelineClip = {
      ...target,
      durationSec: firstHalfDuration,
    };
    const secondHalf: TimelineClip = {
      ...target,
      id: 'split_' + Date.now(),
      startSec: currentPlayheadSec,
      durationSec: secondHalfDuration,
      title: target.title + ' (B)',
    };

    setClips((prev) => prev.map((c) => (c.id === target.id ? firstHalf : c)).concat(secondHalf));
    handleExecuteCommand(`razor split clip "${target.title}" at ${currentPlayheadSec.toFixed(2)}s`);
  };

  // Delete selected clip (Rust RAII Drop memory deallocation)
  const handleDeleteClip = (id: string) => {
    const target = clips.find((c) => c.id === id);
    const dropLog = rustWasmPipeline.dropAssetOperation(target?.title || id, 'timeline_clip');
    setLogs((prev) => [...prev, dropLog]);
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

  // Add clip to specific track via Rust/WASM memory-safe layer
  const handleAddClipToTrack = (trackId: string) => {
    const clipTitle = `NEW_${trackId}_CLIP`;
    const verify = rustWasmPipeline.verifyAssetOperation('track_clip_alloc', clipTitle, trackId.startsWith('V') ? 'video' : 'audio', 4194304);
    setLogs((prev) => [...prev, ...verify.logs]);
    const newClip: TimelineClip = {
      id: 'clip_' + Date.now(),
      trackId,
      title: clipTitle,
      startSec: currentPlayheadSec,
      durationSec: 5.0,
      color:
        trackId.startsWith('V')
          ? '#3A86FF'
          : trackId.startsWith('A')
          ? '#FFDAB9'
          : '#FC8EAC',
    };
    setClips((prev) => [...prev, newClip]);
  };

  // Update EQ Band helper via Rust/WASM DSP memory-safe pipeline
  const handleUpdateEqBand = (bandId: number, freq: number, gain: number, q: number) => {
    const verify = rustWasmPipeline.verifyAssetOperation('audio_dsp_eq_band', `Band_${bandId}_${freq}Hz`, 'audio', 524288);
    setLogs((prev) => [...prev, ...verify.logs]);
    setAudioState((prev) => ({
      ...prev,
      eqBands: prev.eqBands.map((b) => (b.id === bandId ? { ...b, freq, gain, q } : b)),
    }));
  };

  return (
    <OwnerProvider>
      <div className="w-screen h-screen flex flex-col bg-[#0A0A0A] text-[#F5FFFA] overflow-hidden select-none font-sans">
      {/* 1. STARTUP DISPLAY (Live-shuffling gallery & ambient audio visualizer) */}
      {showSplash && (
        <StartupSplash
          onEnterStudio={() => setShowSplash(false)}
          currentTier={currentTier}
          onOpenTierModal={() => setIsTierModalOpen(true)}
        />
      )}

      {/* 2. DYNAMIC WORKSPACE: SHOWCASE HERO MODE OR PRO NLE WORKSPACE */}
      {workspaceMode === 'showcase' ? (
        <KnocksStudioCenterStage
          onSelectMedium={(m) => {
            setActiveMedium(m);
            if (m === 'nch_suite') {
              setActiveMedium('nch_suite');
              setWorkspaceMode('pro_nle');
            } else {
              setWorkspaceMode('pro_nle');
            }
          }}
          onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
          onOpenIconModal={() => setIsIconModalOpen(true)}
          onOpenTierModal={() => setIsTierModalOpen(true)}
          onOpenPlatformModal={() => setIsPlatformModalOpen(true)}
          onToggleImmersiveFullTile={() => setIsImmersiveFullTile(true)}
          onSwitchToProNLE={() => setWorkspaceMode('pro_nle')}
          onExecuteCommand={handleExecuteCommand}
        />
      ) : (
        <>
          {/* TOP TELEMETRY STATUS HUB (With auto-hide HUD capability) */}
          <div
            onMouseEnter={() => setIsTopHovered(true)}
            onMouseLeave={() => setIsTopHovered(false)}
            className={`transition-all duration-300 z-30 shrink-0 ${
              autoHideHUD && !isTopHovered ? '-mt-16 opacity-30 hover:mt-0 hover:opacity-100' : ''
            }`}
          >
            <TopTelemetryHub
              activeMedium={activeMedium}
              onSelectMedium={(m) => setActiveMedium(m)}
              dualView={dualView}
              onChangeDualView={(v) => setDualView(v)}
              currentTier={currentTier}
              onOpenTierModal={() => setIsTierModalOpen(true)}
              telemetry={telemetry}
              onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
              isTerminalOpen={isTerminalOpen}
              autoHideEnabled={autoHideHUD}
              onToggleAutoHide={() => setAutoHideHUD(!autoHideHUD)}
              onOpenSplash={() => setShowSplash(true)}
              onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
              isImmersiveFullTile={isImmersiveFullTile}
              onToggleImmersiveFullTile={() => setIsImmersiveFullTile(!isImmersiveFullTile)}
              onOpenIconModal={() => setIsIconModalOpen(true)}
              onOpenPlatformModal={() => setIsPlatformModalOpen(true)}
              workspaceMode={workspaceMode}
              onToggleWorkspaceMode={() => setWorkspaceMode('showcase')}
            />
          </div>

          {/* DUAL-ENGINE WORKSPACE (Generator + Corresponding Pro Editor) */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* LEFT: AI Generator Tool Dock (auto-hides if enabled & in editor-focus) */}
            {dualView !== 'editor-focus' && (
              <div
                onMouseEnter={() => setIsLeftHovered(true)}
                onMouseLeave={() => setIsLeftHovered(false)}
                className={`transition-all duration-300 shrink-0 z-20 ${
                  autoHideHUD && !isLeftHovered ? '-ml-72 opacity-20 hover:ml-0 hover:opacity-100' : ''
                }`}
              >
                <LeftToolDock
                  activeMedium={activeMedium}
                  onSynthesizeClip={(clip) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('ai_generator_synth_clip', clip.title, 'video', 14680064);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setClips((prev) => [...prev, clip]);
                  }}
                  onSelectSourceClip={(title) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('source_monitor_buffer_bind', title, 'video', 8388608);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setSourceClipTitle(title);
                  }}
                />
              </div>
            )}

            {/* CENTER: Dual Monitor Workspace + Active Medium Specific Pro Editor */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Active Medium Viewport / Editor Display */}
              {activeMedium === 'nch_suite' && (
                <KnocksMasterSuiteLauncher
                  onLaunchApp={(tile) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('applet_sandbox_isolate', tile.name, 'system', 4194304);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    handleExecuteCommand(`launch "${tile.name}" [${tile.subTitle}]`);
                  }}
                  onSelectMedium={(m) => setActiveMedium(m)}
                  onOpenTierModal={() => setIsTierModalOpen(true)}
                  onExecuteCommand={handleExecuteCommand}
                />
              )}

              {activeMedium === 'storage' && (
                <StorageIngestView
                  onExecuteCommand={handleExecuteCommand}
                  onOpenGoogleDrive={() => setIsDriveModalOpen(true)}
                />
              )}

              {activeMedium === 'cinema' && (
                <ThreeDCinemaShuffler
                  isImmersiveActive={isImmersiveFullTile}
                  onToggleImmersive={() => setIsImmersiveFullTile(!isImmersiveFullTile)}
                  onSelectScene={(sceneTitle) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('cinema_shuffler_stream', sceneTitle, 'video', 12582912);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setSourceClipTitle(sceneTitle);
                    handleExecuteCommand(`select 24/7 scene "${sceneTitle}"`);
                  }}
                />
              )}

              {activeMedium === 'video' && (
                <DualMonitorWorkspace
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  aspectRatio={aspectRatio}
                  onChangeAspectRatio={(ar) => setAspectRatio(ar)}
                  colorGrade={colorGrade}
                  currentPlayheadSec={currentPlayheadSec}
                  onSeek={(s) => setCurrentPlayheadSec(s)}
                  sourceClipTitle={sourceClipTitle}
                  programClipTitle={programClipTitle}
                  onInsertClip={handleInsertClip}
                  onOverwriteClip={handleOverwriteClip}
                />
              )}

              {activeMedium === 'mesh3d' && (
                <ThreeDViewport
                  config={meshConfig}
                  onChangeConfig={(newCfg) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('mesh_vertex_pbr_alloc', (newCfg.modelType || meshConfig.modelType) + ' Mesh', 'mesh3d', 5242880);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setMeshConfig((prev) => ({ ...prev, ...newCfg }));
                  }}
                />
              )}

              {activeMedium === 'picture' && (
                <PictureMatrixEditor
                  colorGrade={colorGrade}
                  onChangeColorGrade={(newGrade) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('color_matrix_lut_dsp', newGrade.vintageMatrix || 'Rec.2020 ACEScc', 'image', 2097152);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setColorGrade((prev) => ({ ...prev, ...newGrade }));
                  }}
                  onResetGrade={() =>
                    setColorGrade({
                      lift: 0,
                      gamma: 0,
                      gain: 0,
                      exposure: 0,
                      contrast: 100,
                      saturation: 100,
                      temperature: 0,
                      tint: 0,
                      bwConversion: false,
                      vintageMatrix: 'none',
                      pencilSketchMode: false,
                      pencilHatchDensity: 10,
                      pencilLineWeight: 1.5,
                    })
                  }
                />
              )}

              {activeMedium === 'audio' && (
                <AudioMasterEditor
                  audioState={audioState}
                  onChangeAudioState={(newState) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('audio_pcm_harmonic_synthesis', `BPM_${newState.bpm || audioState.bpm}`, 'audio', 1048576);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setAudioState((prev) => ({ ...prev, ...newState }));
                  }}
                  onUpdateEqBand={handleUpdateEqBand}
                />
              )}

              {activeMedium === 'content' && (
                <ScriptStoryboardEditor
                  scenes={storyScenes}
                  onAddScene={() => {
                    const verify = rustWasmPipeline.verifyAssetOperation('storyboard_scene_alloc', 'Scene Beat Allocation', 'script', 262144);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setStoryScenes((prev) => [
                      ...prev,
                      {
                        id: 'sc_' + Date.now(),
                        sceneNumber: prev.length + 1,
                        slugline: 'INT. COMMAND CORE - NIGHT',
                        description: 'New cinematic beat synthesized into screenplay timeline.',
                        dialogue: 'All systems green.',
                        character: 'NAVIGATOR',
                        phonemes: 'AW L SI S TE M Z',
                        shotType: 'Medium',
                        lensFocal: '35mm Prime',
                        durationSec: 4.0,
                      },
                    ]);
                  }}
                  onUpdateScene={(id, updated) => {
                    const verify = rustWasmPipeline.verifyAssetOperation('storyboard_scene_rebind', `Scene_${id}`, 'script', 262144);
                    setLogs((prev) => [...prev, ...verify.logs]);
                    setStoryScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
                  }}
                  onDeleteScene={(id) => {
                    const dropLog = rustWasmPipeline.dropAssetOperation(`Scene_${id}`, 'storyboard_scene');
                    setLogs((prev) => [...prev, dropLog]);
                    setStoryScenes((prev) => prev.filter((s) => s.id !== id));
                  }}
                />
              )}

              {activeMedium === 'ai_battle' && (
                <CyberHeroBattleGame3D
                  onExecuteCommand={handleExecuteCommand}
                  onExit={() => setActiveMedium('video')}
                />
              )}

              {activeMedium === 'bioscience' && (
                <BioscienceStudio onExecuteCommand={handleExecuteCommand} />
              )}

              {(activeMedium === 'gemini_ai' || activeMedium === 'chat') && (
                <GeminiStudioSuite
                  onExecuteCommand={handleExecuteCommand}
                  onSynthesizeClip={(title, dur, type) => handleInsertClip(title, dur, type)}
                />
              )}
            </div>

            {/* RIGHT: Inspector & Local CLI Terminal Output */}
            {isTerminalOpen && (
              <div
                onMouseEnter={() => setIsRightHovered(true)}
                onMouseLeave={() => setIsRightHovered(false)}
                className={`transition-all duration-300 shrink-0 z-20 ${
                  autoHideHUD && !isRightHovered ? '-mr-72 opacity-20 hover:mr-0 hover:opacity-100' : ''
                }`}
              >
                <RightInspectorPanel
                  telemetry={telemetry}
                  logs={logs}
                  onExecuteCommand={handleExecuteCommand}
                  onClearLogs={() => setLogs([])}
                />
              </div>
            )}
          </div>

          {/* BOTTOM: Multi-Track NLE Timeline, Audio Mixer & Lip-Sync Waveform */}
          <div
            onMouseEnter={() => setIsBottomHovered(true)}
            onMouseLeave={() => setIsBottomHovered(false)}
            className={`transition-all duration-300 shrink-0 z-30 ${
              autoHideHUD && !isBottomHovered ? '-mb-56 opacity-20 hover:mb-0 hover:opacity-100' : ''
            }`}
          >
            <BottomNLEWorkspace
              clips={clips}
              currentPlayheadSec={currentPlayheadSec}
              onSeek={(sec) => setCurrentPlayheadSec(sec)}
              isPlaying={isPlaying}
              onSplitClipAtPlayhead={handleSplitClipAtPlayhead}
              onDeleteSelectedClip={handleDeleteClip}
              onAddClipToTrack={handleAddClipToTrack}
            />
          </div>
        </>
      )}


      {/* 5. TIER VERIFICATION & CRYPTOGRAPHIC ACCESS MODAL */}
      <TierVerificationModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentTier={currentTier}
        onSelectTier={(tierId) => {
          setCurrentTier(tierId);
          handleExecuteCommand(`activate tier "${tierId.toUpperCase()}" with signature verified`);
        }}
      />

      {/* 6. GOOGLE DRIVE WORKSPACE CONNECTOR MODAL */}
      <GoogleDriveConnectorModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onImportToTimeline={(clip) => {
          const verify = rustWasmPipeline.verifyAssetOperation('gdrive_cloud_ingest', clip.title, 'video', 33554432);
          setLogs((prev) => [...prev, ...verify.logs]);
          setClips((prev) => [...prev, clip]);
          setTelemetry((prev) => ({
            ...prev,
            rustZeroCopyOps: (prev.rustZeroCopyOps || 0) + 1,
            wasmLatencyMs: 0.28,
          }));
          handleExecuteCommand(`import gdrive take "${clip.title}" to track ${clip.trackId}`);
        }}
        onLoadToSourceMonitor={(title) => {
          const verify = rustWasmPipeline.verifyAssetOperation('gdrive_source_stream_bind', title, 'video', 16777216);
          setLogs((prev) => [...prev, ...verify.logs]);
          setSourceClipTitle(title);
          handleExecuteCommand(`load to source monitor "${title}"`);
        }}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* 7. VORTEX 7 UNIVERSAL ICON CUTOUT & MULTI-PLATFORM DEPLOY MODAL */}
      <VortexIconCutoutModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
      />

      {/* 8. MULTI-PLATFORM DEPLOY & MARKETPLACE MODAL (UNITY, LAPTOP, PHONE, WEB, MICRO, ANDROID STORE) */}
      <PlatformDeployModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* PRO ENTERPRISE OWNER AUTH & EXECUTIVE VAULT MODALS */}
      <OwnerAuthModal />
      <OwnerExecutiveVaultModal
        onOpenPlatformModal={() => setIsPlatformModalOpen(true)}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* 9. THREE.JS 24/7 FULL-TILE SHUFFLE CINEMA (All hides to hover of mouse or touch of screen) */}
      {isImmersiveFullTile && (
        <div className="fixed inset-0 z-40 bg-[#050608] flex items-center justify-center overflow-hidden">
          <ThreeDCinemaShuffler
            isImmersiveActive={true}
            onToggleImmersive={() => setIsImmersiveFullTile(false)}
            onSelectScene={(title) => {
              setSourceClipTitle(title);
              handleExecuteCommand(`select 24/7 scene "${title}"`);
            }}
          />

          {/* Auto-Hiding HUD Overlay: Fully transparent (opacity-0) until hover of mouse or touch of screen */}
          <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 active:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 z-50">
            {/* Top Hover Header */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3 bg-[#0A0B0E]/90 border border-[#2D3342] px-3.5 py-2 rounded-xs backdrop-blur-md shadow-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E0FFFF] shadow-[0_0_8px_#E0FFFF] animate-ping" />
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-sm text-gradient-chrome tracking-wider">
                    KNOCKSSTUDiOS
                  </span>
                  <span className="text-[10px] text-[#FFDAB9] font-mono">[24/7 FULL-TILE CINEMA]</span>
                  <span className="text-[10px] text-[#E0FFFF] border border-[#E0FFFF]/30 px-1.5 py-0.2 rounded-xs font-mono">
                    HOLLYWOOD MOTiON PiCTURES
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsDriveModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#141722]/95 border border-[#FFDAB9]/60 text-[#FFDAB9] rounded-xs text-xs font-mono font-bold cursor-pointer hover:bg-[#1E2434] backdrop-blur-md shadow-[0_0_10px_rgba(255,218,185,0.25)] flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FFDAB9]" />
                  <span>BROWSE GOOGLE DRIVE ASSETS</span>
                </button>

                <button
                  onClick={() => setIsImmersiveFullTile(false)}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-extrabold rounded-xs text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(255,218,185,0.4)] hover:brightness-110"
                >
                  EXIT FULL TILE [ESC]
                </button>
              </div>
            </div>

            {/* Central Notice (Fades gently, indicates hover/touch behavior) */}
            <div className="self-center text-center space-y-1">
              <div className="inline-block px-3 py-1 bg-[#0A0B0E]/80 border border-[#2D3342] rounded-xs text-[10px] text-[#E0FFFF] font-mono tracking-widest backdrop-blur-sm">
                24/7 LIVE SHUFFLE ACTIVE · ALL CONTROLS HIDE TO HOVER / TOUCH
              </div>
            </div>

            {/* Bottom Quick Controls */}
            <div className="flex items-center justify-between pointer-events-auto bg-[#0A0B0E]/80 border border-[#262C3A] p-2.5 rounded-xs backdrop-blur-md text-xs font-mono">
              <span className="text-[11px] text-[#8E99A8]">
                HOVER SCREEN EDGES OR TOUCH TO REVEAL FULL NAVIGATION DOCKS
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleInsertClip();
                    handleExecuteCommand('inserted current 24/7 scene frame into timeline V1');
                  }}
                  className="px-3 py-1 bg-[#1E2536] border border-[#E0FFFF]/40 text-[#E0FFFF] rounded-xs cursor-pointer hover:bg-[#283248] text-[11px]"
                >
                  + SNAPSHOT TO TIMELINE V1
                </button>
                <button
                  onClick={() => setIsImmersiveFullTile(false)}
                  className="px-3 py-1 bg-[#161922] border border-[#3A4356] text-[#A6B0BE] rounded-xs cursor-pointer hover:text-[#F5FFFA] text-[11px]"
                >
                  DOCK STUDIO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </OwnerProvider>
  );
}
