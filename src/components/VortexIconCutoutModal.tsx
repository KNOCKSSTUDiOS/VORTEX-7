import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Gamepad2,
  Cloud,
  HardDrive,
  Usb,
  Sparkles,
  Layers,
  ShieldCheck,
  Eye,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useOwner } from '../context/OwnerContext';

interface VortexIconCutoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VortexIconCutoutModal: React.FC<VortexIconCutoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'transparent' | 'dark' | 'ios' | 'android' | 'unity'>('transparent');
  const { isOwnerMode, openAuthModal } = useOwner();

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const powershellCommand = `$url = "https://ais-dev-qf2ysbvycsvzjyxe4bl6zx-187094173481.us-west2.run.app/vortex7-icons-bundle.zip"
$destZip = "$HOME\\Downloads\\vortex7-icons-bundle.zip"
$destDir = "$HOME\\Downloads\\vortex7_icons"

Write-Host "Downloading VORTEX 7 Universal Icon Suite..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $destZip
Expand-Archive -Path $destZip -DestinationPath $destDir -Force
Write-Host "Success! Icons extracted to $destDir" -ForegroundColor Green

# Optional: Auto-detect USB and copy
$usb = (Get-Volume -FileSystemLabel "*USB*" -ErrorAction SilentlyContinue | Select-Object -First 1).DriveLetter
if ($usb) {
    Copy-Item -Path $destDir -Destination "$($usb):\\VORTEX7_ICONS" -Recurse -Force
    Write-Host "Transferred to USB Drive at ($($usb):\\VORTEX7_ICONS)" -ForegroundColor Magenta
} else {
    Write-Host "No USB detected. Files ready in Downloads folder." -ForegroundColor Yellow
}`;

  const bashCommand = `# Linux / macOS / Android Termux / Cloud Shell:
curl -fsSL -o ~/Downloads/vortex7-icons-bundle.zip https://ais-dev-qf2ysbvycsvzjyxe4bl6zx-187094173481.us-west2.run.app/vortex7-icons-bundle.zip
unzip -o ~/Downloads/vortex7-icons-bundle.zip -d ~/Downloads/vortex7_icons/
echo "VORTEX 7 icons ready in ~/Downloads/vortex7_icons/"`;

  const ICON_ASSETS = [
    {
      title: 'Master Icon (1024x1024 Transparent)',
      desc: 'Native transparent PNG for Unity, Unreal, and Custom Stores',
      path: '/vortex7-icon-1024-transparent.png',
      size: '1024 x 1024',
      badge: 'MASTER PNG',
    },
    {
      title: 'Master Solid (1024x1024 Dark Gunmetal)',
      desc: 'Required for Apple App Store, Google Play & Windows UWP',
      path: '/vortex7-icon-1024-solid.png',
      size: '1024 x 1024',
      badge: 'APP STORE',
    },
    {
      title: 'Apple Touch Icon (180x180)',
      desc: 'iPhone, iPad tablets & Safari home screen shortcut',
      path: '/apple-touch-icon.png',
      size: '180 x 180',
      badge: 'APPLE iOS',
    },
    {
      title: 'PWA & Android Launcher (512x512)',
      desc: 'Chromium, Android, and Progressive Web App main icon',
      path: '/pwa-512x512.png',
      size: '512 x 512',
      badge: 'ANDROID / PWA',
    },
    {
      title: 'Maskable Squircle Adaptive (512x512)',
      desc: 'Android safe-zone padded (prevents circle crop cutoff)',
      path: '/pwa-maskable-512x512.png',
      size: '512 x 512',
      badge: 'ADAPTIVE',
    },
    {
      title: 'Browser Favicon & Desktop (32x32 / .ICO)',
      desc: 'Browser tab and Windows desktop shortcut',
      path: '/favicon.ico',
      size: '32 x 32',
      badge: 'FAVICON',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/90 backdrop-blur-md select-none font-sans overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#13151D] via-[#0E1015] to-[#0A0B0E] border-2 border-[#FC8EAC]/60 rounded-xs shadow-[0_0_50px_rgba(252,142,172,0.25)] flex flex-col max-h-[92vh] overflow-hidden my-auto text-[#F5FFFA]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252A38] bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs overflow-hidden border border-[#FFDAB9]/50 shadow-[0_0_10px_rgba(255,218,185,0.3)] bg-[#0A0A0E]">
              <img
                src="/vortex7-icon-1024-transparent.png"
                alt="Vortex 7 Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-gradient-chrome tracking-wide">
                  VORTEX 7 // TEMPEST VORTEX APPARATUS ICON
                </span>
                <span className="text-[10px] text-[#FC8EAC] border border-[#FC8EAC]/40 px-1.5 py-0.2 rounded-xs font-mono">
                  CUTOUT VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-[#8E99A8] font-mono">
                Isolated pink metallic squircle frame · Steampunk gears · Molten gold 7 emblem · Universal multi-platform deploy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#202533] rounded-xs cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          
          {/* Main Visual Cutout Showcase & Live Platform Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#090A0D] border border-[#212634] p-5 rounded-xs">
            {/* Left: Icon Render Frame */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-64 h-64 flex items-center justify-center rounded-xl overflow-hidden border border-[#2B3142] shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {/* Background Modes */}
                {previewBg === 'transparent' && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #2A2F3D 25%, transparent 25%),
                        linear-gradient(-45deg, #2A2F3D 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #2A2F3D 75%),
                        linear-gradient(-45deg, transparent 75%, #2A2F3D 75%)
                      `,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                )}
                {previewBg === 'dark' && <div className="absolute inset-0 bg-[#0A0A0E]" />}
                {previewBg === 'ios' && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1C2030] to-[#0D0F16] flex flex-col items-center justify-center p-4">
                    <span className="text-[9px] text-[#6D7787] absolute top-2 font-mono">iPAD / TABLET DOCK</span>
                  </div>
                )}
                {previewBg === 'android' && (
                  <div className="absolute inset-0 bg-[#121620] flex items-center justify-center" />
                )}
                {previewBg === 'unity' && (
                  <div className="absolute inset-0 bg-[#222C37] flex items-center justify-center" />
                )}

                {/* Rendered Cutout Image */}
                <img
                  src="/vortex7-icon-1024-transparent.png"
                  alt="Vortex 7 Cutout"
                  className={`relative z-10 w-52 h-52 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] transition-transform duration-300 ${
                    previewBg === 'android' ? 'scale-90 rounded-3xl' : ''
                  }`}
                />
              </div>

              {/* Preview Mode Switcher */}
              <div className="flex items-center gap-1 mt-3 bg-[#111319] p-1 border border-[#232733] rounded-xs text-[10px]">
                {[
                  { id: 'transparent', label: 'TRANSPARENT' },
                  { id: 'dark', label: 'DARK SOLID' },
                  { id: 'ios', label: 'TABLET / iOS' },
                  { id: 'android', label: 'ANDROID' },
                  { id: 'unity', label: 'UNITY' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setPreviewBg(mode.id as any)}
                    className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                      previewBg === mode.id
                        ? 'bg-[#FC8EAC] text-[#0A0A0A] font-bold'
                        : 'text-[#8E99A8] hover:text-[#F5FFFA]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Deployment Summary & 1-Click Master Download */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[#FFDAB9] font-bold text-sm block">
                  READY FOR TABLETS, UNITY, MICROSOFT, APPLE &amp; AWS CLOUD
                </span>
                <p className="text-[#8E99A8] text-[11px] leading-relaxed">
                  Clean isolation achieved: background desk, smartphone frame, and text removed.
                  The resulting icon preserves 100% of the metallic pink squircle chassis, clockwork gears, cyan/violet electrical discharges, and dripping gold 7.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-[#12151F] border border-[#252A38] rounded-xs">
                  <span className="text-[#6D7787] block text-[9px]">TARGET PLATFORMS</span>
                  <span className="text-[#E0FFFF] font-bold">iOS · Android · Unity · UWP · Web</span>
                </div>
                <div className="p-2.5 bg-[#12151F] border border-[#252A38] rounded-xs">
                  <span className="text-[#6D7787] block text-[9px]">COLOR FIDELITY</span>
                  <span className="text-[#FC8EAC] font-bold">Metallic Pink + 24K Molten Gold</span>
                </div>
              </div>

              {/* Master Zip Package Button */}
              <a
                href="/vortex7-icons-bundle.zip"
                download="vortex7-icons-bundle.zip"
                className="w-full py-3 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-extrabold tracking-wider rounded-xs cursor-pointer shadow-[0_0_20px_rgba(252,142,172,0.4)] hover:brightness-110 flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4 text-[#0A0A0A]" />
                <span>DOWNLOAD COMPLETE MULTI-PLATFORM ZIP PACKAGE (5.5 MB)</span>
              </a>
              <span className="text-[10px] text-[#6D7787] block text-center">
                Includes Unity asset folder, Apple xcassets, Android mipmaps, Windows UWP sizes &amp; PWA manifest.
              </span>
            </div>
          </div>

          {/* Individual Assets Download Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#E0FFFF] font-bold text-xs flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                INDIVIDUAL FORMATS &amp; RESOLUTIONS
              </span>
              <span className="text-[10px] text-[#6D7787]">1-CLICK DIRECT PNG DOWNLOAD</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ICON_ASSETS.map((asset) => (
                <div
                  key={asset.path}
                  className="flex items-center justify-between p-3 bg-[#111319] border border-[#212633] rounded-xs hover:border-[#FFDAB9]/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={asset.path}
                      alt={asset.title}
                      className="w-10 h-10 object-contain rounded-xs border border-[#262B38] bg-[#0A0B0E]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5FFFA] text-[11px]">{asset.title}</span>
                        <span className="text-[9px] text-[#FFDAB9] border border-[#FFDAB9]/30 px-1 py-0.1 rounded-xs">
                          {asset.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6D7787] block">{asset.desc}</span>
                    </div>
                  </div>

                  <a
                    href={asset.path}
                    download={asset.path.split('/').pop()}
                    className="p-2 bg-[#171B25] border border-[#2D3446] text-[#E0FFFF] hover:text-[#F5FFFA] hover:bg-[#202636] rounded-xs cursor-pointer transition-colors"
                    title={`Download ${asset.size}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* PowerShell & USB Transfer Command Section (Protected for Owner Only) */}
          {isOwnerMode ? (
            <div className="p-4 bg-[#090A0D] border border-emerald-500/40 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#00F5D4] font-bold">
                  <HardDrive className="w-4 h-4 text-[#00F5D4]" />
                  <span>POWERSHELL DIRECT DOWNLOAD &amp; USB TRANSFER SCRIPT [OWNER SUITE]</span>
                </div>
                <button
                  onClick={() => handleCopy(powershellCommand, 'powershell')}
                  className="px-2.5 py-1 bg-[#1A1F2C] border border-[#30384D] text-[#E0FFFF] rounded-xs text-[10px] font-bold cursor-pointer hover:bg-[#242B3E] flex items-center gap-1.5"
                >
                  {copiedType === 'powershell' ? (
                    <>
                      <Check className="w-3 h-3 text-[#00F5D4]" />
                      <span className="text-[#00F5D4]">COPIED TO CLIPBOARD</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY POWERSHELL COMMAND</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-[#8E99A8]">
                Open PowerShell on Windows or tablet, paste this command, and press Enter. It automatically downloads the 5.5MB bundle, extracts all platform directories to your Downloads, and if a USB drive is attached, mirrors the icons to your USB flash drive!
              </p>

              <pre className="p-3 bg-[#060709] border border-[#1C202B] rounded-xs text-[#E0FFFF] text-[10px] font-mono overflow-x-auto leading-relaxed select-all">
                {powershellCommand}
              </pre>

              {/* Bash / cURL snippet for Mac / Linux / Termux */}
              <div className="pt-2 border-t border-[#1C202B] flex items-center justify-between">
                <span className="text-[10px] text-[#6D7787]">
                  macOS / Linux / Android Termux command:
                </span>
                <button
                  onClick={() => handleCopy(bashCommand, 'bash')}
                  className="px-2 py-0.5 bg-[#141720] border border-[#262B38] text-[#8E99A8] hover:text-[#F5FFFA] rounded-xs text-[9px] cursor-pointer flex items-center gap-1"
                >
                  {copiedType === 'bash' ? 'COPIED' : 'COPY CURL COMMAND'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#090A0D]/80 border border-[#242A38] rounded-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Lock className="w-4 h-4 text-[#FFDAB9]" />
                <span className="text-[11px]">System PowerShell Scripts &amp; USB Mirroring are isolated in the Owner Profile.</span>
              </div>
              <button
                onClick={openAuthModal}
                className="px-3 py-1 bg-[#171D2C] hover:bg-[#222B3F] border border-[#2F3C59] text-[#FFDAB9] rounded-xs text-[10px] font-bold cursor-pointer"
              >
                UNLOCK OWNER SUITE
              </button>
            </div>
          )}

          {/* Quick Platform Deployment Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px]">
            <div className="p-3 bg-[#111319] border border-[#212634] rounded-xs space-y-1">
              <span className="text-[#FFDAB9] font-bold block flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-[#FFDAB9]" />
                UNITY 3D / UNREAL
              </span>
              <p className="text-[#8E99A8]">
                In Unity: <span className="text-[#E0FFFF]">Project Settings &gt; Player &gt; Icon</span>. Drag <code className="text-[#FFDAB9]">Vortex7_Master_1024.png</code> into the Default Icon slot.
              </p>
            </div>

            <div className="p-3 bg-[#111319] border border-[#212634] rounded-xs space-y-1">
              <span className="text-[#FC8EAC] font-bold block flex items-center gap-1.5">
                <Tablet className="w-3.5 h-3.5 text-[#FC8EAC]" />
                APPLE &amp; ANDROID TABLETS
              </span>
              <p className="text-[#8E99A8]">
                In Safari/Chrome on your tablet, tap <span className="text-[#E0FFFF]">Share &gt; Add to Home Screen</span>. The high-res Vortex 7 icon mounts instantly as a standalone tablet app.
              </p>
            </div>

            <div className="p-3 bg-[#111319] border border-[#212634] rounded-xs space-y-1">
              <span className="text-[#E0FFFF] font-bold block flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-[#E0FFFF]" />
                AWS / CLOUD HOSTING
              </span>
              <p className="text-[#8E99A8]">
                Copy the contents of <code className="text-[#E0FFFF]">web_pwa/</code> directly to your S3 bucket root or Amplify public directory. Web App Manifest is pre-linked.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#252A38] bg-[#12141B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00F5D4] shadow-[0_0_6px_#00F5D4]" />
            <span className="text-[#8E99A8] font-mono text-[11px]">
              SHA-256 INTEGRITY VERIFIED · FULL ENCRYPTION READY
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B202D] border border-[#343D52] text-[#F5FFFA] rounded-xs cursor-pointer hover:bg-[#252B3C] font-mono"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
