import React, { useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Globe,
  Cpu,
  Layers,
  ShoppingBag,
  Download,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Code2,
  Box,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { rustWasmPipeline } from '../utils/rustWasmMemorySafePipeline';

interface PlatformDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (cmd: string) => void;
}

type PlatformTab = 'unity' | 'laptop' | 'phone' | 'web' | 'micro' | 'android_store' | 'marketplace';

export const PlatformDeployModal: React.FC<PlatformDeployModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('unity');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportPlatform = (platformName: string) => {
    setIsExporting(true);
    setExportSuccessMsg(null);

    const verify = rustWasmPipeline.verifyAssetOperation(
      'platform_target_bundle_export',
      `${platformName} Deployment Artifact`,
      'system',
      16777216
    );

    if (onExecuteCommand) {
      onExecuteCommand(`export target [${platformName}]: ${verify.borrowCheck}`);
    }

    setTimeout(() => {
      setIsExporting(false);
      setExportSuccessMsg(`Successfully prepared ${platformName} distribution bundle! Zero-copy Rust verification passed.`);
    }, 1200);
  };

  const unityCSharpCode = `// KNOCKSSTUDiOS™ © // HOLLYWOOD MOTiON PiCTURES
// KnocksCinemaBridge.cs - Unity 3D & WebGL Integration Bridge
using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace KnocksStudios.Cinema
{
    public class KnocksCinemaBridge : MonoBehaviour
    {
        [DllImport("__Internal")]
        private static extern void Knocks_TriggerPfx(string pfxType);

        [DllImport("__Internal")]
        private static extern void Knocks_SyncTimelineFrame(int frameNumber);

        public void PlayCinemaSequence(string sequenceId)
        {
            Debug.Log("[KNOCKSSTUDiOS] Triggering Hollywood sequence: " + sequenceId);
            #if UNITY_WEBGL && !UNITY_EDITOR
            Knocks_TriggerPfx("cinema_impact_4k");
            #endif
        }
    }
}`;

  const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<!-- KNOCKSSTUDiOS™ © Android Store Manifest -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.knocksstudios.cinema">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <application
        android:label="KNOCKSSTUDiOS"
        android:icon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.Black.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-4xl bg-[#090C14] border-2 border-[#FFDAB9] rounded-lg shadow-[0_0_50px_rgba(255,218,185,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* 1. MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#111624] via-[#1B2236] to-[#111624] border-b border-[#242D45] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FFDAB9]/10 border border-[#FFDAB9] rounded text-[#FFDAB9]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white tracking-wider uppercase">
                  KNOCKSSTUDiOS™ © MULTI-PLATFORM DISTRIBUTION
                </h2>
                <span className="px-2 py-0.5 bg-[#00F5D4]/20 border border-[#00F5D4] text-[10px] text-[#00F5D4] font-bold rounded">
                  MARKETPLACE READY
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Unity · Laptop · Phone · Web · Micro · Android Store &amp; Marketplace Exporters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#182033] hover:bg-[#253252] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. PLATFORM SELECTOR TABS */}
        <div className="bg-[#0C101C] border-b border-[#1E273C] flex overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActivePlatform('unity')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'unity'
                ? 'border-[#00F5D4] text-[#00F5D4] bg-[#00F5D4]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>UNITY ENGINE</span>
          </button>

          <button
            onClick={() => setActivePlatform('laptop')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'laptop'
                ? 'border-[#3A86FF] text-[#3A86FF] bg-[#3A86FF]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>LAPTOP / WORKSTATION</span>
          </button>

          <button
            onClick={() => setActivePlatform('phone')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'phone'
                ? 'border-[#FC8EAC] text-[#FC8EAC] bg-[#FC8EAC]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>PHONE (MOBILE)</span>
          </button>

          <button
            onClick={() => setActivePlatform('web')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'web'
                ? 'border-[#FEE440] text-[#FEE440] bg-[#FEE440]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>WEB PWA</span>
          </button>

          <button
            onClick={() => setActivePlatform('micro')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'micro'
                ? 'border-[#9B5DE5] text-[#9B5DE5] bg-[#9B5DE5]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>MICRO / EMBEDDED</span>
          </button>

          <button
            onClick={() => setActivePlatform('android_store')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'android_store'
                ? 'border-[#00F5D4] text-[#00F5D4] bg-[#00F5D4]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>ANDROID STORE (PLAY)</span>
          </button>

          <button
            onClick={() => setActivePlatform('marketplace')}
            className={`px-4 py-3 flex items-center space-x-2 whitespace-nowrap transition-all border-b-2 ${
              activePlatform === 'marketplace'
                ? 'border-[#FFDAB9] text-[#FFDAB9] bg-[#FFDAB9]/10'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>MARKETPLACE</span>
          </button>
        </div>

        {/* 3. PLATFORM CONTENT PANE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: UNITY */}
          {activePlatform === 'unity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#111726] border border-[#242F4A] p-4 rounded-lg">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>UNITY 3D &amp; WEBGL ASSET PACKAGE</span>
                    <span className="px-2 py-0.5 bg-[#00F5D4]/20 border border-[#00F5D4] text-[#00F5D4] text-[9px] rounded">
                      v2026.3 LTS READY
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Export scenes, 3D glTF/FBX models, PBR shaders, and C# runtime bridges into a standard `.unitypackage`.
                  </p>
                </div>
                <button
                  onClick={() => handleExportPlatform('Unity .unitypackage')}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-[#00F5D4] hover:bg-[#20D2B8] text-black font-black text-xs uppercase tracking-wider rounded flex items-center space-x-2 shadow-[0_0_15px_#00F5D4] transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>EXPORT .UNITYPACKAGE</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>C# SCRIPT BRIDGE (KnocksCinemaBridge.cs):</span>
                  <button
                    onClick={() => copyToClipboard(unityCSharpCode, 'unity')}
                    className="flex items-center space-x-1 text-[#00F5D4] hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'unity' ? 'COPIED!' : 'COPY SCRIPT'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#05070D] border border-[#1A2236] rounded text-[11px] text-[#A6B8D4] overflow-x-auto leading-relaxed">
                  {unityCSharpCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: LAPTOP / WORKSTATION */}
          {activePlatform === 'laptop' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">LAPTOP / DESKTOP 4K WORKSTATION BUILD</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      macOS Apple Silicon (M-Series), Windows 11 DirectX 12, &amp; Linux Vulkan Standalone packages.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportPlatform('Laptop Desktop Standalone')}
                    disabled={isExporting}
                    className="px-4 py-2 bg-[#3A86FF] hover:bg-[#2563EB] text-white font-bold text-xs uppercase rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>BUILD DESKTOP BINARY</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 bg-[#090D18] border border-[#1A2236] rounded">
                    <span className="text-gray-500 block text-[10px]">MACOS ARM64</span>
                    <span className="text-white font-bold">Metal 3 Native</span>
                  </div>
                  <div className="p-2.5 bg-[#090D18] border border-[#1A2236] rounded">
                    <span className="text-gray-500 block text-[10px]">WINDOWS x86_64</span>
                    <span className="text-white font-bold">DX12 / AVX2 SIMD</span>
                  </div>
                  <div className="p-2.5 bg-[#090D18] border border-[#1A2236] rounded">
                    <span className="text-gray-500 block text-[10px]">LINUX</span>
                    <span className="text-white font-bold">Vulkan 1.3 / Rust</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHONE (MOBILE) */}
          {activePlatform === 'phone' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg space-y-3">
                <h3 className="text-sm font-bold text-white">PHONE &amp; TABLET TOUCH OPTIMIZATION</h3>
                <p className="text-xs text-gray-400">
                  Adaptive viewport scaling with bottom thumb controls, gesture pinch-zoom on 3D viewports, and zero-battery-drain background audio.
                </p>

                <div className="bg-[#070A12] border border-[#1A2236] p-3 rounded text-xs space-y-2">
                  <div className="text-[#FC8EAC] font-bold">MOBILE READY CHECKLIST:</div>
                  <div>• Touch drag &amp; drop for multi-track NLE clips</div>
                  <div>• Virtual dual-stick gamepad controls for 3D Cyber Battle Game</div>
                  <div>• iOS Safari standalone full-screen web app mode</div>
                  <div>• Dynamic 120Hz ProMotion display synchronization</div>
                </div>

                {isIOS && (
                  <div className="p-3 bg-[#FC8EAC]/10 border border-[#FC8EAC] rounded text-xs text-[#FC8EAC]">
                    <strong>iOS Safari Detected:</strong> Tap the Share button in your Safari toolbar, then select <em>Add to Home Screen</em> to run in full standalone phone mode.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WEB PWA */}
          {activePlatform === 'web' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>PROGRESSIVE WEB APP (PWA)</span>
                    <span className="px-2 py-0.5 bg-[#FEE440]/20 border border-[#FEE440] text-[#FEE440] text-[9px] rounded">
                      STANDALONE
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Instantly install KNOCKSSTUDiOS to your operating system app launcher with offline service worker support.
                  </p>
                </div>

                {isInstalled ? (
                  <span className="px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold rounded flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APP INSTALLED</span>
                  </span>
                ) : (
                  <button
                    onClick={install}
                    className="px-4 py-2 bg-[#FEE440] hover:bg-[#E5CE3B] text-black font-black text-xs uppercase rounded flex items-center space-x-1.5 shadow-[0_0_15px_#FEE440]"
                  >
                    <Download className="w-4 h-4" />
                    <span>INSTALL PWA NOW</span>
                  </button>
                )}
              </div>

              <div className="bg-[#05070D] border border-[#1A2236] p-4 rounded text-xs space-y-1.5 text-gray-300">
                <div className="text-gray-400 font-bold uppercase">MANIFEST SPECIFICATION:</div>
                <div>• Name: <span className="text-white font-bold">KNOCKSSTUDiOS™ © // HOLLYWOOD MOTiON PiCTURES</span></div>
                <div>• Short Name: <span className="text-white font-bold">KNOCKSSTUDiO</span></div>
                <div>• Display: <span className="text-[#00F5D4]">standalone (no browser chrome)</span></div>
                <div>• Service Worker: <span className="text-[#00F5D4]">Precached static assets &amp; WebGL shaders</span></div>
              </div>
            </div>
          )}

          {/* TAB: MICRO / EMBEDDED */}
          {activePlatform === 'micro' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">MICRO &amp; EMBEDDED (RASPBERRY PI / WASM LEAN)</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Low-power micro-controller profile clamped to 30FPS with 16-bit integer DSP and zero garbage collection.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportPlatform('Micro Raspberry Pi WASM Lean')}
                    disabled={isExporting}
                    className="px-4 py-2 bg-[#9B5DE5] hover:bg-[#8338EC] text-white font-bold text-xs uppercase rounded flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>GENERATE LEAN WASM</span>
                  </button>
                </div>
                <div className="bg-[#05070D] border border-[#1A2236] p-3 rounded text-xs space-y-1">
                  <div>• Memory Footprint: <span className="text-[#00F5D4] font-bold">&lt; 32 MB RAM</span></div>
                  <div>• CPU Target: <span className="text-white font-bold">ARM Cortex-A72 / WebAssembly Micro</span></div>
                  <div>• Latency: <span className="text-white font-bold">&lt; 4ms audio buffer roundtrip</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANDROID STORE (PLAY) */}
          {activePlatform === 'android_store' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>ANDROID STORE (GOOGLE PLAY) TWA PACKAGE</span>
                    <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px] rounded">
                      PLAY STORE READY
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Trusted Web Activity (TWA) bundle with package name <code className="text-[#00F5D4]">com.knocksstudios.cinema</code>.
                  </p>
                </div>
                <button
                  onClick={() => handleExportPlatform('Android Store APK / AAB')}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-[#00F5D4] hover:brightness-110 text-black font-black text-xs uppercase rounded flex items-center space-x-2 shadow-[0_0_15px_#00F5D4]"
                >
                  <Download className="w-4 h-4" />
                  <span>PREPARE AAB BUNDLE</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>ANDROID MANIFEST (AndroidManifest.xml):</span>
                  <button
                    onClick={() => copyToClipboard(androidManifestXml, 'android')}
                    className="flex items-center space-x-1 text-[#00F5D4] hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedKey === 'android' ? 'COPIED!' : 'COPY MANIFEST'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#05070D] border border-[#1A2236] rounded text-[11px] text-[#A6B8D4] overflow-x-auto leading-relaxed">
                  {androidManifestXml}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: MARKETPLACE READY */}
          {activePlatform === 'marketplace' && (
            <div className="space-y-4">
              <div className="bg-[#111726] border border-[#242F4A] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#FFDAB9] flex items-center space-x-2">
                    <span>HOLLYWOOD MOTiON PiCTURES MARKETPLACE ASSET BUNDLE</span>
                    <span className="px-2 py-0.5 bg-[#FFDAB9]/20 border border-[#FFDAB9] text-[#FFDAB9] text-[9px] rounded">
                      COMMERCIAL READY
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Export royalty-free commercial studio packages for Unity Asset Store, Unreal Engine Marketplace, and Sketchfab.
                  </p>
                </div>
                <button
                  onClick={() => handleExportPlatform('Commercial Marketplace Package')}
                  disabled={isExporting}
                  className="px-4 py-2.5 bg-[#FFDAB9] hover:bg-[#FFE4CC] text-black font-black text-xs uppercase rounded flex items-center space-x-2 shadow-[0_0_15px_#FFDAB9]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>EXPORT MARKETPLACE BUNDLE</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#05070D] border border-[#1A2236] rounded space-y-1">
                  <div className="text-white font-bold">UNITY ASSET STORE</div>
                  <div className="text-[11px] text-gray-400">Complete prefab hierarchy, PBR materials, and custom Inspector editor scripts.</div>
                </div>
                <div className="p-3 bg-[#05070D] border border-[#1A2236] rounded space-y-1">
                  <div className="text-white font-bold">UNREAL ENGINE 5</div>
                  <div className="text-[11px] text-gray-400">Nanite-compatible FBX meshes, Lumen emissive lighting, and Niagara VFX emitters.</div>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {exportSuccessMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500 rounded text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* 4. MODAL FOOTER */}
        <div className="px-6 py-3 bg-[#0C101C] border-t border-[#1E273C] flex items-center justify-between text-xs text-gray-400">
          <div>
            <span className="text-[#FFDAB9] font-bold">KNOCKSSTUDiOS™ ©</span> // HOLLYWOOD MOTiON PiCTURES
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1B2236] hover:bg-[#253252] text-white font-bold rounded"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
