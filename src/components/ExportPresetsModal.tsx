import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Download,
  Film,
  Zap,
  CheckCircle,
  Copy,
  Sliders,
  Share2,
  Layers,
  Sparkles,
  Search,
  HardDrive,
  Tv,
  Smartphone,
  Video,
} from 'lucide-react';
import { ExportPreset, PresetCategory } from '../types';

interface ExportPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPresetToRender: (preset: ExportPreset) => void;
  onSavePresetLog: (message: string) => void;
}

const FACTORY_PRESETS: ExportPreset[] = [
  {
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
    notes: 'Official high-aperture cinema standard for 70mm dome and dual-laser IMAX laser systems.',
  },
  {
    id: 'preset_cinemascope_dci',
    name: 'Cinemascope 2.39:1 Anamorphic Theatrical',
    category: 'cinema',
    codec: 'Avid DNxHR HQX 12-bit',
    container: 'MXF OP1a',
    bitrate: '220 Mbps',
    resolution: '4096x1716 (Scope 2.39:1)',
    fps: '24.000 fps',
    colorSpace: 'DCI-P3 D65 Theater',
    audioChannels: 'Dolby Digital 5.1 Surround',
    isDefault: true,
    notes: 'Calibrated theatrical release DCP container with pristine dynamic range and shadow recovery.',
  },
  {
    id: 'preset_social_vertical',
    name: 'Social Media Vertical 9:16 (TikTok / Reels / Shorts)',
    category: 'social_media',
    codec: 'H.265 / HEVC Main 10',
    container: 'MP4',
    bitrate: '32 Mbps VBR 2-Pass',
    resolution: '1080x1920 (9:16 Vertical)',
    fps: '60.000 fps',
    colorSpace: 'Rec.709 sRGB',
    audioChannels: 'AAC-LC Stereo 320 kbps 48kHz',
    isDefault: true,
    notes: 'Optimized high-frame-rate vertical packaging with mobile-first audio normalization (-14 LUFS).',
  },
  {
    id: 'preset_social_square',
    name: 'Social Media Feed Square 1:1 Cinematic',
    category: 'social_media',
    codec: 'H.264 High Profile L5.1',
    container: 'MP4',
    bitrate: '20 Mbps CBR',
    resolution: '1080x1080 (1:1 Square)',
    fps: '30.000 fps',
    colorSpace: 'Rec.709 sRGB',
    audioChannels: 'AAC Stereo 256 kbps',
    isDefault: true,
    notes: 'Universal social feed square aspect ratio with fast moov atom web-streaming header.',
  },
  {
    id: 'preset_broadcast_uhd',
    name: 'Broadcast 4K UHD Ultra HDR Master',
    category: 'broadcast',
    codec: 'AV1 10-bit High Fidelity',
    container: 'MKV',
    bitrate: '65 Mbps Constrained Quality',
    resolution: '3840x2160 (4K UHD 16:9)',
    fps: '60.000 fps',
    colorSpace: 'Rec.2020 HLG HDR',
    audioChannels: '5.1 Linear PCM 24-bit 96kHz',
    isDefault: true,
    notes: 'Next-gen open media broadcast container with SMPTE ST 2084 metadata.',
  },
];

const LOCAL_STORAGE_KEY = 'knocks_custom_export_presets';

export const ExportPresetsModal: React.FC<ExportPresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPresetToRender,
  onSavePresetLog,
}) => {
  const [presets, setPresets] = useState<ExportPreset[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...FACTORY_PRESETS, ...parsed];
      }
    } catch {
      // Fallback
    }
    return FACTORY_PRESETS;
  });

  const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(FACTORY_PRESETS[0].id);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Preset Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'imax' | 'cinema' | 'social_media' | 'broadcast' | 'custom'>('custom');
  const [formCodec, setFormCodec] = useState('Apple ProRes 4444 XQ');
  const [formContainer, setFormContainer] = useState('MOV');
  const [formBitrate, setFormBitrate] = useState('150 Mbps');
  const [formResolution, setFormResolution] = useState('4096x2864 (IMAX 1.43:1)');
  const [formFps, setFormFps] = useState('24.000 fps');
  const [formColorSpace, setFormColorSpace] = useState('ACEScc / Rec.2020 PQ HDR');
  const [formAudioChannels, setFormAudioChannels] = useState('DTS:X 12-Channel Spatial 48kHz 24-bit');
  const [formNotes, setFormNotes] = useState('');

  // Render Simulation Feedback
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [renderedPresetName, setRenderedPresetName] = useState<string | null>(null);

  // Save custom presets to localStorage whenever presets state changes
  const saveCustomPresetsToStorage = (updatedList: ExportPreset[]) => {
    const customOnly = updatedList.filter((p) => !p.isDefault);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  // Filtering
  const filteredPresets = presets.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'custom' ? !p.isDefault : p.category === selectedCategory);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.container.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.resolution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartCreate = (basePreset?: ExportPreset) => {
    if (basePreset) {
      setFormName(`${basePreset.name} (Custom Variant)`);
      setFormCategory('custom');
      setFormCodec(basePreset.codec);
      setFormContainer(basePreset.container);
      setFormBitrate(basePreset.bitrate);
      setFormResolution(basePreset.resolution);
      setFormFps(basePreset.fps);
      setFormColorSpace(basePreset.colorSpace);
      setFormAudioChannels(basePreset.audioChannels);
      setFormNotes(`Based on ${basePreset.name}.`);
    } else {
      setFormName('Custom Studio Delivery Spec');
      setFormCategory('custom');
      setFormCodec('Apple ProRes 4444 XQ');
      setFormContainer('MOV');
      setFormBitrate('180 Mbps');
      setFormResolution('4096x2864 (IMAX 1.43:1)');
      setFormFps('60.000 fps');
      setFormColorSpace('ACEScc / Rec.2020 PQ HDR');
      setFormAudioChannels('DTS:X 12-Channel Spatial 48kHz 24-bit');
      setFormNotes('Custom high-bitrate master configured in KNOCKSSTUDiOS.');
    }
    setIsCreatingNew(true);
  };

  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newPreset: ExportPreset = {
      id: 'custom_' + Date.now(),
      name: formName.trim(),
      category: formCategory,
      codec: formCodec,
      container: formContainer,
      bitrate: formBitrate,
      resolution: formResolution,
      fps: formFps,
      colorSpace: formColorSpace,
      audioChannels: formAudioChannels,
      isDefault: false,
      notes: formNotes.trim() || 'Custom user delivery profile.',
      createdAt: new Date().toLocaleTimeString(),
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    saveCustomPresetsToStorage(updated);
    setSelectedPresetId(newPreset.id);
    setIsCreatingNew(false);
    onSavePresetLog(`Saved custom export preset: "${newPreset.name}" [${newPreset.codec} / ${newPreset.container}]`);
  };

  const handleDeletePreset = (id: string, name: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    saveCustomPresetsToStorage(updated);
    if (selectedPresetId === id) {
      setSelectedPresetId(updated[0]?.id || '');
    }
    onSavePresetLog(`Removed custom export preset: "${name}"`);
  };

  const handleTriggerRender = (preset: ExportPreset) => {
    setRenderedPresetName(preset.name);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setRenderProgress(null);
            setRenderedPresetName(null);
            onSelectPresetToRender(preset);
            onClose();
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleExportJSON = (preset: ExportPreset) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onSavePresetLog(`Exported JSON manifest for preset: "${preset.name}"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-mono text-xs">
      {/* Modal Container */}
      <div className="w-full max-w-5xl bg-[#0E1015] border border-[#2D3342] rounded-xs shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141720] border-b border-[#242937]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] p-0.5 shadow-[0_0_12px_rgba(255,218,185,0.35)]">
              <div className="w-full h-full bg-[#0A0A0A] rounded-xs flex items-center justify-center text-[#FFDAB9]">
                <Film className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#F5FFFA] tracking-wide flex items-center gap-2">
                <span>EXPORT &amp; DELIVERY PRESETS MATRIX</span>
                <span className="text-[10px] text-[#E0FFFF] border border-[#E0FFFF]/30 px-1.5 py-0.2 rounded-xs font-mono">
                  LOCAL DISK PERSISTED
                </span>
              </div>
              <div className="text-[11px] text-[#8E99A8]">
                CALIBRATED MASTER CONFIGURATIONS FOR IMAX, CINEMA SCOPE, SOCIAL MEDIA &amp; 4K BROADCAST
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingNew && (
              <button
                onClick={() => handleStartCreate()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs cursor-pointer shadow-[0_0_10px_rgba(255,218,185,0.3)] hover:brightness-110 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW CUSTOM PRESET</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#1A1E29] rounded-xs cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-2.5 bg-[#10131A] border-b border-[#1E232F] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Categories: Buttons as interactive filters */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'ALL STANDARDS' },
              { id: 'imax', label: 'IMAX 1.43:1' },
              { id: 'cinema', label: 'CINEMASCOPE' },
              { id: 'social_media', label: 'SOCIAL MEDIA' },
              { id: 'broadcast', label: 'BROADCAST 4K' },
              { id: 'custom', label: 'CUSTOM PRESETS' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as PresetCategory);
                  setIsCreatingNew(false);
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#1F2535] text-[#FFDAB9] border border-[#FFDAB9]/40 font-bold'
                    : 'text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#151922]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#6D7787]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter codec, container..."
              className="w-full bg-[#08090C] border border-[#232838] pl-8 pr-2.5 py-1 text-[#F5FFFA] rounded-xs text-[11px] outline-none focus:border-[#E0FFFF]"
            />
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Presets List (5 cols) */}
          <div className="lg:col-span-5 bg-[#0C0E14] border-r border-[#212634] flex flex-col overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#1A1F2C] text-[10px] text-[#6D7787]">
              <span>AVAILABLE CONFIGURATIONS ({filteredPresets.length})</span>
              <span>STANDARDS</span>
            </div>

            {filteredPresets.length === 0 && (
              <div className="text-center py-12 text-[#6D7787] text-[11px] space-y-2">
                <p>No presets found matching your filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1 bg-[#161922] text-[#FFDAB9] rounded-xs cursor-pointer hover:bg-[#1F2432]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {filteredPresets.map((preset) => {
              const isSelected = preset.id === selectedPresetId && !isCreatingNew;

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setIsCreatingNew(false);
                  }}
                  className={`p-3 rounded-xs border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#181D29] border-[#FFDAB9] shadow-lg ring-1 ring-[#FFDAB9]/40'
                      : 'bg-[#11141C] border-[#222736] hover:border-[#333C52]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="font-bold text-[#F5FFFA] text-[11px] truncate flex items-center gap-1.5">
                      {preset.category === 'imax' && <Film className="w-3 h-3 text-[#FFDAB9] shrink-0" />}
                      {preset.category === 'cinema' && <Video className="w-3 h-3 text-[#FC8EAC] shrink-0" />}
                      {preset.category === 'social_media' && <Smartphone className="w-3 h-3 text-[#E0FFFF] shrink-0" />}
                      {preset.category === 'broadcast' && <Tv className="w-3 h-3 text-[#9B5DE5] shrink-0" />}
                      {preset.category === 'custom' && <Sliders className="w-3 h-3 text-[#00F5D4] shrink-0" />}
                      <span className="truncate">{preset.name}</span>
                    </div>

                    <span className="text-[9px] uppercase tracking-wider text-[#A6B0BE] shrink-0">
                      {preset.isDefault ? 'SYSTEM' : 'CUSTOM'}
                    </span>
                  </div>

                  {/* Clean unboxed metadata with subtle separators */}
                  <div className="text-[10px] text-[#8E99A8] flex flex-wrap items-center gap-1.5 leading-tight">
                    <span className="text-[#E0FFFF] font-semibold">{preset.codec}</span>
                    <span className="text-[#3A4150]">·</span>
                    <span className="text-[#FFDAB9]">{preset.container}</span>
                    <span className="text-[#3A4150]">·</span>
                    <span>{preset.resolution.split(' ')[0]}</span>
                    <span className="text-[#3A4150]">·</span>
                    <span>{preset.fps}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Inspector or Create Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#0E1117] flex flex-col overflow-y-auto p-5">
            {isCreatingNew ? (
              /* FORM: Create Custom Preset */
              <form onSubmit={handleSaveCustomPreset} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#222736]">
                  <div>
                    <span className="font-extrabold text-sm text-[#FFDAB9] block">
                      CREATE CUSTOM RENDER SPECIFICATION
                    </span>
                    <span className="text-[10px] text-[#8E99A8]">
                      Save custom codec, bitrate, and container parameters to local pipeline memory.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-[#8E99A8] hover:text-[#F5FFFA] text-[11px] underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Preset Name & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">PRESET NAME</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. IMAX 70mm Festival Archive"
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none focus:border-[#FFDAB9]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">DELIVERY CATEGORY</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option value="imax">IMAX Standard (1.43:1 / Dome)</option>
                      <option value="cinema">Theatrical Scope (2.39:1 DCI)</option>
                      <option value="social_media">Social Media (Vertical / Square)</option>
                      <option value="broadcast">Broadcast / OTT Streaming</option>
                      <option value="custom">Custom Engineering Pipeline</option>
                    </select>
                  </div>
                </div>

                {/* Codec & Container */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">VIDEO CODEC</label>
                    <select
                      value={formCodec}
                      onChange={(e) => setFormCodec(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>Apple ProRes 4444 XQ</option>
                      <option>Apple ProRes 422 HQ</option>
                      <option>Avid DNxHR HQX 12-bit</option>
                      <option>H.265 / HEVC Main 10</option>
                      <option>H.264 High Profile L5.1</option>
                      <option>AV1 10-bit High Fidelity</option>
                      <option>VP9 Broadcast Profile 2</option>
                      <option>Uncompressed YUV 4:2:2 10-bit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">CONTAINER WRAPPER</label>
                    <select
                      value={formContainer}
                      onChange={(e) => setFormContainer(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>MOV (QuickTime Master)</option>
                      <option>MP4 (MPEG-4 Part 14)</option>
                      <option>MXF OP1a (SMPTE Broadcast)</option>
                      <option>MKV (Matroska Digital)</option>
                      <option>WebM (Open Media)</option>
                    </select>
                  </div>
                </div>

                {/* Bitrate & Resolution */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">BITRATE ENCODING</label>
                    <select
                      value={formBitrate}
                      onChange={(e) => setFormBitrate(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>380 Mbps (Near-Lossless Master)</option>
                      <option>220 Mbps (DCI Theatrical)</option>
                      <option>120 Mbps (High-Density Archive)</option>
                      <option>65 Mbps (4K UHD Broadcast)</option>
                      <option>32 Mbps VBR 2-Pass (Social High)</option>
                      <option>18 Mbps CBR (Web Stream)</option>
                      <option>Custom Uncompressed Bitstream</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">OUTPUT RESOLUTION</label>
                    <select
                      value={formResolution}
                      onChange={(e) => setFormResolution(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>4096x2864 (IMAX 1.43:1)</option>
                      <option>4096x1716 (Scope 2.39:1)</option>
                      <option>3840x2160 (4K UHD 16:9)</option>
                      <option>1920x1080 (1080p FHD 16:9)</option>
                      <option>1080x1920 (9:16 Vertical Social)</option>
                      <option>1080x1080 (1:1 Square Social)</option>
                      <option>1080x1350 (4:5 Portrait Social)</option>
                      <option>7680x4320 (8K Full Master)</option>
                    </select>
                  </div>
                </div>

                {/* Framerate, Color Space & Audio */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">FRAME RATE</label>
                    <select
                      value={formFps}
                      onChange={(e) => setFormFps(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>24.000 fps (Cinema)</option>
                      <option>23.976 fps (NTSC Film)</option>
                      <option>25.000 fps (PAL)</option>
                      <option>29.970 fps (Broadcast)</option>
                      <option>30.000 fps (Web)</option>
                      <option>60.000 fps (High-FPS Master)</option>
                      <option>120.00 fps (High-Speed FX)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">COLOR SPACE / HDR</label>
                    <select
                      value={formColorSpace}
                      onChange={(e) => setFormColorSpace(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>ACEScc / Rec.2020 PQ HDR</option>
                      <option>DCI-P3 D65 Theater</option>
                      <option>Rec.709 sRGB Standard</option>
                      <option>Rec.2020 HLG Broadcast</option>
                      <option>Linear sRGB Raw</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8E99A8] block mb-1">AUDIO MATRIX</label>
                    <select
                      value={formAudioChannels}
                      onChange={(e) => setFormAudioChannels(e.target.value)}
                      className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none"
                    >
                      <option>DTS:X 12-Channel Spatial 48kHz 24-bit</option>
                      <option>Dolby Digital 5.1 Surround</option>
                      <option>AAC-LC Stereo 320 kbps</option>
                      <option>24-bit Linear PCM Stereo</option>
                      <option>Binaural 3D Ambisonics</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] text-[#8E99A8] block mb-1">DELIVERY NOTES &amp; COMPLIANCE</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Delivery criteria, mastering notes, sound target (e.g. -14 LUFS)..."
                    className="w-full bg-[#08090C] border border-[#232838] p-2 text-[#F5FFFA] rounded-xs text-[11px] outline-none resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2 bg-[#171B24] hover:bg-[#202534] text-[#8E99A8] rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold rounded-xs cursor-pointer shadow-[0_0_15px_rgba(255,218,185,0.4)]"
                  >
                    Save Preset Configuration
                  </button>
                </div>
              </form>
            ) : selectedPreset ? (
              /* VIEW: Preset Details & Actions */
              <div className="space-y-4">
                {/* Preset Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#222736]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-[#F5FFFA]">
                        {selectedPreset.name}
                      </span>
                      <span className="text-[10px] text-[#FFDAB9] border border-[#FFDAB9]/40 px-1.5 py-0.2 rounded-xs font-mono uppercase">
                        {selectedPreset.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#8E99A8] mt-0.5">
                      {selectedPreset.notes || 'Calibrated cinema master configuration.'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportJSON(selectedPreset)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#151922] border border-[#262B3B] hover:border-[#E0FFFF]/50 text-[#E0FFFF] rounded-xs cursor-pointer"
                      title="Download JSON Spec Manifest"
                    >
                      <Download className="w-3 h-3" />
                      <span>JSON SPEC</span>
                    </button>

                    <button
                      onClick={() => handleStartCreate(selectedPreset)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#151922] border border-[#262B3B] hover:border-[#FFDAB9]/50 text-[#FFDAB9] rounded-xs cursor-pointer"
                      title="Duplicate as new custom preset"
                    >
                      <Copy className="w-3 h-3" />
                      <span>DUPLICATE</span>
                    </button>

                    {!selectedPreset.isDefault && (
                      <button
                        onClick={() => handleDeletePreset(selectedPreset.id, selectedPreset.name)}
                        className="p-1 text-[#FC8EAC] hover:bg-[#2A1822] border border-[#FC8EAC]/30 rounded-xs cursor-pointer"
                        title="Delete custom preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#12151D] border border-[#212635] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#6D7787] block font-mono">CODEC &amp; COMPRESSION</span>
                    <span className="font-bold text-[#E0FFFF] block text-[13px]">{selectedPreset.codec}</span>
                    <div className="text-[10px] text-[#8E99A8] pt-1 border-t border-[#1B1F2C]">
                      Bitrate: <strong className="text-[#FFDAB9]">{selectedPreset.bitrate}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#12151D] border border-[#212635] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#6D7787] block font-mono">CONTAINER &amp; WRAPPER</span>
                    <span className="font-bold text-[#FC8EAC] block text-[13px]">{selectedPreset.container}</span>
                    <div className="text-[10px] text-[#8E99A8] pt-1 border-t border-[#1B1F2C]">
                      Target standard: <strong className="text-[#F5FFFA]">{selectedPreset.category.toUpperCase()}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#12151D] border border-[#212635] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#6D7787] block font-mono">RASTER &amp; TIMELINE</span>
                    <span className="font-bold text-[#FFDAB9] block text-[13px]">{selectedPreset.resolution}</span>
                    <div className="text-[10px] text-[#8E99A8] pt-1 border-t border-[#1B1F2C]">
                      Frame rate: <strong className="text-[#F5FFFA]">{selectedPreset.fps}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#12151D] border border-[#212635] rounded-xs space-y-1">
                    <span className="text-[10px] text-[#6D7787] block font-mono">COLOR SCIENCE &amp; MASTERING</span>
                    <span className="font-bold text-[#F5FFFA] block text-[13px]">{selectedPreset.colorSpace}</span>
                    <div className="text-[10px] text-[#8E99A8] pt-1 border-t border-[#1B1F2C]">
                      Audio: <strong className="text-[#E0FFFF]">{selectedPreset.audioChannels}</strong>
                    </div>
                  </div>
                </div>

                {/* Delivery Standard Information Callout */}
                <div className="p-3.5 bg-[#141822] border border-[#262E40] rounded-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#FFDAB9] font-bold text-[11px]">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>DELIVERY PIPELINE COMPLIANCE</span>
                  </div>

                  <p className="text-[11px] text-[#A6B0BE] leading-relaxed">
                    Render queue utilizes <strong>TEMPEST_STUDiO</strong> multi-threaded worker nodes with zero queue locking.
                    Timeline math and color transforms are computed via local <strong>Rust/WASM (`eframe`/`wgpu`)</strong>.
                  </p>
                </div>

                {/* Simulated Render Progress */}
                {renderProgress !== null && (
                  <div className="p-3 bg-[#141A26] border border-[#E0FFFF]/40 rounded-xs space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#E0FFFF] font-bold">
                        DISPATCHING RENDER PIPELINE: {renderedPresetName}
                      </span>
                      <span className="text-[#FFDAB9]">{renderProgress}%</span>
                    </div>

                    <div className="w-full h-2 bg-[#090A0E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] transition-all duration-200"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Render Button */}
                <div className="pt-3">
                  <button
                    onClick={() => handleTriggerRender(selectedPreset)}
                    disabled={renderProgress !== null}
                    className="w-full py-3.5 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold text-sm tracking-wider uppercase rounded-xs transition-all hover:shadow-[0_0_25px_rgba(255,218,185,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {renderProgress !== null
                        ? `RENDERING QUEUE (${renderProgress}%)`
                        : `RENDER WITH PRESET: ${selectedPreset.name}`}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#10131A] border-t border-[#212634] flex items-center justify-between text-[11px] text-[#8E99A8]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0FFFF]" />
            <span>KNOCKS RENDER QUEUE: READY</span>
            <span className="text-[#3A4150]">·</span>
            <span>PRORES / DNXHR / H.265 / AV1 CERTIFIED</span>
          </div>

          <div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#171B24] hover:bg-[#222736] text-[#A6B0BE] rounded-xs cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
