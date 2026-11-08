import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  X,
  UserCheck,
  EyeOff,
  Building,
  Terminal,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { useOwner } from '../context/OwnerContext';

interface OwnerAuthModalProps {
  onSuccess?: () => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({ onSuccess }) => {
  const {
    isOwnerMode,
    ownerEmail,
    studioRole,
    isAuthModalOpen,
    closeAuthModal,
    unlockOwner,
    lockOwner,
    openVault,
  } = useOwner();

  const [passkey, setPasskey] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccessShake, setIsSuccessShake] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const success = unlockOwner(passkey);
    if (success) {
      setIsSuccessShake(true);
      setTimeout(() => {
        setIsSuccessShake(false);
        closeAuthModal();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg('Invalid Master Passkey. Enter your Studio PIN (7777) or Owner Passphrase (KNOCKS2026).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none font-mono">
      <div className="relative w-full max-w-lg bg-[#0A0D15] border-2 border-[#FFDAB9] rounded-lg shadow-[0_0_50px_rgba(255,218,185,0.25)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#111726] via-[#1B2338] to-[#111726] border-b border-[#222C46] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded border ${isOwnerMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#FFDAB9]/10 border-[#FFDAB9] text-[#FFDAB9]'}`}>
              {isOwnerMode ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-white tracking-wider uppercase">
                  KNOCKSSTUDiOS™ © PRO ENTERPRISE
                </h2>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${isOwnerMode ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-amber-950/60 border border-amber-500/50 text-amber-300'}`}>
                  {isOwnerMode ? 'EXECUTIVE UNLOCKED' : 'OWNER VAULT GATE'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Confidential Infrastructure &amp; Sovereign Data Isolation
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 rounded bg-[#182033] hover:bg-[#253252] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Privacy Wall Notice */}
          <div className="p-3.5 bg-[#070910] border border-[#1C2438] rounded-md text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#00F5D4] font-bold">
              <EyeOff className="w-4 h-4 shrink-0" />
              <span>CONFIDENTIALITY PROTOCOL (ZERO PUBLIC LEAKAGE)</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Personal workstation downloads, PowerShell scripts, Unity/Android packaging pipelines, and backend credentials are
              <span className="text-[#00F5D4] font-bold"> strictly isolated</span> to the Owner Profile. Public visitors and clients only see the clean cinematic showcase and standard playback tools.
            </p>
          </div>

          {/* Current Status Display */}
          {isOwnerMode ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded-md space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>AUTHENTICATED OWNER PROFILE</span>
                  </span>
                  <span className="text-emerald-300 font-mono text-[10px]">SOVEREIGN ACCESS</span>
                </div>
                <div className="text-white text-xs">
                  <div>Account: <strong className="text-[#FFDAB9]">{ownerEmail}</strong></div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{studioRole}</div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    closeAuthModal();
                    openVault();
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#00F5D4] to-emerald-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider rounded flex items-center justify-center space-x-2 shadow-[0_0_15px_#00F5D4]"
                >
                  <Building className="w-4 h-4" />
                  <span>OPEN EXECUTIVE VAULT</span>
                </button>

                <button
                  onClick={() => {
                    lockOwner();
                    setErrorMsg(null);
                  }}
                  className="py-2.5 px-4 bg-[#1B2338] hover:bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase rounded flex items-center space-x-1.5 transition-colors"
                  title="Switch to Public Guest View"
                >
                  <Lock className="w-4 h-4" />
                  <span>LOCK (GUEST VIEW)</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300">
                  ENTER EXECUTIVE MASTER PIN OR STUDIO PASSPHRASE:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Studio PIN (e.g. 7777 or KNOCKS2026)"
                    autoFocus
                    className="w-full bg-[#05070C] border border-[#242E47] focus:border-[#00F5D4] rounded px-9 py-2.5 text-white text-xs placeholder-gray-600 outline-none transition-colors"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 pt-1">
                  <span>Authorized Account: {ownerEmail}</span>
                  <span className="text-[#00F5D4]/80">Quick PIN: 7777</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/50 rounded text-[11px] text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FFDAB9] hover:bg-[#FFE4CC] text-black font-black text-xs uppercase tracking-wider rounded flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,218,185,0.3)] transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>AUTHENTICATE OWNER PROFILE</span>
              </button>
            </form>
          )}

          {/* Quick Security Summary */}
          <div className="border-t border-[#1C2438] pt-3 text-[10px] text-gray-500 flex items-center justify-between">
            <span>KNOCKSSTUDiOS™ © // HOLLYWOOD MOTiON PiCTURES</span>
            <span className="text-gray-400">Firebase Firestore Node Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
