export type MediaMedium =
  | 'video'
  | 'audio'
  | 'picture'
  | 'mesh3d'
  | 'content'
  | 'nch_suite'
  | 'storage'
  | 'cinema'
  | 'ai_battle'
  | 'chat'
  | 'bioscience'
  | 'gemini_ai';

export interface NchAppTile {
  id: string;
  name: string;
  subTitle: string;
  description: string;
  category: 'sound' | 'picture' | 'video' | 'upload' | 'avatar' | 'shaders' | 'ai' | 'repo';
  categoryLabel: string;
  icon: string;
  targetMedium?: MediaMedium;
  actionId: string;
  tag?: string;
  badge?: string;
}


export type DualEngineView = 'split' | 'generator-focus' | 'editor-focus';

export type AspectRatioType = 'imax_1.43' | 'cinemascope_2.39' | 'standard_16_9' | 'portrait_9_16';

export type SubscriptionTierId = 'free' | 'pro' | 'business' | 'enterprise' | 'school';

export interface SubscriptionTier {
  id: SubscriptionTierId;
  name: string;
  badge: string;
  price: string;
  renderLimits: string;
  enginePipes: string;
  features: string[];
  cryptoSignature: string;
  color: string;
}

export interface TelemetryState {
  smartRouterActive: boolean;
  tempestNodeSynced: boolean;
  infinityCoreOptimized: boolean;
  fps: number;
  wasmLatencyMs: number;
  computeLatencyMs: number;
  memoryBufferMb: number;
  activeThreads: number;
  activeKernels: number;
  routeMode: 'RUST_WASM_EFRAME' | 'COMPUTE_KERNEL_TELEMETRY' | 'HYBRID_PIPELINE';
  rustMemorySafeVerified?: boolean;
  rustZeroCopyOps?: number;
  wasmMirrorsActive?: number;
}

export interface TimelineClip {
  id: string;
  trackId: string; // V1, V2, FX, A1, A2, LIP
  title: string;
  startSec: number;
  durationSec: number;
  color: string;
  thumbnail?: string;
  visemePhoneme?: string;
}

export interface ColorGradeState {
  lift: number; // -100 to 100
  gamma: number; // -100 to 100
  gain: number; // -100 to 100
  exposure: number; // -5 to +5
  contrast: number; // 0 to 200
  saturation: number; // 0 to 200
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  bwConversion: boolean;
  vintageMatrix: 'none' | 'kodachrome' | 'technicolor' | 'cyberpunk_fresnel' | 'noir_high_contrast';
  pencilSketchMode: boolean;
  pencilHatchDensity: number;
  pencilLineWeight: number;
}

export interface ParametricBand {
  id: number;
  type: 'lowshelf' | 'peaking' | 'highshelf';
  freq: number; // Hz
  gain: number; // dB (-15 to +15)
  q: number; // 0.1 to 10
}

export interface AudioEngineState {
  isPlaying: boolean;
  bpm: number;
  masterVolume: number;
  sub808Drive: number;
  sub808Decay: number;
  sub808Harmonics: number;
  spatialX: number; // -100 to 100
  spatialY: number; // -100 to 100
  spatialSurroundMode: 'stereo' | 'dolby_5_1' | 'dts_spatial_360';
  eqBands: ParametricBand[];
  activeViseme: string;
}

export interface VisemePhoneme {
  phoneme: string;
  viseme: 'REST' | 'AA' | 'EE' | 'OH' | 'UH' | 'MBP' | 'FV' | 'L' | 'TH' | 'GK';
  jawOpen: number;
  mouthPucker: number;
  mouthWide: number;
  lipPress: number;
}

export interface ThreeDMeshConfig {
  modelType: 'cyber_helmet' | 'combat_drone' | 'mech_chassis' | 'viseme_head' | 'cyber_blade';
  wireframe: boolean;
  vertexCount: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  emissiveIntensity: number;
  vertexDisplacement: number;
  lifeMeshTracking: boolean;
  rotationSpeed: number;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  slugline: string;
  description: string;
  dialogue: string;
  character: string;
  phonemes: string;
  shotType: 'Extreme Wide' | 'Wide' | 'Medium' | 'Close-Up' | 'Macro Extreme' | 'Orbital Drone';
  lensFocal: string;
  durationSec: number;
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'wasm' | 'error';
  text: string;
}

export type PresetCategory = 'all' | 'imax' | 'cinema' | 'social_media' | 'broadcast' | 'custom';

export interface ExportPreset {
  id: string;
  name: string;
  category: 'imax' | 'cinema' | 'social_media' | 'broadcast' | 'custom';
  codec: string;
  container: string;
  bitrate: string;
  resolution: string;
  fps: string;
  colorSpace: string;
  audioChannels: string;
  isDefault?: boolean;
  notes?: string;
  createdAt?: string;
}

