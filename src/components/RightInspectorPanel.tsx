import React, { useState } from 'react';
import {
  Sliders,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Activity,
  HardDrive,
  CheckCircle,
  Clock,
  Send,
  Trash2,
  Film,
  Download,
  Share2,
} from 'lucide-react';
import { TerminalLog, TelemetryState, ExportPreset } from '../types';
import { ExportPresetsModal } from './ExportPresetsModal';

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

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commandInput.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === 'presets' || trimmed.toLowerCase() === 'export presets' || trimmed.toLowerCase() === 'export --presets') {
      setIsExportModalOpen(true);
      onExecuteCommand('export presets [modal launched]');
    } else {
      onExecuteCommand(trimmed);
    }
    setCommandInput('');
  };

  const QUICK_COMMANDS = [
    'export presets',
    'tempest status',
    'route --optimize',
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
              <button
                onClick={onClearLogs}
                className="text-[#6D7787] hover:text-[#FC8EAC] cursor-pointer"
                title="Clear Logs"
              >
                <Trash2 className="w-3 h-3" />
              </button>
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
            <div className="flex-1 bg-[#07080B] border border-[#1E232F] rounded-xs p-2 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed">
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
                <span className="text-[10px] text-[#8E99A8] block font-bold">EXPORT DELIVERY PRESET</span>
                <span className="text-[9px] text-[#FFDAB9] uppercase font-mono">{activeExportPreset.category.replace('_', ' ')}</span>
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
