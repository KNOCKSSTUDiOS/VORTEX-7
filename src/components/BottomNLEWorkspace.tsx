import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Volume2,
  VolumeX,
  Sliders,
  Layers,
  Smile,
  Maximize2,
  Film,
  Music,
  Plus,
} from 'lucide-react';
import { TimelineClip } from '../types';

interface BottomNLEWorkspaceProps {
  clips: TimelineClip[];
  currentPlayheadSec: number;
  onSeek: (sec: number) => void;
  isPlaying: boolean;
  onSplitClipAtPlayhead: () => void;
  onDeleteSelectedClip: (id: string) => void;
  onAddClipToTrack: (trackId: string) => void;
}

export const BottomNLEWorkspace: React.FC<BottomNLEWorkspaceProps> = ({
  clips,
  currentPlayheadSec,
  onSeek,
  isPlaying,
  onSplitClipAtPlayhead,
  onDeleteSelectedClip,
  onAddClipToTrack,
}) => {
  const [selectedClipId, setSelectedClipId] = useState<string | null>(clips[0]?.id || null);
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(18); // pixels per second
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const rulerRef = useRef<HTMLDivElement | null>(null);

  // Mixer channel states
  const [channelVols, setChannelVols] = useState({
    master: 85,
    v1: 90,
    a1: 85,
    a2: 95,
  });
  const [mutedChannels, setMutedChannels] = useState<Record<string, boolean>>({});

  const TRACKS = [
    { id: 'V2', name: 'V2 TITLES / FX', type: 'video', color: '#9B5DE5' },
    { id: 'V1', name: 'V1 MASTER CINE', type: 'video', color: '#3A86FF' },
    { id: 'FX', name: 'FX COLOR GRADE', type: 'fx', color: '#FC8EAC' },
    { id: 'A1', name: 'A1 DIALOGUE', type: 'audio', color: '#E0FFFF' },
    { id: 'A2', name: 'A2 808 SUB BASS', type: 'audio', color: '#FFDAB9' },
    { id: 'LIP', name: 'LIP-SYNC PHONEME', type: 'lip', color: '#00F5D4' },
  ];

  // Scrubbing logic
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleTimelineMouseMove(e);
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrubbing && e.buttons !== 1) return;
    const ruler = rulerRef.current;
    if (!ruler) return;
    const rect = ruler.getBoundingClientRect();
    const offsetX = Math.max(0, e.clientX - rect.left);
    const newSec = Math.max(0, offsetX / zoomScale);
    onSeek(newSec);
  };

  const handleTimelineMouseUp = () => {
    setIsScrubbing(false);
  };

  const toggleMute = (ch: string) => {
    setMutedChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  // Generate ruler markers (every 5 seconds)
  const rulerTicks: number[] = [];
  for (let s = 0; s <= 60; s += 2) {
    rulerTicks.push(s);
  }

  return (
    <div
      onMouseUp={handleTimelineMouseUp}
      className="h-64 flex flex-col bg-[#0D0F14] border-t border-[#262B37] select-none text-xs font-mono"
    >
      {/* Timeline Controls Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#141720] border-b border-[#212634]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#FFDAB9] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FFDAB9]" />
            MULTI-TRACK NLE TIMELINE
          </span>
          <span className="text-[#2F3545]">|</span>

          {/* Edit Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSplitClipAtPlayhead}
              className="flex items-center gap-1 px-2.5 py-0.5 bg-[#1B202D] hover:bg-[#262D3F] text-[#E0FFFF] border border-[#2B3448] rounded-xs cursor-pointer"
              title="Split clip at playhead [Ctrl+K / Razor]"
            >
              <Scissors className="w-3 h-3" />
              <span>SPLIT / RAZOR</span>
            </button>

            {selectedClipId && (
              <button
                onClick={() => onDeleteSelectedClip(selectedClipId)}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-[#1B202D] hover:bg-[#331E27] text-[#FC8EAC] border border-[#2B3448] rounded-xs cursor-pointer"
                title="Delete Selected Clip"
              >
                <Trash2 className="w-3 h-3" />
                <span>RIPPLE DELETE</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Tools: Audio Mixer toggle & Timeline Zoom */}
        <div className="flex items-center gap-3">
          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E99A8]">
            <span>ZOOM:</span>
            <input
              type="range"
              min="10"
              max="40"
              value={zoomScale}
              onChange={(e) => setZoomScale(Number(e.target.value))}
              className="w-16 accent-[#FFDAB9] cursor-pointer"
            />
          </div>

          <button
            onClick={() => setShowMixer(!showMixer)}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 border rounded-xs cursor-pointer ${
              showMixer
                ? 'bg-[#1E2534] border-[#FFDAB9] text-[#FFDAB9] font-bold'
                : 'bg-[#141720] border-[#2A3041] text-[#8E99A8] hover:text-[#F5FFFA]'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>{showMixer ? 'HIDE MIXER' : 'AUDIO MIXER (VU)'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body: Tracks or Audio Mixer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left sidebar) */}
        <div className="w-40 bg-[#101218] border-r border-[#212634] flex flex-col shrink-0">
          {/* Ruler spacer */}
          <div className="h-6 bg-[#161822] border-b border-[#212634] px-2 flex items-center text-[10px] text-[#6D7787]">
            TRACK
          </div>

          {/* Track name rows */}
          {TRACKS.map((track) => (
            <div
              key={track.id}
              className="h-8 flex items-center justify-between px-2 border-b border-[#1C202B] hover:bg-[#161922] transition-colors"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span
                  className="w-1.5 h-3 rounded-xs shrink-0"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-[11px] font-bold text-[#A6B0BE] truncate">
                  {track.name}
                </span>
              </div>

              <button
                onClick={() => onAddClipToTrack(track.id)}
                className="text-[#6D7787] hover:text-[#FFDAB9] p-0.5 cursor-pointer"
                title={`Add clip to ${track.id}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Area */}
        <div
          ref={rulerRef}
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          className="flex-1 overflow-x-auto relative flex flex-col bg-[#0A0B0E] cursor-pointer"
        >
          {/* Time Ruler */}
          <div className="h-6 bg-[#13151D] border-b border-[#212634] relative select-none shrink-0">
            {rulerTicks.map((sec) => (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-[#262B3A] text-[9px] text-[#6D7787] pl-1 pt-0.5"
                style={{ left: `${sec * zoomScale}px` }}
              >
                {sec % 10 === 0 ? `00:${sec < 10 ? '0' : ''}${sec}` : '|'}
              </div>
            ))}
          </div>

          {/* Playhead Red Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FC8EAC] z-20 pointer-events-none shadow-[0_0_8px_#FC8EAC]"
            style={{ left: `${currentPlayheadSec * zoomScale}px` }}
          >
            <div className="w-2.5 h-3 bg-[#FC8EAC] -ml-1 -top-1 absolute rounded-b-xs" />
          </div>

          {/* Track Lanes */}
          <div className="flex-1 flex flex-col relative min-w-[1200px]">
            {TRACKS.map((track) => {
              const trackClips = clips.filter((c) => c.trackId === track.id);

              return (
                <div
                  key={track.id}
                  className="h-8 border-b border-[#191D27] relative flex items-center bg-[#0C0E14]"
                >
                  {/* Grid lines */}
                  {rulerTicks.map((sec) => (
                    <div
                      key={sec}
                      className="absolute top-0 bottom-0 border-l border-[#141720]"
                      style={{ left: `${sec * zoomScale}px` }}
                    />
                  ))}

                  {/* Render Clips in this track */}
                  {trackClips.map((clip) => {
                    const isSelected = clip.id === selectedClipId;
                    const clipWidth = Math.max(20, clip.durationSec * zoomScale);
                    const clipLeft = clip.startSec * zoomScale;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClipId(clip.id);
                        }}
                        className={`absolute h-6.5 rounded-xs px-2 flex items-center justify-between text-[10px] font-bold shadow-md transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-1 ring-[#FFDAB9] brightness-125 z-10'
                            : 'brightness-90 hover:brightness-110'
                        }`}
                        style={{
                          left: `${clipLeft}px`,
                          width: `${clipWidth}px`,
                          backgroundColor: clip.color,
                          color: '#0A0B0E',
                        }}
                      >
                        <span className="truncate">{clip.title}</span>

                        {clip.visemePhoneme && (
                          <span className="text-[9px] bg-black/30 px-1 rounded-xs text-[#F5FFFA] ml-1 shrink-0 font-mono">
                            {clip.visemePhoneme}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Audio Mixer Panel (Right Overlay) */}
        {showMixer && (
          <div className="w-72 bg-[#10131A] border-l border-[#242938] p-3 flex flex-col justify-between shrink-0">
            <div className="flex items-center justify-between pb-1 border-b border-[#212634] text-[11px] font-bold text-[#FFDAB9]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#FFDAB9]" />
                MULTI-CHANNEL AUDIO MIXER
              </span>
              <span className="text-[10px] text-[#8E99A8]">24-BIT / 48kHz</span>
            </div>

            {/* Mixer Fader Channels */}
            <div className="grid grid-cols-4 gap-2 pt-2 items-end text-center">
              {[
                { id: 'v1', label: 'CINE', color: '#3A86FF', val: channelVols.v1 },
                { id: 'a1', label: 'VOICE', color: '#E0FFFF', val: channelVols.a1 },
                { id: 'a2', label: '808 SUB', color: '#FFDAB9', val: channelVols.a2 },
                { id: 'master', label: 'MASTER', color: '#FC8EAC', val: channelVols.master },
              ].map((ch) => {
                const isMuted = mutedChannels[ch.id];
                const vuHeight = isPlaying && !isMuted ? (ch.val * 0.75 + Math.random() * 20) : 10;

                return (
                  <div key={ch.id} className="flex flex-col items-center space-y-1">
                    {/* Simulated VU Meter */}
                    <div className="w-2.5 h-16 bg-[#090A0D] border border-[#212634] rounded-xs overflow-hidden flex flex-col justify-end p-0.5">
                      <div
                        className="w-full bg-gradient-to-t from-[#2EC4B6] via-[#FFDAB9] to-[#FC8EAC] transition-all duration-75"
                        style={{ height: `${vuHeight}%` }}
                      />
                    </div>

                    {/* Fader slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ch.val}
                      onChange={(e) =>
                        setChannelVols({ ...channelVols, [ch.id]: Number(e.target.value) })
                      }
                      className="w-12 -rotate-90 my-3 accent-[#FFDAB9] cursor-pointer"
                    />

                    {/* Mute button */}
                    <button
                      onClick={() => toggleMute(ch.id)}
                      className={`text-[9px] px-1 py-0.5 rounded-xs border cursor-pointer ${
                        isMuted ? 'bg-[#FC8EAC] text-[#0A0A0A] font-bold' : 'text-[#8E99A8] border-[#232734]'
                      }`}
                    >
                      {isMuted ? 'M' : 'M'}
                    </button>

                    <span className="text-[10px] text-[#A6B0BE] font-bold">{ch.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
