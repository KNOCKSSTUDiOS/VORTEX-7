import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Key,
  CheckCircle,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  School,
  Building,
  UserCheck,
} from 'lucide-react';
import { SubscriptionTierId } from '../types';
import { SUBSCRIPTION_TIERS } from '../utils/tierConfig';

interface TierVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTierId;
  onSelectTier: (tierId: SubscriptionTierId) => void;
}

export const TierVerificationModal: React.FC<TierVerificationModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<SubscriptionTierId>(currentTier);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentTierObj = SUBSCRIPTION_TIERS[currentTier];
  const targetTierObj = SUBSCRIPTION_TIERS[selectedTierId];

  const handleActivate = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onSelectTier(selectedTierId);
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => {
        setVerificationSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  const TIERS_LIST = Object.values(SUBSCRIPTION_TIERS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-mono text-xs">
      {/* Modal Container */}
      <div className="w-full max-w-4xl bg-[#0E1015] border border-[#2D3342] rounded-xs shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141720] border-b border-[#242937]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xs bg-gradient-to-br from-[#E0FFFF] via-[#FFDAB9] to-[#FC8EAC] p-0.5">
              <div className="w-full h-full bg-[#0A0A0A] rounded-xs flex items-center justify-center text-[#E0FFFF]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#F5FFFA] tracking-wide">
                KNOCKSSTUDiOS CRYPTOGRAPHIC IDENTITY &amp; TIER MATRIX
              </div>
              <div className="text-[11px] text-[#8E99A8]">
                SECURE HARDWARE SIGNATURE VALIDATION · 5 PIPELINE TIERS
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#8E99A8] hover:text-[#F5FFFA] rounded-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cryptographic Session Fingerprint Banner */}
        <div className="px-6 py-2 bg-[#090A0D] border-b border-[#1E232F] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-[#E0FFFF]">
            <Key className="w-3.5 h-3.5 text-[#FFDAB9]" />
            <span>SESSION SIGNATURE:</span>
            <span className="font-bold text-[#FFDAB9] truncate max-w-xs">
              {currentTierObj.cryptoSignature}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#8E99A8]">
            <span>STATUS:</span>
            <span className="text-[#E0FFFF] font-bold">CRYPTOGRAPHICALLY AUTHENTICATED</span>
          </div>
        </div>

        {/* 5 Tiers Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          {TIERS_LIST.map((t) => {
            const isCurrent = t.id === currentTier;
            const isSelected = t.id === selectedTierId;

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTierId(t.id)}
                className={`p-3.5 rounded-xs border flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#181C26] border-[#FFDAB9] shadow-lg ring-1 ring-[#FFDAB9]/40'
                    : 'bg-[#111319] border-[#222735] hover:border-[#384055]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-xs font-bold"
                      style={{ backgroundColor: `${t.color}20`, color: t.color }}
                    >
                      {t.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] text-[#E0FFFF] font-bold">ACTIVE</span>
                    )}
                  </div>

                  <div>
                    <span className="font-extrabold text-sm block text-[#F5FFFA] leading-tight">
                      {t.name}
                    </span>
                    <span className="text-base font-bold text-[#FFDAB9] block mt-1">{t.price}</span>
                  </div>

                  <div className="text-[10px] text-[#A6B0BE] border-t border-[#1F2432] pt-2">
                    <span className="text-[#6D7787] block">LIMITS:</span>
                    <span>{t.renderLimits}</span>
                  </div>

                  <ul className="space-y-1 pt-1 text-[10px] text-[#8E99A8]">
                    {t.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <CheckCircle className="w-2.5 h-2.5 text-[#E0FFFF] shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTierId(t.id);
                    }}
                    className={`w-full py-1 text-[11px] font-bold rounded-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFDAB9] text-[#0A0A0A]'
                        : 'bg-[#161922] text-[#A6B0BE] hover:text-[#F5FFFA]'
                    }`}
                  >
                    {isCurrent ? 'CURRENT' : isSelected ? 'SELECTED' : 'SELECT'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Verification Confirmation */}
        <div className="px-6 py-4 bg-[#141720] border-t border-[#242937] flex items-center justify-between">
          <div className="text-[11px] text-[#8E99A8]">
            Selected: <strong className="text-[#FFDAB9]">{targetTierObj.name}</strong> ({targetTierObj.badge})
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1E29] hover:bg-[#252B3B] text-[#A6B0BE] rounded-xs cursor-pointer"
            >
              CANCEL
            </button>

            <button
              onClick={handleActivate}
              disabled={isVerifying}
              className="px-6 py-2 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-bold rounded-xs hover:shadow-[0_0_15px_rgba(255,218,185,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {verificationSuccess
                  ? 'TIER ACTIVATED'
                  : isVerifying
                  ? 'SIGNING KEY & DEPLOYING...'
                  : 'ACTIVATE TIER'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
