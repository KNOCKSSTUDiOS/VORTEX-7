import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Film,
  Camera,
  Smile,
  Download,
  Shield,
  Layers,
} from 'lucide-react';
import { StoryboardScene } from '../types';

interface ScriptStoryboardEditorProps {
  scenes: StoryboardScene[];
  onAddScene: () => void;
  onUpdateScene: (id: string, updated: Partial<StoryboardScene>) => void;
  onDeleteScene: (id: string) => void;
}

export const ScriptStoryboardEditor: React.FC<ScriptStoryboardEditorProps> = ({
  scenes,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0];

  const handleExportScript = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scenes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'KNOCKSSTUDiOS_SCRIPT_STORYBOARD.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] border-t border-[#232734] select-none text-xs font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12141C] border-b border-[#212634]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#E0FFFF] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#E0FFFF]" />
            SCRIPT &amp; STORYBOARD PROTECTIONIST EDITOR
          </span>
          <span className="text-[#2E3444]">|</span>
          <span className="text-[#8E99A8]">TOTAL SCENES: {scenes.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddScene}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1F2B] hover:bg-[#252C3E] text-[#FFDAB9] border border-[#2D364A] rounded-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD SCENE BEAT</span>
          </button>

          <button
            onClick={handleExportScript}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT SCRIPT (JSON)</span>
          </button>
        </div>
      </div>

      {/* Main Split: Scene Card List on Left + Detailed Screenplay Editor on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden items-stretch">
        {/* Scene Cards Strip (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-[#0F1117] border border-[#232734] rounded-xs p-2.5 overflow-y-auto space-y-2">
          <span className="text-[10px] text-[#8E99A8] block pb-1 border-b border-[#1E232F]">
            BEAT SHEET &amp; SCENE TIMELINE
          </span>

          {scenes.map((scene) => {
            const isSelected = scene.id === selectedSceneId;
            return (
              <div
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`p-2.5 rounded-xs border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1C212E] border-[#FFDAB9] shadow-md'
                    : 'bg-[#13161F] border-[#222735] hover:border-[#384157]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] pb-1">
                  <span className="font-bold text-[#FFDAB9]">SCENE {scene.sceneNumber}</span>
                  <span className="text-[#8E99A8]">{scene.durationSec}s · {scene.shotType}</span>
                </div>
                <div className="text-[#E0FFFF] font-semibold text-[11px] truncate mb-1">
                  {scene.slugline}
                </div>
                <p className="text-[#8E99A8] text-[10px] line-clamp-2">{scene.description}</p>
              </div>
            );
          })}
        </div>

        {/* Granular Screenplay Card (8 cols) */}
        {selectedScene && (
          <div className="lg:col-span-8 flex flex-col bg-[#11141A] border border-[#232734] rounded-xs p-4 overflow-y-auto space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#212634]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1F2535] text-[#FFDAB9] font-bold rounded-xs">
                  SCENE {selectedScene.sceneNumber}
                </span>
                <span className="text-[#8E99A8]">LENS: {selectedScene.lensFocal}</span>
              </div>

              <button
                onClick={() => onDeleteScene(selectedScene.id)}
                className="p-1 text-[#FC8EAC] hover:bg-[#2B1B25] rounded-xs cursor-pointer"
                title="Delete Scene"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slugline */}
            <div>
              <label className="text-[10px] text-[#8E99A8] block mb-1">SCENE SLUGLINE</label>
              <input
                type="text"
                value={selectedScene.slugline}
                onChange={(e) => onUpdateScene(selectedScene.id, { slugline: e.target.value })}
                className="w-full bg-[#08090C] border border-[#222736] p-2 text-[#E0FFFF] font-bold rounded-xs outline-none"
              />
            </div>

            {/* Shot Type & Focal Length */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#8E99A8] block mb-1">SHOT FRAMING</label>
                <select
                  value={selectedScene.shotType}
                  onChange={(e) => onUpdateScene(selectedScene.id, { shotType: e.target.value as any })}
                  className="w-full bg-[#08090C] border border-[#222736] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                >
                  <option>Extreme Wide</option>
                  <option>Wide</option>
                  <option>Medium</option>
                  <option>Close-Up</option>
                  <option>Macro Extreme</option>
                  <option>Orbital Drone</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8E99A8] block mb-1">LENS FOCAL LENGTH</label>
                <input
                  type="text"
                  value={selectedScene.lensFocal}
                  onChange={(e) => onUpdateScene(selectedScene.id, { lensFocal: e.target.value })}
                  className="w-full bg-[#08090C] border border-[#222736] p-1.5 text-[#F5FFFA] rounded-xs outline-none"
                />
              </div>
            </div>

            {/* Action Description */}
            <div>
              <label className="text-[10px] text-[#8E99A8] block mb-1">ACTION &amp; VISUAL BEATS</label>
              <textarea
                rows={3}
                value={selectedScene.description}
                onChange={(e) => onUpdateScene(selectedScene.id, { description: e.target.value })}
                className="w-full bg-[#08090C] border border-[#222736] p-2 text-[#F5FFFA] rounded-xs outline-none resize-none"
              />
            </div>

            {/* Dialogue & Lip-Sync Phonemes */}
            <div className="p-3 bg-[#0C0E14] border border-[#202535] rounded-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#FFDAB9] font-bold flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#FFDAB9]" />
                  CHARACTER DIALOGUE &amp; PHONEME MAPPER
                </span>
                <span className="text-[#FC8EAC]">{selectedScene.character}</span>
              </div>

              <textarea
                rows={2}
                value={selectedScene.dialogue}
                onChange={(e) => onUpdateScene(selectedScene.id, { dialogue: e.target.value })}
                className="w-full bg-[#08090C] border border-[#222736] p-2 text-[#F5FFFA] rounded-xs outline-none resize-none"
                placeholder="Character dialogue..."
              />

              <div className="text-[10px] text-[#8E99A8]">
                <span>AUTOMATED LIP-SYNC PHONEMES: </span>
                <span className="text-[#E0FFFF] font-bold">
                  {selectedScene.dialogue
                    .toUpperCase()
                    .replace(/[^AEIOUMBPFV]/g, ' ')
                    .trim()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
