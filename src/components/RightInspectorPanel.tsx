import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Activity,
  HardDrive,
  CheckCircle,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Film,
  Download,
  Share2,
  ShieldCheck,
  Copy,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { TerminalLog, TelemetryState, ExportPreset } from '../types';
import { ExportPresetsModal, FACTORY_PRESETS } from './ExportPresetsModal';
import { rustWasmPipeline } from '../utils/rustWasmMemorySafePipeline';
import { useOwner } from '../context/OwnerContext';

interface RightInspectorPanelProps {
  telemetry: TelemetryState;
  logs: TerminalLog[];
  onExecuteCommand: (cmd: string) => void;
  onClearLogs: () => void;
}

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  telemetry,
  logs,
  onExecuteCommand,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'cli' | 'fabricator'>('cli');
  const [commandInput, setCommandInput] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Available Presets & Quick Apply State
  const [availablePresets, setAvailablePresets] = useState<ExportPreset[]>(FACTORY_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_imax_master');
  const [quickApplyNotice, setQuickApplyNotice] = useState<string | null>(null);
  const [isPowerShellCopied, setIsPowerShellCopied] = useState<boolean>(false);
  const { isOwnerMode, openAuthModal } = useOwner();

  const [activeExportPreset, setActiveExportPreset] = useState<ExportPreset>({
    id: 'preset_imax_master',
    name: 'IMAX 1.43:1 Master DCI Archive',
    category: 'imax',
    codec: 'Apple ProRes 4444 XQ',
    container: 'MOV',
    bitrate: '380 Mbps (Near-Lossless)',
    resolution: '4096x2864 (IMAX 1.43:1)',
    fps: '24.000 fps',
    colorSpace: 'ACEScc / Rec.2020 PQ HDR',
    audioChannels: 'DTS:X 12-Channel Spatial 48kHz 24-bit',
    isDefault: true,
  });

  // Inspector clip values
  const [speedRamp, setSpeedRamp] = useState('1.0x (Normal)');
  const [blendMode, setBlendMode] = useState('Normal (Direct)');
  const [opacity, setOpacity] = useState(100);
  const [scale, setScale] = useState(100);

  // Load custom saved presets from localStorage
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem('knocks_studio_export_presets_v1');
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved) as ExportPreset[];
        const combined = [...FACTORY_PRESETS];
        parsed.forEach((p) => {
          if (!combined.some((c) => c.id === p.id)) {
            combined.push(p);
          }
        });
        setAvailablePresets(combined);
      }
      const rawActive = localStorage.getItem('knocks_active_export_preset_v1');
      if (rawActive) {
        const parsedActive = JSON.parse(rawActive) as ExportPreset;
        setActiveExportPreset(parsedActive);
        setSelectedPresetId(parsedActive.id);
      }
    } catch {
      // Fallback
    }
  }, [isExportModalOpen]);

  // Quick Apply Handler
  const handleQuickApply = (presetId?: string) => {
    const targetId = presetId || selectedPresetId;
    const target = availablePresets.find((p) => p.id === targetId);
    if (!target) return;
    setActiveExportPreset(target);
    setSelectedPresetId(target.id);
    localStorage.setItem('knocks_active_export_preset_v1', JSON.stringify(target));
    const verify = rustWasmPipeline.verifyAssetOperation(
      'quick_apply_preset',
      target.name,
      'video',
      16777216
    );
    onExecuteCommand(
      `quick apply preset: "${target.name}" [${target.codec} | ${target.resolution} | ${target.container}] -> ${verify.borrowCheck}`
    );
    setQuickApplyNotice(`Applied "${target.name}"`);
    setTimeout(() => setQuickApplyNotice(null), 3000);
  };

  // Auto-scroll logs when new entries appear
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim();
    if (!trimmed) return;
    if (
      trimmed.toLowerCase() === 'presets' ||
      trimmed.toLowerCase() === 'export presets' ||
      trimmed.toLowerCase() === 'export --presets'
    ) {
      setIsExportModalOpen(true);
      onExecuteCommand('export presets [modal launched]');
    } else {
      onExecuteCommand(trimmed);
    }
    setCommandInput('');
  };

  const QUICK_COMMANDS = [
    'rust-verify',
    'tempest status',
    'route --optimize',
    'export presets',
    'render --fps 60',
    'export --format prores',
    'wasm benchmark',
  ];

  return (
    <div className="w-80 h-full flex flex-col bg-[#111319] border-l border-[#242834] select-none text-xs font-mono">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#151821] border-b border-[#212633]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-2 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'cli'
                ? 'bg-[#202533] text-[#E0FFFF] font-bold border border-[#E0FFFF]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            CLI TERMINAL
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-2 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-[#202533] text-[#FFDAB9] font-bold border border-[#FFDAB9]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            INSPECTOR
          </button>

          <button
            onClick={() => setActiveTab('fabricator')}
            className={`px-2 py-1 rounded-xs transition-colors cursor-pointer ${
              activeTab === 'fabricator'
                ? 'bg-[#202533] text-[#FC8EAC] font-bold border border-[#FC8EAC]/40'
                : 'text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            FABRICATOR
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-[#1A1F2C] hover:bg-[#252C3E] border border-[#FFDAB9]/40 text-[#FFDAB9] rounded-xs font-bold text-[10px] cursor-pointer shadow-[0_0_8px_rgba(255,218,185,0.2)] transition-all"
            title="Open Export Presets & Delivery Standards Matrix (IMAX, Scope, Social, Broadcast)"
          >
            <Film className="w-3 h-3 text-[#FFDAB9]" />
            <span>EXPORT PRESETS</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-hidden flex flex-col p-3">
        {/* CLI TERMINAL TAB */}
        {activeTab === 'cli' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-2">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-[#232733] text-[#8E99A8]">
              <span className="text-[#E0FFFF] font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#E0FFFF]" />
                LOCAL PYTHON / RUST CLI
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-[#FC8EAC]/10 border border-[#FC8EAC]/40 text-[#FC8EAC] text-[9px] font-mono rounded-xs flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-[#FC8EAC]" />
                  RUST MEMORY SAFE
                </span>
                <button
                  onClick={onClearLogs}
                  className="text-[#6D7787] hover:text-[#FC8EAC] cursor-pointer"
                  title="Clear Logs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Command Pills */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    if (cmd === 'export presets') {
                      setIsExportModalOpen(true);
                      onExecuteCommand('export presets [modal launched]');
                    } else {
                      onExecuteCommand(cmd);
                    }
                  }}
                  className="px-1.5 py-0.5 bg-[#161922] border border-[#262B3B] text-[#A6B0BE] hover:text-[#FFDAB9] hover:border-[#FFDAB9]/50 rounded-xs cursor-pointer truncate"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Output Log Area */}
            <div
              ref={logContainerRef}
              className="flex-1 bg-[#07080B] border border-[#1E232F] rounded-xs p-2 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed scroll-smooth"
            >
              <div className="text-[#6D7787]">
                KNOCKSSTUDiOS CLI PIPE v4.2 [Rust/WASM Core Active]
              </div>
              <div className="text-[#6D7787]">Type 'help' for executable commands.</div>

              {logs.map((log) => {
                let colorClass = 'text-[#A6B0BE]';
                if (log.level === 'success') colorClass = 'text-[#E0FFFF]';
                else if (log.level === 'warn') colorClass = 'text-[#FFDAB9]';
                else if (log.level === 'wasm') colorClass = 'text-[#FC8EAC]';
                else if (log.level === 'error') colorClass = 'text-[#FF007F]';

                return (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-[#4E5669] shrink-0">{log.timestamp}</span>
                    <span className={`${colorClass} break-all`}>{log.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Command Input Form */}
            <form onSubmit={handleCommandSubmit} className="flex gap-1 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1.5 text-[#FC8EAC]">&gt;</span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="run command (e.g. tempest status)..."
                  className="w-full bg-[#080A0E] border border-[#242938] pl-5 pr-2 py-1 text-[#F5FFFA] rounded-xs text-[11px] outline-none focus:border-[#E0FFFF]"
                />
              </div>
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#1E2433] hover:bg-[#283146] text-[#E0FFFF] rounded-xs cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>

            {/* Pro Enterprise Owner Protected Runner Card */}
            {isOwnerMode ? (
              <div className="bg-[#0A0D15] border border-emerald-500/40 p-2 rounded-xs space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00F5D4] flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-[#3A86FF]" />
                    POWERSHELL APP LAUNCHER [OWNER]
                  </span>
                  <button
                    onClick={() => {
                      const activeUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('null')
                        ? window.location.origin
                        : 'https://ais-dev-qf2ysbvycsvzjyxe4bl6zx-187094173481.us-west2.run.app';
                      const psCmd = `Start-Process "${activeUrl}"`;
                      navigator.clipboard.writeText(psCmd);
                      setIsPowerShellCopied(true);
                      onExecuteCommand('copied universal PowerShell launcher command to clipboard');
                      setTimeout(() => setIsPowerShellCopied(false), 2500);
                    }}
                    className="text-[9px] text-[#FFDAB9] hover:underline cursor-pointer flex items-center gap-1"
                    title="Copy PowerShell command"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{isPowerShellCopied ? 'COPIED!' : 'COPY PS CMD'}</span>
                  </button>
                </div>
                <div className="text-[9px] text-gray-400">
                  Run this command in Windows PowerShell to launch directly in your default browser:
                </div>
                <code className="text-[#A6B8D4] block font-mono text-[9px] truncate bg-[#05070B] p-1.5 rounded border border-[#161B28] select-all">
                  Start-Process "{typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('null') ? window.location.origin : 'https://ais-dev-qf2ysbvycsvzjyxe4bl6zx-187094173481.us-west2.run.app'}"
                </code>
              </div>
            ) : (
              <div className="bg-[#0A0D15]/60 border border-[#1E2536] p-2 rounded-xs flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Lock className="w-3 h-3 text-[#FFDAB9]" />
                  <span className="text-[9px]">OWNER RUNNER LOCKED</span>
                </div>
                <button
                  onClick={openAuthModal}
                  className="px-2 py-0.5 bg-[#1B2236] hover:bg-[#25304B] border border-[#2B3857] text-[#FFDAB9] rounded-xs text-[9px] font-bold cursor-pointer"
                >
                  OWNER UNLOCK
                </button>
              </div>
            )}
          </div>
        )}

        {/* INSPECTOR TAB */}
        {activeTab === 'inspector' && (
          <div className="space-y-3.5 overflow-y-auto">
            <div className="text-[11px] font-bold text-[#FFDAB9] pb-1 border-b border-[#212634] flex items-center justify-between">
              <span>ACTIVE CLIP PROPERTIES</span>
              <span className="text-[#8E99A8]">V1 TRACK</span>
            </div>

            {/* Transform Controls */}
            <div className="space-y-2">
              <span className="text-[10px] text-[#8E99A8] block">TRANSFORM &amp; SCALE</span>
              <div>
                <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                  <span>SCALE</span>
                  <span className="text-[#E0FFFF]">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-[#E0FFFF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                  <span>OPACITY</span>
                  <span className="text-[#FFDAB9]">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-[#FFDAB9] cursor-pointer"
                />
              </div>
            </div>

            {/* Speed Ramping */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#8E99A8] block">OPTICAL FLOW SPEED RAMP</label>
              <select
                value={speedRamp}
                onChange={(e) => setSpeedRamp(e.target.value)}
                className="w-full bg-[#08090C] border border-[#222736] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
              >
                <option>1.0x (Normal)</option>
                <option>0.5x (Slow-Motion 120fps Flow)</option>
                <option>0.25x (Super Slow-Mo)</option>
                <option>2.0x (Hyperlapse)</option>
                <option>-1.0x (Reverse Master)</option>
              </select>
            </div>

            {/* Composite Blend Mode */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#8E99A8] block">COMPOSITE BLEND MODE</label>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full bg-[#08090C] border border-[#222736] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
              >
                <option>Normal (Direct)</option>
                <option>Screen (Specular Overlay)</option>
                <option>Multiply (Obsidian Shadow)</option>
                <option>Linear Dodge / Add</option>
                <option>Color Grade Passthrough</option>
              </select>
            </div>

            {/* Export & Delivery Presets Section */}
            <div className="pt-2 border-t border-[#212634] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#00F5D4] block font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#00F5D4]" />
                  <span>QUICK APPLY EXPORT PRESET</span>
                </span>
                {quickApplyNotice ? (
                  <span className="text-[9px] text-[#00F5D4] font-bold animate-pulse">
                    ✓ APPLIED!
                  </span>
                ) : (
                  <span className="text-[9px] text-[#FFDAB9] uppercase font-mono">
                    {availablePresets.length} PRESETS
                  </span>
                )}
              </div>

              {/* Quick Apply Dropdown Menu & Action Button */}
              <div className="p-2 bg-[#0A0D15] border border-[#242C3D] rounded-xs space-y-1.5 shadow-inner">
                <div className="flex gap-1.5">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => {
                      setSelectedPresetId(e.target.value);
                      handleQuickApply(e.target.value);
                    }}
                    className="flex-1 bg-[#121520] border border-[#2E374D] px-2 py-1.5 text-[#F5FFFA] rounded-xs text-[10px] outline-none focus:border-[#00F5D4] cursor-pointer"
                  >
                    {availablePresets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} ({preset.container})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleQuickApply()}
                    className="px-2.5 py-1.5 bg-[#00F5D4] hover:bg-[#20D2B8] text-black font-black text-[10px] rounded-xs cursor-pointer shadow-[0_0_8px_rgba(0,245,212,0.3)] transition-all flex items-center gap-1 shrink-0"
                    title="Quick Apply selected preset immediately"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>APPLY</span>
                  </button>
                </div>
                <div className="text-[9px] text-[#8E99A8] flex items-center justify-between px-0.5">
                  <span>Codec: {availablePresets.find(p => p.id === selectedPresetId)?.codec || 'ProRes'}</span>
                  <span className="text-[#00F5D4]">{availablePresets.find(p => p.id === selectedPresetId)?.resolution.split(' ')[0] || '4K'}</span>
                </div>
              </div>

              {/* Active preset summary card */}
              <div className="p-2.5 bg-[#141721] border border-[#262C3D] rounded-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5FFFA] text-[11px] truncate">
                    {activeExportPreset.name}
                  </span>
                  <span className="text-[9px] text-[#E0FFFF] font-bold">
                    {activeExportPreset.container}
                  </span>
                </div>

                <div className="text-[10px] text-[#8E99A8] flex flex-wrap items-center gap-1 leading-tight">
                  <span className="text-[#E0FFFF]">{activeExportPreset.codec}</span>
                  <span className="text-[#3A4150]">·</span>
                  <span className="text-[#FFDAB9]">{activeExportPreset.bitrate}</span>
                  <span className="text-[#3A4150]">·</span>
                  <span>{activeExportPreset.resolution.split(' ')[0]}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex-1 py-1 px-2 bg-[#1B2130] hover:bg-[#252E44] border border-[#FFDAB9]/30 text-[#FFDAB9] rounded-xs font-bold text-[10px] cursor-pointer text-center transition-colors"
                  >
                    CONFIG / ALL PRESETS
                  </button>

                  <button
                    onClick={() => {
                      onExecuteCommand(`render --preset "${activeExportPreset.name}" --codec "${activeExportPreset.codec}" --container "${activeExportPreset.container}"`);
                    }}
                    className="py-1 px-2.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold text-[10px] rounded-xs cursor-pointer hover:brightness-110 transition-all flex items-center gap-1"
                    title="Render Timeline with Active Preset"
                  >
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>RENDER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLOUD FABRICATOR TAB */}
        {activeTab === 'fabricator' && (
          <div className="space-y-3 overflow-y-auto">
            <div className="text-[11px] font-bold text-[#FC8EAC] pb-1 border-b border-[#212634] flex items-center justify-between">
              <span>INFINITY-CORE FABRICATOR</span>
              <span className="text-[#E0FFFF]">STANDALONE</span>
            </div>

            {/* Node Telemetry Matrix */}
            <div className="space-y-2">
              <div className="p-2 bg-[#141720] border border-[#232838] rounded-xs space-y-1">
                <div className="flex justify-between items-center text-[#E0FFFF]">
                  <span>GPU KERNEL DISPATCH</span>
                  <span className="font-bold">wgpu / Vulkan</span>
                </div>
                <div className="w-full h-1 bg-[#090A0D] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E0FFFF] w-[68%]" />
                </div>
                <span className="text-[10px] text-[#8E99A8]">32 Shading Units · Zero Queue Lock</span>
              </div>

              <div className="p-2 bg-[#141720] border border-[#232838] rounded-xs space-y-1">
                <div className="flex justify-between items-center text-[#FFDAB9]">
                  <span>VRAM MEMORY CACHE</span>
                  <span className="font-bold">{telemetry.memoryBufferMb} MB / 8192 MB</span>
                </div>
                <div className="w-full h-1 bg-[#090A0D] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFDAB9] w-[35%]" />
                </div>
                <span className="text-[10px] text-[#8E99A8]">Zero Memory Leak · Frame Buffer Synced</span>
              </div>

              <div className="p-2 bg-[#141720] border border-[#232838] rounded-xs space-y-1">
                <div className="flex justify-between items-center text-[#FC8EAC]">
                  <span>RUST WASM EFRAME THREADS</span>
                  <span className="font-bold">{telemetry.activeThreads} Concurrent</span>
                </div>
                <span className="text-[10px] text-[#8E99A8]">
                  Timeline math executes at native machine clock speed.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Presets Delivery Standards Modal */}
      <ExportPresetsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSelectPresetToRender={(preset) => {
          setActiveExportPreset(preset);
          onExecuteCommand(
            `render --preset "${preset.name}" --codec "${preset.codec}" --container "${preset.container}" --res "${preset.resolution.split(' ')[0]}" --fps "${preset.fps}"`
          );
        }}
        onSavePresetLog={(msg) => onExecuteCommand(`echo "${msg}"`)}
      />
    </div>
  );
};
