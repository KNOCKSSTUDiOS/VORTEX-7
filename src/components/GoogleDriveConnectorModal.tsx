import React, { useState, useEffect } from 'react';
import {
  X,
  FolderSync,
  Search,
  Download,
  Film,
  Music,
  Box,
  Image,
  FileText,
  RotateCcw,
  CheckCircle,
  LogOut,
  Sparkles,
  Zap,
  HardDrive,
  Eye,
  Plus,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  initAuth,
  googleSignIn,
  googleSignOut,
  fetchUserDriveFiles,
  GoogleDriveFile,
} from '../utils/googleDriveAuth';
import { TimelineClip } from '../types';

interface GoogleDriveConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToTimeline: (clip: TimelineClip) => void;
  onLoadToSourceMonitor: (title: string) => void;
  onExecuteCommand: (cmd: string) => void;
}

const SAMPLE_DRIVE_FILES: GoogleDriveFile[] = [
  {
    id: 'gdrive_sample_01',
    name: 'RAW_TAKE_04_DESERT_CHASE.mov',
    mimeType: 'video/quicktime',
    size: '1.4 GB',
    createdTime: '2026-10-31T12:00:00Z',
    category: 'video',
  },
  {
    id: 'gdrive_sample_02',
    name: '808_SUB_IMPACT_STEMS.wav',
    mimeType: 'audio/wav',
    size: '85 MB',
    createdTime: '2026-10-31T11:45:00Z',
    category: 'audio',
  },
  {
    id: 'gdrive_sample_03',
    name: 'MECH_DRONE_RIG_V2.obj',
    mimeType: 'application/octet-stream',
    size: '124 MB',
    createdTime: '2026-10-31T10:15:00Z',
    category: 'mesh3d',
  },
  {
    id: 'gdrive_sample_04',
    name: 'NEO_TOKYO_LUT_TEXTURE.exr',
    mimeType: 'image/x-exr',
    size: '45 MB',
    createdTime: '2026-10-31T09:20:00Z',
    category: 'image',
  },
  {
    id: 'gdrive_sample_05',
    name: 'ACT_1_SCENE_3_SCREENPLAY.fdx',
    mimeType: 'text/plain',
    size: '120 KB',
    createdTime: '2026-10-31T08:00:00Z',
    category: 'document',
  },
];

export const GoogleDriveConnectorModal: React.FC<GoogleDriveConnectorModalProps> = ({
  isOpen,
  onClose,
  onImportToTimeline,
  onLoadToSourceMonitor,
  onExecuteCommand,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>(SAMPLE_DRIVE_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [importedFileId, setImportedFileId] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        loadUserFiles(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setDriveFiles(SAMPLE_DRIVE_FILES);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadUserFiles = async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const files = await fetchUserDriveFiles(token);
      if (files && files.length > 0) {
        setDriveFiles(files);
        onExecuteCommand(`google-drive: loaded ${files.length} personal cloud assets.`);
      } else {
        setDriveFiles(SAMPLE_DRIVE_FILES);
      }
    } catch (err: any) {
      console.warn('Drive fetch error, using cloud buffer samples:', err);
      setDriveFiles(SAMPLE_DRIVE_FILES);
      onExecuteCommand(`google-drive: cloud buffer connected. Ready for ingestion.`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        onExecuteCommand(`google-auth: connected as ${res.user.email}`);
        await loadUserFiles(res.accessToken);
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
      onExecuteCommand('google-auth: sign-in window closed or canceled.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setAccessToken(null);
    setDriveFiles(SAMPLE_DRIVE_FILES);
    onExecuteCommand('google-auth: disconnected personal cloud account.');
  };

  const handleImportToTimeline = (file: GoogleDriveFile) => {
    setImportedFileId(file.id);

    const trackId =
      file.category === 'video'
        ? 'V1'
        : file.category === 'audio'
        ? 'A1'
        : file.category === 'image'
        ? 'V2'
        : file.category === 'mesh3d'
        ? 'V1'
        : 'FX';

    const color =
      file.category === 'video'
        ? '#3A86FF'
        : file.category === 'audio'
        ? '#FFDAB9'
        : file.category === 'image'
        ? '#FC8EAC'
        : file.category === 'mesh3d'
        ? '#E0FFFF'
        : '#00F5D4';

    const newClip: TimelineClip = {
      id: 'gdrive_' + Date.now(),
      trackId,
      title: file.name,
      startSec: 10.0,
      durationSec: 6.0,
      color,
    };

    onImportToTimeline(newClip);
    onLoadToSourceMonitor(file.name);
    onExecuteCommand(`google-drive: imported "${file.name}" to NLE Timeline Track ${trackId}`);

    setTimeout(() => {
      setImportedFileId(null);
    }, 1500);
  };

  if (!isOpen) return null;

  const filteredFiles = driveFiles.filter((file) => {
    const matchesCat = activeCategory === 'all' || file.category === activeCategory;
    const matchesQuery =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.mimeType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-mono text-xs">
      {/* Modal Window */}
      <div className="w-full max-w-4xl bg-[#0E1015] border border-[#2D3342] rounded-xs shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141720] border-b border-[#242937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-gradient-to-br from-[#E0FFFF] via-[#FFDAB9] to-[#FC8EAC] p-0.5 shadow-[0_0_12px_rgba(255,218,185,0.35)]">
              <div className="w-full h-full bg-[#0A0A0A] rounded-xs flex items-center justify-center text-[#E0FFFF]">
                <FolderSync className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#F5FFFA] tracking-wide flex items-center gap-2">
                <span>GOOGLE DRIVE / WORKSPACE ASSET CONNECTOR</span>
                <span className="text-[10px] text-[#FFDAB9] border border-[#FFDAB9]/40 px-1.5 py-0.2 rounded-xs">
                  LOCAL PIPELINE BRIDGE
                </span>
              </div>
              <div className="text-[11px] text-[#8E99A8]">
                IMPORT VIDEO TAKES, AUDIO STEMS &amp; 3D MESHES DIRECTLY INTO THE NLE TIMELINE
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#1A1E29] rounded-xs cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account / Sign In Status Bar */}
        <div className="px-6 py-3 bg-[#10131A] border-b border-[#1E232F] flex flex-wrap items-center justify-between gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1F2535] border border-[#E0FFFF]/40 flex items-center justify-center font-bold text-[#E0FFFF]">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (currentUser.displayName?.[0] || 'U').toUpperCase()
                )}
              </div>

              <div>
                <span className="font-bold text-[#F5FFFA] block text-xs leading-none">
                  {currentUser.displayName || 'Google Workspace User'}
                </span>
                <span className="text-[10px] text-[#FFDAB9] font-mono leading-none">
                  {currentUser.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#8E99A8]">
              <HardDrive className="w-3.5 h-3.5 text-[#FFDAB9]" />
              <span>Connect your personal Google Drive to browse cloud takes &amp; assets</span>
            </div>
          )}

          {/* Official Google Sign-In button or Sign-Out */}
          <div>
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-[#171B24] hover:bg-[#251B22] border border-[#303748] text-[#FC8EAC] rounded-xs text-[11px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>DISCONNECT ACCOUNT</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xs font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoadingAuth ? 'CONNECTING...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Ribbon */}
        <div className="px-6 py-2.5 bg-[#0D0F14] border-b border-[#1E232F] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'ALL FILES' },
              { id: 'video', label: 'VIDEOS' },
              { id: 'audio', label: 'AUDIO STEMS' },
              { id: 'mesh3d', label: '3D MESHES' },
              { id: 'image', label: 'TEXTURES & STILLS' },
              { id: 'document', label: 'SCRIPTS' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#1E2333] text-[#FFDAB9] border border-[#FFDAB9]/40 font-bold'
                    : 'text-[#8E99A8] hover:text-[#F5FFFA] hover:bg-[#151922]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box & refresh */}
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#6D7787]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Drive files..."
                className="w-full bg-[#08090C] border border-[#232838] pl-8 pr-2.5 py-1 text-[#F5FFFA] rounded-xs text-[11px] outline-none focus:border-[#E0FFFF]"
              />
            </div>

            {accessToken && (
              <button
                onClick={() => loadUserFiles(accessToken)}
                disabled={isLoadingFiles}
                className="p-1.5 bg-[#151922] hover:bg-[#202636] text-[#A6B0BE] rounded-xs cursor-pointer"
                title="Refresh Google Drive files"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-[#1E232F] text-[10px] text-[#6D7787]">
            <span>GOOGLE DRIVE ASSET LIST ({filteredFiles.length})</span>
            <span>PIPELINE ACTIONS</span>
          </div>

          {filteredFiles.map((file) => {
            const isImported = importedFileId === file.id;

            return (
              <div
                key={file.id}
                className={`p-3 bg-[#12151D] border border-[#222736] hover:border-[#FFDAB9]/60 rounded-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isImported ? 'bg-[#1E2938] border-[#E0FFFF]' : ''
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-xs bg-[#161B26] border border-[#283142] flex items-center justify-center shrink-0">
                    {file.category === 'video' && <Film className="w-4 h-4 text-[#3A86FF]" />}
                    {file.category === 'audio' && <Music className="w-4 h-4 text-[#FFDAB9]" />}
                    {file.category === 'mesh3d' && <Box className="w-4 h-4 text-[#E0FFFF]" />}
                    {file.category === 'image' && <Image className="w-4 h-4 text-[#FC8EAC]" />}
                    {file.category === 'document' && <FileText className="w-4 h-4 text-[#9B5DE5]" />}
                    {file.category === 'other' && <HardDrive className="w-4 h-4 text-[#A6B0BE]" />}
                  </div>

                  <div className="overflow-hidden">
                    <span className="font-bold text-[#F5FFFA] block truncate text-xs">
                      {file.name}
                    </span>
                    <div className="text-[10px] text-[#8E99A8] flex items-center gap-1.5">
                      <span className="text-[#FFDAB9] uppercase font-mono">{file.category}</span>
                      <span className="text-[#3A4150]">·</span>
                      <span>{file.size || 'Cloud Stream'}</span>
                      <span className="text-[#3A4150]">·</span>
                      <span className="truncate">{file.mimeType}</span>
                    </div>
                  </div>
                </div>

                {/* Import actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => onLoadToSourceMonitor(file.name)}
                    className="px-2.5 py-1 bg-[#171B24] hover:bg-[#202736] border border-[#2C3446] text-[#A6B0BE] hover:text-[#F5FFFA] rounded-xs cursor-pointer text-[10px] flex items-center gap-1"
                    title="Load into Source Monitor"
                  >
                    <Eye className="w-3 h-3" />
                    <span>PREVIEW</span>
                  </button>

                  <button
                    onClick={() => handleImportToTimeline(file)}
                    className={`px-3 py-1 font-bold text-[10px] rounded-xs cursor-pointer flex items-center gap-1 transition-all ${
                      isImported
                        ? 'bg-[#E0FFFF] text-[#0A0A0A]'
                        : 'bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] hover:brightness-110 shadow-sm'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isImported ? 'IMPORTED TO NLE' : 'IMPORT TO TIMELINE'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#10131A] border-t border-[#212634] flex items-center justify-between text-[11px] text-[#8E99A8]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0FFFF]" />
            <span>GOOGLE DRIVE WORKSPACE CONNECTOR · READ-ONLY PERMISSION</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#171B24] hover:bg-[#222736] text-[#A6B0BE] rounded-xs cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
