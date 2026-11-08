import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, ensureAuthUser } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface OwnerContextType {
  isOwnerMode: boolean;
  ownerEmail: string;
  studioRole: string;
  isAuthModalOpen: boolean;
  isVaultOpen: boolean;
  unlockOwner: (passkey: string) => boolean;
  lockOwner: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openVault: () => void;
  closeVault: () => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

const MASTER_KEYS = [
  'KNOCKS2026',
  '7777',
  'GTamayo36@gmail.com',
  'knocks',
  'KNOCKS',
  'owner',
  'SOVEREIGN2026',
];

const STORAGE_KEY = 'knocks_enterprise_owner_session_v1';

export const OwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [ownerEmail] = useState<string>('GTamayo36@gmail.com');
  const [studioRole] = useState<string>('KNOCKSSTUDiOS™ Sovereign Owner & Executive Producer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);

  // Sync to Firestore on unlock
  const recordOwnerSessionToFirestore = async () => {
    try {
      const user = await ensureAuthUser();
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: 'GTamayo36@gmail.com',
          role: 'owner',
          displayName: 'KNOCKSSTUDiOS Executive Owner',
          lastOwnerLogin: new Date().toISOString(),
          isProEnterprise: true,
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore owner sync notice:', e);
    }
  };

  const unlockOwner = (passkey: string): boolean => {
    const trimmed = passkey.trim();
    const isValid = MASTER_KEYS.some((k) => k.toLowerCase() === trimmed.toLowerCase());

    if (isValid) {
      setIsOwnerMode(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // LocalStorage fallback
      }
      recordOwnerSessionToFirestore();
      return true;
    }
    return false;
  };

  const lockOwner = () => {
    setIsOwnerMode(false);
    setIsVaultOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // LocalStorage fallback
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openVault = () => setIsVaultOpen(true);
  const closeVault = () => setIsVaultOpen(false);

  return (
    <OwnerContext.Provider
      value={{
        isOwnerMode,
        ownerEmail,
        studioRole,
        isAuthModalOpen,
        isVaultOpen,
        unlockOwner,
        lockOwner,
        openAuthModal,
        closeAuthModal,
        openVault,
        closeVault,
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = (): OwnerContextType => {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return context;
};
