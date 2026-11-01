import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in progress
let isSigningIn = false;
// In-memory token cache (NEVER stored in localStorage per security guidelines)
let cachedAccessToken: string | null = null;

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  createdTime?: string;
  category: 'video' | 'audio' | 'image' | 'mesh3d' | 'document' | 'other';
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Categorize mimeTypes for cinema pipeline
export function categorizeDriveMime(mimeType: string, name: string): GoogleDriveFile['category'] {
  const lowerName = name.toLowerCase();
  if (mimeType.startsWith('video/') || lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.mkv') || lowerName.endsWith('.avi')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || lowerName.endsWith('.wav') || lowerName.endsWith('.mp3') || lowerName.endsWith('.flac') || lowerName.endsWith('.aac')) {
    return 'audio';
  }
  if (mimeType.startsWith('image/') || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp') || lowerName.endsWith('.exr')) {
    return 'image';
  }
  if (lowerName.endsWith('.obj') || lowerName.endsWith('.gltf') || lowerName.endsWith('.glb') || lowerName.endsWith('.fbx') || lowerName.endsWith('.blend')) {
    return 'mesh3d';
  }
  if (mimeType.includes('document') || mimeType.includes('text') || lowerName.endsWith('.pdf') || lowerName.endsWith('.txt') || lowerName.endsWith('.fdx')) {
    return 'document';
  }
  return 'other';
}

// Fetch user files from Google Drive API v3
export async function fetchUserDriveFiles(token: string): Promise<GoogleDriveFile[]> {
  const query = encodeURIComponent("trashed = false");
  const fields = encodeURIComponent("files(id, name, mimeType, size, thumbnailLink, webContentLink, createdTime)");
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=60&q=${query}&fields=${fields}&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Google Drive API error: ${response.status}`);
  }

  const data = await response.json();
  const rawFiles = data.files || [];

  return rawFiles.map((file: any) => ({
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size ? `${(Number(file.size) / (1024 * 1024)).toFixed(1)} MB` : undefined,
    thumbnailLink: file.thumbnailLink,
    webContentLink: file.webContentLink,
    createdTime: file.createdTime,
    category: categorizeDriveMime(file.mimeType, file.name),
  }));
}
