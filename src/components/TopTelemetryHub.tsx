import React from 'react';
import {
  Film,
  Music,
  Image,
  Box,
  FileText,
  Activity,
  Shield,
  ShieldCheck,
  Layers,
  Cpu,
  Zap,
  Split,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Terminal,
  RotateCcw,
  Sparkles,
  UploadCloud,
  FolderSync,
  Shuffle,
  Gamepad2,
  Dna,
  Bot,
  Lock,
  Download,
} from 'lucide-react';
import { MediaMedium, DualEngineView, SubscriptionTierId, TelemetryState } from '../types';
import { SUBSCRIPTION_TIERS } from '../utils/tierConfig';
import { useOwner } from '../context/OwnerContext';
import { usePWAInstall } from '../utils/usePWAInstall';

interface TopTelemetryHubProps {
  activeMedium: MediaMedium;
  onSelectMedium: (m: MediaMedium) => void;
  dualView: DualEngineView;
  onChangeDualView: (v: DualEngineView) => void;
  currentTier: SubscriptionTierId;
  onOpenTierModal: () => void;
  telemetry: TelemetryState;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
  autoHideEnabled: boolean;
  onToggleAutoHide: () => void;
  onOpenSplash: () => void;
  onOpenGoogleDrive: () => void;
  isImmersiveFullTile: boolean;
  onToggleImmersiveFullTile: () => void;
  onOpenIconModal: () => void;
  onOpenPlatformModal?: () => void;
  workspaceMode?: 'showcase' | 'pro_nle';
  onToggleWorkspaceMode?: () => void;
}

export const TopTelemetryHub: React.FC<TopTelemetryHubProps> = ({
  activeMedium,
  onSelectMedium,
  dualView,
  onChangeDualView,
  currentTier,
  onOpenTierModal,
  telemetry,
  onToggleTerminal,
  isTerminalOpen,
  autoHideEnabled,
  onToggleAutoHide,
  onOpenSplash,
  onOpenGoogleDrive,
  isImmersiveFullTile,
  onToggleImmersiveFullTile,
  onOpenIconModal,
  onOpenPlatformModal,
  workspaceMode = 'pro_nle',
  onToggleWorkspaceMode,
}) => {
  const { isOwnerMode, openAuthModal, openVault, ownerEmail } = useOwner();
  const { isInstalled, install } = usePWAInstall();
  const tier = SUBSCRIPTION_TIERS[currentTier];

  const MEDIA_TABS: { id: MediaMedium; label: string; icon: React.ElementType }[] = [
    { id: 'nch_suite', label: 'MASTER SUITE (32+)', icon: Sparkles },
    { id: 'ai_battle', label: '3D CYBER GAME', icon: Gamepad2 },
    { id: 'bioscience', label: 'BIOMOLECULAR', icon: Dna },
    { id: 'gemini_ai', label: 'AI CINEMA', icon: Bot },
    { id: 'video', label: 'VIDEO PLUS', icon: Film },
    { id: 'audio', label: 'SOUND N (AUDIO)', icon: Music },
    { id: 'picture', label: 'PICTURE', icon: Image },
    { id: 'mesh3d', label: '3D & MESH', icon: Box },
    { id: 'content', label: 'STORY & SCRIPT', icon: FileText },
    { id: 'storage', label: 'UPLOADS & DL', icon: UploadCloud },
    { id: 'cinema', label: '24/7 SHUFFLE', icon: Shuffle },
  ];

  return (
    <header className="relative z-30 flex flex-col border-b border-[#2B303C] bg-[#0E1015]/95 backdrop-blur-md select-none transition-all duration-300">
      {/* Upper Status & Telemetry Row */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E222A] text-xs font-mono">
        {/* Left: Studio Branding Lockup */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSplash}
            title="Launch Gallery & Studio Welcome"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xs p-0.5 shadow-[0_0_10px_rgba(252,142,172,0.4)] bg-[#0A0A0A] border border-[#FC8EAC]/60 flex items-center justify-center overflow-hidden">
              <img
                src="/vortex7-icon-1024-transparent.png"
                alt="Vortex 7 Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-gradient-chrome">
                KNOCKSSTUDiOS™ ©
              </span>
              <span className="text-[10px] text-[#FFDAB9] font-mono tracking-widest">[KNOCKS]</span>
              <span className="hidden lg:inline text-[9px] text-[#E0FFFF] border border-[#E0FFFF]/30 px-1.5 py-0.2 rounded-xs font-mono tracking-wider">
                HOLLYWOOD MOTiON PiCTURES
              </span>
            </div>
          </button>

          <button
            onClick={onOpenIconModal}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#171B26] border border-[#FC8EAC]/50 hover:border-[#FC8EAC] text-[#FC8EAC] rounded-xs text-[10px] font-mono cursor-pointer transition-all shadow-[0_0_8px_rgba(252,142,172,0.2)]"
            title="Open Vortex 7 Cutout & Multi-Platform Deploy Suite"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FC8EAC] animate-pulse" />
            <span>VORTEX 7 ICON</span>
          </button>

          {onOpenPlatformModal && (
            <button
              onClick={onOpenPlatformModal}
              className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-[#00F5D4]/15 border border-[#00F5D4]/60 hover:bg-[#00F5D4]/25 text-[#00F5D4] rounded-xs text-[10px] font-mono cursor-pointer transition-all shadow-[0_0_8px_rgba(0,245,212,0.25)] font-bold uppercase"
              title="Unity, Laptop, Phone, Web, Micro, Android Store & Marketplace"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>UNITY · PHONE · LAPTOP · STORE</span>
            </button>
          )}

          <span className="text-[#3A4150]">|</span>

          {/* Autonomous Smart-Routing Engine Indicators */}
          <div className="hidden xl:flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#E0FFFF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0FFFF] shadow-[0_0_6px_#E0FFFF]" />
              <span className="text-[#8E99A8]">SMART-ROUTER:</span>
              <span className="font-semibold">{telemetry.smartRouterActive ? 'ACTIVE' : 'STANDBY'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#FFDAB9]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFDAB9] shadow-[0_0_6px_#FFDAB9]" />
              <span className="text-[#8E99A8]">TEMPEST_NODE:</span>
              <span className="font-semibold">{telemetry.tempestNodeSynced ? 'SYNCED' : 'INITIALIZING'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#FC8EAC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FC8EAC] shadow-[0_0_6px_#FC8EAC]" />
              <span className="text-[#8E99A8]">INFINITY-CORE:</span>
              <span className="font-semibold">{telemetry.infinityCoreOptimized ? 'OPTIMIZED' : 'LOCAL'}</span>
            </div>
          </div>
        </div>

        {/* Center: Live Pipeline Route Status & Rust/WASM Memory Safe Layer */}
        <div className="hidden md:flex items-center gap-2.5 text-[11px] px-3 py-1 bg-[#14161D] border border-[#262B36] rounded-xs shadow-inner">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-[#FC8EAC]/10 border border-[#FC8EAC]/40 rounded-xs text-[#FC8EAC] font-mono font-bold text-[10px]">
            <ShieldCheck className="w-3 h-3 text-[#FC8EAC]" />
            <span>RUST/WASM MEM-SAFE</span>
          </div>
          <span className="text-[#3A4150]">·</span>
          <span className="text-[#8E99A8]">ZERO-COPY:</span>
          <span className="text-[#E0FFFF] font-semibold">{telemetry.rustZeroCopyOps ?? 48} OPS</span>
          <span className="text-[#3A4150]">·</span>
          <span className="text-[#8E99A8]">WASM:</span>
          <span className="text-[#FFDAB9] font-semibold">{telemetry.wasmLatencyMs.toFixed(1)}ms</span>
          <span className="text-[#3A4150]">·</span>
          <span className="text-[#8E99A8]">BUF:</span>
          <span className="text-[#E0FFFF]">{telemetry.memoryBufferMb} MB</span>
        </div>

        {/* Right: Subscription Tier Badge, Google Drive & HUD controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pro Enterprise Owner Profile Gate */}
          {isOwnerMode ? (
            <button
              onClick={openVault}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-[#00F5D4]/15 border border-[#00F5D4] text-[#00F5D4] rounded-xs cursor-pointer shadow-[0_0_12px_rgba(0,245,212,0.3)] hover:bg-[#00F5D4]/25 transition-all"
              title={`Executive Owner Profile: ${ownerEmail} - Open Pro Enterprise Vault`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#00F5D4]" />
              <span className="hidden sm:inline">OWNER PROFILE</span>
              <span className="text-[9px] text-[#FFDAB9]">[PRO ENTERPRISE]</span>
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono border border-[#FFDAB9]/40 bg-[#161922] text-[#FFDAB9] rounded-xs transition-all cursor-pointer hover:bg-[#1F2432]"
              title="Enterprise Owner Authentication Gate"
            >
              <Lock className="w-3 h-3 text-[#FFDAB9]" />
              <span className="hidden sm:inline">OWNER ACCESS</span>
            </button>
          )}

          {/* Native 1-Tap App Install Button */}
          {!isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-[#FEE440]/15 border border-[#FEE440]/60 text-[#FEE440] hover:bg-[#FEE440]/25 rounded-xs cursor-pointer transition-all shadow-[0_0_8px_rgba(254,228,64,0.2)]"
              title="Install KNOCKSSTUDiOS directly to Phone or Desktop (1-Tap)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">INSTALL APP</span>
            </button>
          )}

          {onToggleWorkspaceMode && (
            <button
              onClick={onToggleWorkspaceMode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] rounded-xs cursor-pointer shadow-[0_0_12px_rgba(255,218,185,0.35)] hover:brightness-110 transition-all"
              title="Return to the Cinematic Hero Showcase Layout"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>SHOWCASE HERO</span>
            </button>
          )}

          <button
            onClick={onOpenGoogleDrive}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border border-[#FFDAB9]/40 bg-[#161922] text-[#FFDAB9] rounded-xs transition-all cursor-pointer hover:bg-[#1F2432] hover:shadow-[0_0_8px_rgba(255,218,185,0.25)]"
            title="Google Drive & Workspace Cloud Asset Connector"
          >
            <FolderSync className="w-3.5 h-3.5 text-[#FFDAB9]" />
            <span className="hidden sm:inline">DRIVE ASSETS</span>
          </button>


          <button
            onClick={onToggleImmersiveFullTile}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded-xs transition-all cursor-pointer ${
              isImmersiveFullTile
                ? 'bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold border-transparent shadow-[0_0_10px_rgba(255,218,185,0.4)]'
                : 'bg-[#14171E] border-[#2A2F3D] text-[#E0FFFF] hover:border-[#E0FFFF]/50'
            }`}
            title="Toggle 24/7 Full-Tile Three.js Cinema (Auto-hides all HUD to hover)"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">24/7 CINEMA</span>
          </button>

          <button
            onClick={onToggleTerminal}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded-xs transition-colors cursor-pointer ${
              isTerminalOpen
                ? 'bg-[#1F2430] border-[#E0FFFF] text-[#E0FFFF]'
                : 'bg-[#14171E] border-[#2A2F3D] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Toggle Local Python/Rust Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CLI</span>
          </button>

          <button
            onClick={onOpenTierModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border rounded-xs transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(255,218,185,0.25)]"
            style={{
              borderColor: `${tier.color}60`,
              backgroundColor: '#14171E',
              color: tier.color,
            }}
            title="Cryptographic Tier Matrix"
          >
            <Shield className="w-3 h-3" />
            <span className="font-bold">{tier.badge}</span>
          </button>

          <button
            onClick={onToggleAutoHide}
            className={`px-2 py-1 text-[11px] font-mono border rounded-xs transition-colors cursor-pointer ${
              autoHideEnabled
                ? 'bg-[#FC8EAC]/20 border-[#FC8EAC] text-[#FC8EAC]'
                : 'bg-[#14171E] border-[#2A2F3D] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Toggle Auto-Hide Command HUD (menus slide on hover)"
          >
            HUD: {autoHideEnabled ? 'AUTO-HIDE' : 'LOCKED'}
          </button>
        </div>
      </div>

      {/* Lower Navigation & Dual-Engine Mode Row */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 gap-3 bg-[#111318]">
        {/* 5 Media Medium Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {MEDIA_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMedium === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectMedium(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold tracking-wider rounded-xs transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#202531] to-[#171B24] border-t-2 border-[#FFDAB9] text-[#F5FFFA] shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
                    : 'text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#181B22]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-[#FFDAB9]' : 'text-[#6D7787]'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dual-Engine Rule Switcher (Generator + Editor Pairs) */}
        <div className="flex items-center gap-1 p-0.5 bg-[#0A0B0E] border border-[#232732] rounded-xs text-xs font-mono">
          <button
            onClick={() => onChangeDualView('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              dualView === 'split'
                ? 'bg-[#1E2330] text-[#E0FFFF] font-bold border border-[#E0FFFF]/30'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Split Dual-Engine: Generator on Left + Pro Editor in Center/Bottom"
          >
            <Split className="w-3 h-3" />
            <span className="hidden sm:inline">DUAL DOCK</span>
          </button>

          <button
            onClick={() => onChangeDualView('generator-focus')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              dualView === 'generator-focus'
                ? 'bg-[#1E2330] text-[#FFDAB9] font-bold border border-[#FFDAB9]/30'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Generator Focus Mode"
          >
            <Zap className="w-3 h-3" />
            <span>GENERATOR</span>
          </button>

          <button
            onClick={() => onChangeDualView('editor-focus')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
              dualView === 'editor-focus'
                ? 'bg-[#1E2330] text-[#FC8EAC] font-bold border border-[#FC8EAC]/30'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
            title="Pro Editor Focus Mode"
          >
            <Sliders className="w-3 h-3" />
            <span>EDITOR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
