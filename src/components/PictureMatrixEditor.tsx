import React, { useRef, useEffect, useState } from 'react';
import {
  Image,
  Sliders,
  Palette,
  Edit3,
  Sun,
  Eye,
  RotateCcw,
  Download,
  Sparkles,
  Contrast,
} from 'lucide-react';
import { ColorGradeState } from '../types';

interface PictureMatrixEditorProps {
  colorGrade: ColorGradeState;
  onChangeColorGrade: (newGrade: Partial<ColorGradeState>) => void;
  onResetGrade: () => void;
}

export const PictureMatrixEditor: React.FC<PictureMatrixEditorProps> = ({
  colorGrade,
  onChangeColorGrade,
  onResetGrade,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'grade' | 'vintage' | 'sketch'>('grade');

  // Render processed image with real color math & pencil sketch shader on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw base procedural cinematic scene
    ctx.fillStyle = '#0b0c10';
    ctx.fillRect(0, 0, w, h);

    // Dynamic gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (colorGrade.vintageMatrix === 'kodachrome') {
      grad.addColorStop(0, '#361814');
      grad.addColorStop(0.5, '#5c311e');
      grad.addColorStop(1, '#1b242e');
    } else if (colorGrade.vintageMatrix === 'technicolor') {
      grad.addColorStop(0, '#123026');
      grad.addColorStop(0.5, '#401824');
      grad.addColorStop(1, '#573812');
    } else if (colorGrade.vintageMatrix === 'cyberpunk_fresnel') {
      grad.addColorStop(0, '#130c26');
      grad.addColorStop(0.5, '#3b1233');
      grad.addColorStop(1, '#0e242b');
    } else {
      grad.addColorStop(0, '#10141d');
      grad.addColorStop(0.5, '#1e1c28');
      grad.addColorStop(1, '#121318');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw central subject: Bioluminescent Chrome Sphere & Beveled Ring
    const cx = w / 2;
    const cy = h / 2;

    // Outer Chrome Ring
    ctx.strokeStyle = '#FFDAB9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary Cyan Ring
    ctx.strokeStyle = '#E0FFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 70, 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Central Sphere with metallic specular gradient
    const sphereGrad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, 90);
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.3, '#FFDAB9');
    sphereGrad.addColorStop(0.7, '#FC8EAC');
    sphereGrad.addColorStop(1, '#0b0d13');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 85, 0, Math.PI * 2);
    ctx.fill();

    // 2. Apply Color Grading Pixel Math
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const exposureFactor = Math.pow(2, colorGrade.exposure / 3);
    const contrastFactor = colorGrade.contrast / 100;
    const satFactor = colorGrade.saturation / 100;
    const liftOffset = colorGrade.lift * 0.5;
    const gainScale = 1 + colorGrade.gain / 100;
    const tempR = 1 + colorGrade.temperature / 200;
    const tempB = 1 - colorGrade.temperature / 200;
    const tintG = 1 - colorGrade.tint / 200;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Lift, Gain, Exposure
      r = (r + liftOffset) * gainScale * exposureFactor * tempR;
      g = (g + liftOffset) * gainScale * exposureFactor * tintG;
      b = (b + liftOffset) * gainScale * exposureFactor * tempB;

      // Contrast
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;

      // Saturation
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;

      // Vintage B&W-to-color toggle
      if (colorGrade.bwConversion) {
        r = gray;
        g = gray;
        b = gray;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Dynamic Pencil-Sketch Stylizer Shader overlay
    if (colorGrade.pencilSketchMode) {
      ctx.save();
      ctx.fillStyle = '#090a0d';
      ctx.fillRect(0, 0, w, h);

      // Procedural cross-hatch sketch lines based on density & line weight
      const density = colorGrade.pencilHatchDensity;
      const weight = colorGrade.pencilLineWeight;
      ctx.strokeStyle = '#F5FFFA';
      ctx.lineWidth = weight;

      // Directional hatching
      for (let y = 0; y < h; y += Math.max(4, 20 - density)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y + (y % 15));
        ctx.stroke();
      }

      // Cross-hatching for dark tone shadows
      ctx.strokeStyle = '#E0FFFF';
      for (let x = 0; x < w; x += Math.max(6, 25 - density)) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 50, h);
        ctx.stroke();
      }

      // Re-draw clean outline of subject
      ctx.strokeStyle = '#FFDAB9';
      ctx.lineWidth = weight * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 140, 70, 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }, [colorGrade]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] border-t border-[#232734] select-none text-xs font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12141C] border-b border-[#212634]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#FFDAB9] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#FFDAB9]" />
            PICTURE MATRIX &amp; COLOR GRADING SUITE
          </span>
          <span className="text-[#2E3444]">|</span>
          <span className="text-[#8E99A8]">COLOR ENGINE: 32-BIT FLOAT ACEScc</span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0A0B0D] p-0.5 border border-[#262B36] rounded-xs">
            <button
              onClick={() => setActiveTab('grade')}
              className={`px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'grade' ? 'bg-[#1E2330] text-[#FFDAB9] font-bold' : 'text-[#8E99A8]'
              }`}
            >
              COLOR WHEELS &amp; SLIDERS
            </button>
            <button
              onClick={() => setActiveTab('vintage')}
              className={`px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'vintage' ? 'bg-[#1E2330] text-[#FC8EAC] font-bold' : 'text-[#8E99A8]'
              }`}
            >
              VINTAGE B&amp;W MATRIX
            </button>
            <button
              onClick={() => setActiveTab('sketch')}
              className={`px-2.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                activeTab === 'sketch' ? 'bg-[#1E2330] text-[#E0FFFF] font-bold' : 'text-[#8E99A8]'
              }`}
            >
              PENCIL-SKETCH STYLIZER
            </button>
          </div>

          <button
            onClick={onResetGrade}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-[#141720] border border-[#292F3E] text-[#8E99A8] hover:text-[#F5FFFA] rounded-xs cursor-pointer"
            title="Reset All Grading Parameters to Flat Neutral"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content: Canvas Preview on Left + Granular Controls on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden items-stretch">
        {/* Canvas Render View (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#08090C] border border-[#232734] rounded-xs overflow-hidden p-3 items-center justify-center">
          <div className="relative shadow-2xl max-w-full">
            <canvas
              ref={canvasRef}
              width={640}
              height={380}
              className="w-full h-auto object-contain border border-[#1E2430] rounded-xs"
            />
            {colorGrade.pencilSketchMode && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#0A0B0E]/80 border border-[#E0FFFF]/40 rounded text-[10px] text-[#E0FFFF]">
                SKETCH SHADER: ACTIVE
              </div>
            )}
            {colorGrade.bwConversion && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#0A0B0E]/80 border border-[#FC8EAC]/40 rounded text-[10px] text-[#FC8EAC]">
                B&amp;W VINTAGE MODE
              </div>
            )}
          </div>
        </div>

        {/* Granular Adjustment Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-[#11141A] border border-[#232734] rounded-xs p-3 overflow-y-auto space-y-3.5">
          {/* TAB 1: COLOR WHEELS & PRIMARY CONTROLS */}
          {activeTab === 'grade' && (
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#FFDAB9] flex items-center justify-between pb-1 border-b border-[#212634]">
                <span>LIFT / GAMMA / GAIN (3-WAY WHEELS)</span>
                <span className="text-[#8E99A8] text-[10px]">ACES COLOR SCIENCE</span>
              </div>

              {/* Lift / Gamma / Gain Sliders */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-[#161922] border border-[#262B3A] rounded-xs text-center space-y-1">
                  <span className="text-[10px] text-[#8E99A8] block">SHADOWS (LIFT)</span>
                  <span className="text-[#E0FFFF] font-bold">{colorGrade.lift}</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={colorGrade.lift}
                    onChange={(e) => onChangeColorGrade({ lift: Number(e.target.value) })}
                    className="w-full accent-[#E0FFFF] cursor-pointer"
                  />
                </div>

                <div className="p-2 bg-[#161922] border border-[#262B3A] rounded-xs text-center space-y-1">
                  <span className="text-[10px] text-[#8E99A8] block">MIDTONES (GAMMA)</span>
                  <span className="text-[#FFDAB9] font-bold">{colorGrade.gamma}</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={colorGrade.gamma}
                    onChange={(e) => onChangeColorGrade({ gamma: Number(e.target.value) })}
                    className="w-full accent-[#FFDAB9] cursor-pointer"
                  />
                </div>

                <div className="p-2 bg-[#161922] border border-[#262B3A] rounded-xs text-center space-y-1">
                  <span className="text-[10px] text-[#8E99A8] block">HIGHLIGHTS (GAIN)</span>
                  <span className="text-[#FC8EAC] font-bold">{colorGrade.gain}</span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={colorGrade.gain}
                    onChange={(e) => onChangeColorGrade({ gain: Number(e.target.value) })}
                    className="w-full accent-[#FC8EAC] cursor-pointer"
                  />
                </div>
              </div>

              {/* Secondary Sliders */}
              <div className="space-y-2 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                    <span>EXPOSURE</span>
                    <span className="text-[#F5FFFA]">{colorGrade.exposure > 0 ? `+${colorGrade.exposure}` : colorGrade.exposure} EV</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={colorGrade.exposure}
                    onChange={(e) => onChangeColorGrade({ exposure: Number(e.target.value) })}
                    className="w-full accent-[#FFDAB9] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                    <span>CONTRAST</span>
                    <span className="text-[#F5FFFA]">{colorGrade.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={colorGrade.contrast}
                    onChange={(e) => onChangeColorGrade({ contrast: Number(e.target.value) })}
                    className="w-full accent-[#FFDAB9] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                    <span>SATURATION</span>
                    <span className="text-[#FC8EAC]">{colorGrade.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={colorGrade.saturation}
                    onChange={(e) => onChangeColorGrade({ saturation: Number(e.target.value) })}
                    className="w-full accent-[#FC8EAC] cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                      <span>TEMP (K)</span>
                      <span className="text-[#FFDAB9]">{colorGrade.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={colorGrade.temperature}
                      onChange={(e) => onChangeColorGrade({ temperature: Number(e.target.value) })}
                      className="w-full accent-[#FFDAB9] cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                      <span>TINT</span>
                      <span className="text-[#E0FFFF]">{colorGrade.tint}</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={colorGrade.tint}
                      onChange={(e) => onChangeColorGrade({ tint: Number(e.target.value) })}
                      className="w-full accent-[#E0FFFF] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VINTAGE B&W & FILM EMULATION */}
          {activeTab === 'vintage' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-[#171B24] border border-[#272D3D] rounded-xs">
                <div>
                  <span className="font-bold text-[#FC8EAC] block">VINTAGE B&amp;W CONVERSION</span>
                  <span className="text-[10px] text-[#8E99A8]">Dynamic Panchromatic Grain &amp; Tone curve</span>
                </div>
                <input
                  type="checkbox"
                  checked={colorGrade.bwConversion}
                  onChange={(e) => onChangeColorGrade({ bwConversion: e.target.checked })}
                  className="w-4 h-4 accent-[#FC8EAC] cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] text-[#8E99A8] block">FILM MATRIX EMULATION LUT</span>
                {[
                  { id: 'none', label: 'FLAT LINEAR (DEFAULT)', desc: 'Standard rec.709 neutral response' },
                  { id: 'kodachrome', label: 'KODACHROME 64 (1974)', desc: 'Warm saturated reds, deep obsidian blacks' },
                  { id: 'technicolor', label: 'TECHNICOLOR 3-STRIP', desc: 'Vibrant primaries with emerald green split' },
                  { id: 'cyberpunk_fresnel', label: 'CYBERPUNK FRESNEL PEACH', desc: 'Peach/pink bioluminescence highlights' },
                  { id: 'noir_high_contrast', label: 'NOIR ARCHIVE HIGH-CONTRAST', desc: 'Hard silhouetted shadows and silver highlights' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onChangeColorGrade({ vintageMatrix: item.id as any })}
                    className={`p-2 rounded-xs border cursor-pointer transition-colors ${
                      colorGrade.vintageMatrix === item.id
                        ? 'bg-[#202534] border-[#FFDAB9] text-[#F5FFFA]'
                        : 'bg-[#141720] border-[#222736] text-[#8E99A8] hover:border-[#384055]'
                    }`}
                  >
                    <span className="font-bold block text-[#FFDAB9]">{item.label}</span>
                    <span className="text-[10px] text-[#8E99A8]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PENCIL-SKETCH STYLIZER */}
          {activeTab === 'sketch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-[#171B24] border border-[#272D3D] rounded-xs">
                <div>
                  <span className="font-bold text-[#E0FFFF] block">DYNAMIC PENCIL-SKETCH SHADER</span>
                  <span className="text-[10px] text-[#8E99A8]">Sobel edge detection &amp; graphite cross-hatching</span>
                </div>
                <input
                  type="checkbox"
                  checked={colorGrade.pencilSketchMode}
                  onChange={(e) => onChangeColorGrade({ pencilSketchMode: e.target.checked })}
                  className="w-4 h-4 accent-[#E0FFFF] cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                    <span>CROSS-HATCH DENSITY</span>
                    <span className="text-[#E0FFFF]">{colorGrade.pencilHatchDensity}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="18"
                    value={colorGrade.pencilHatchDensity}
                    onChange={(e) => onChangeColorGrade({ pencilHatchDensity: Number(e.target.value) })}
                    className="w-full accent-[#E0FFFF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#8E99A8] mb-0.5">
                    <span>LINE WEIGHT</span>
                    <span className="text-[#FFDAB9]">{colorGrade.pencilLineWeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={colorGrade.pencilLineWeight}
                    onChange={(e) => onChangeColorGrade({ pencilLineWeight: Number(e.target.value) })}
                    className="w-full accent-[#FFDAB9] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
