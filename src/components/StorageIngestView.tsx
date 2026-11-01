import React, { useState } from 'react';
import {
  UploadCloud,
  FolderSync,
  Database,
  Network,
  ShieldCheck,
  HardDrive,
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  Zap,
  Box,
  FileText,
  Lock,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';

interface StorageIngestViewProps {
  onExecuteCommand: (cmd: string) => void;
  onOpenGoogleDrive?: () => void;
}

export const StorageIngestView: React.FC<StorageIngestViewProps> = ({ onExecuteCommand, onOpenGoogleDrive }) => {
  const [activeSubTab, setActiveSubTab] = useState<'drive' | 'ftp' | 'zip' | 'db' | 'mcp'>('drive');
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SYNCED'>('SYNCED');
  const [ftpConnected, setFtpConnected] = useState<boolean>(true);
  const [sqliteRecords, setSqliteRecords] = useState<number>(1429);

  const [mcpServers, setMcpServers] = useState([
    {
      id: 'mcp-drive',
      name: 'Google Drive & Workspace MCP Connector',
      uri: 'mcp://workspace.knocks.local:8080',
      status: 'CONNECTED',
      latency: '0.4ms',
      type: 'Cloud Drive Storage & Ingestion',
    },
    {
      id: 'mcp-shaders',
      name: 'GPU Shader & Pyrotechnic Buffer Pipeline',
      uri: 'mcp://shaders.tempest.local:9092',
      status: 'ACTIVE',
      latency: '0.1ms',
      type: 'Volumetric Pyro / Gerstner Waves',
    },
    {
      id: 'mcp-sqlite',
      name: 'Local SQLite Studio Archival Ingestion',
      uri: 'mcp://db.knocks.local:5432',
      status: 'SYNCED',
      latency: '0.2ms',
      type: 'Database Sweeping & Metadata',
    },
    {
      id: 'mcp-llm',
      name: 'Local LLM & Storyboard Context Hub',
      uri: 'mcp://ai.infinity.local:11434',
      status: 'STANDBY',
      latency: '1.2ms',
      type: 'Neural Prompt-to-Video Engine',
    },
  ]);

  const handleSyncCloudDrive = () => {
    setSyncStatus('SYNCING');
    onExecuteCommand('cloud-drive sync --target "KNOCKSSTUDiOS_ARCHIVE" --bidirectional');

    setTimeout(() => {
      setSyncStatus('SYNCED');
      onExecuteCommand('cloud-drive: 42 files synchronized with Google Drive workspace buffer.');
    }, 1200);
  };

  const handleScanDatabase = () => {
    onExecuteCommand('sqlite-ingest scan --directory "/assets" --extract-metadata');
    setSqliteRecords((prev) => prev + 18);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0B0E] select-none text-xs font-mono overflow-y-auto">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-[#12141C] border-b border-[#212634] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#FFDAB9]" />
            <span className="font-extrabold text-sm text-[#F5FFFA] tracking-wide">
              UPLOADS &amp; DOWNLOADS // TRANSFER &amp; REPOSITORY SUITE
            </span>
          </div>
          <div className="text-[11px] text-[#8E99A8]">
            COPPER FTP · CLOUD DRIVE MASTER · SQLITE INGESTION · MCP PROTOCOL SERVER MESH
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 border border-[#262B36] rounded-xs">
          {[
            { id: 'drive', label: 'CLOUD DRIVE SYNC' },
            { id: 'ftp', label: 'COPPER FTP' },
            { id: 'zip', label: 'EXPRESS ZIP' },
            { id: 'db', label: 'SQLITE INGEST' },
            { id: 'mcp', label: 'MCP SERVER HUB' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-xs transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#1E2333] text-[#FFDAB9] font-bold border border-[#FFDAB9]/40'
                  : 'text-[#8E99A8] hover:text-[#F5FFFA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-5">
        {/* TAB 1: CLOUD DRIVE SYNCHRONIZER */}
        {activeSubTab === 'drive' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-[#141824] to-[#171B28] border border-[#FFDAB9]/40 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(255,218,185,0.08)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E0FFFF] shadow-[0_0_6px_#E0FFFF]" />
                  <span className="font-extrabold text-[#F5FFFA] text-sm tracking-wide">
                    DIRECT GOOGLE DRIVE WORKSPACE CONNECTOR
                  </span>
                  <span className="text-[10px] text-[#FC8EAC] border border-[#FC8EAC]/40 px-1.5 py-0.2 rounded-xs">
                    OAUTH 2.0 DRIVE.READONLY
                  </span>
                </div>
                <p className="text-[11px] text-[#8E99A8]">
                  Browse and 1-click import RAW takes (.MOV, .MP4), 808 audio stems (.WAV), 3D meshes (.OBJ, .GLB), and screenplays (.PDF, .TXT) directly into KNOCKSSTUDiOS NLE timeline tracks or source monitor.
                </p>
              </div>

              {onOpenGoogleDrive && (
                <button
                  onClick={onOpenGoogleDrive}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#FFDAB9] via-[#FC8EAC] to-[#E0FFFF] text-[#0A0A0A] font-extrabold tracking-wide rounded-xs cursor-pointer shadow-[0_0_15px_rgba(255,218,185,0.3)] hover:brightness-110 whitespace-nowrap flex items-center gap-2 text-xs"
                >
                  <FolderSync className="w-4 h-4 text-[#0A0A0A]" />
                  <span>BROWSE &amp; IMPORT DRIVE ASSETS</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-[#12151E] border border-[#262C3D] rounded-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[#FFDAB9] font-bold block text-sm flex items-center gap-2">
                  <FolderSync className="w-4 h-4 text-[#FFDAB9]" />
                  CLOUD DRIVE MASTER (GOOGLE DRIVE &amp; WORKSPACE BUFFER)
                </span>
                <p className="text-[11px] text-[#8E99A8] max-w-xl">
                  Automated real-time bidirectional synchronization with sovereign Google Drive workspace nodes.
                  Provides high-speed frame buffers for shader rendering and timeline ingest.
                </p>
              </div>

              <button
                onClick={handleSyncCloudDrive}
                className="px-4 py-2 bg-gradient-to-r from-[#FFDAB9] to-[#FC8EAC] text-[#0A0A0A] font-bold rounded-xs cursor-pointer shadow-[0_0_12px_rgba(255,218,185,0.3)] hover:brightness-110 flex items-center gap-2"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'SYNCING' ? 'SYNCING BUFFERS...' : 'SYNC CLOUD DRIVE NOW'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#11131A] border border-[#212634] rounded-xs space-y-1">
                <span className="text-[10px] text-[#6D7787] block">WORKSPACE DRIVE NODE</span>
                <span className="text-[#E0FFFF] font-bold block text-sm">KNOCKS_STUDIO_DRIVE</span>
                <span className="text-[10px] text-[#FFDAB9]">Status: {syncStatus}</span>
              </div>
              <div className="p-3 bg-[#11131A] border border-[#212634] rounded-xs space-y-1">
                <span className="text-[10px] text-[#6D7787] block">STORAGE BUFFER LOAD</span>
                <span className="text-[#FC8EAC] font-bold block text-sm">14.8 GB / 100 GB</span>
                <span className="text-[10px] text-[#8E99A8]">Bandwidth: 1.2 Gbps Local</span>
              </div>
              <div className="p-3 bg-[#11131A] border border-[#212634] rounded-xs space-y-1">
                <span className="text-[10px] text-[#6D7787] block">ENCRYPTION LEVEL</span>
                <span className="text-[#F5FFFA] font-bold block text-sm">AES-256 GCM</span>
                <span className="text-[10px] text-[#E0FFFF]">Sovereign Hardware Key Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COPPER FTP SERVER */}
        {activeSubTab === 'ftp' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#12151E] border border-[#262C3D] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[#E0FFFF] font-bold text-sm block">COPPER FTP SERVER NODE</span>
                <p className="text-[11px] text-[#8E99A8]">
                  Direct studio FTP/SFTP socket endpoint for remote cinema camera offloading and multi-track audio ingest.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-[#1A2533] text-[#E0FFFF] rounded-xs text-[10px] font-bold">
                  PORT: 2121 / 2222 SFTP
                </span>
                <button
                  onClick={() => {
                    setFtpConnected(!ftpConnected);
                    onExecuteCommand(`ftp-server ${!ftpConnected ? 'start' : 'stop'} --port 2121`);
                  }}
                  className="px-3 py-1.5 bg-[#1A1F2C] border border-[#313A4F] text-[#F5FFFA] rounded-xs cursor-pointer hover:bg-[#252C3E]"
                >
                  {ftpConnected ? 'PAUSE FTP NODE' : 'START FTP NODE'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#08090C] border border-[#1E232F] rounded-xs space-y-1.5 text-[11px] font-mono">
              <div className="text-[#6D7787]">[COPPER FTP LISTENER] Port 2121 active. Listening for cinema camera rigs.</div>
              <div className="text-[#E0FFFF]">[AUTH] Client 'CAM_A_RED_RAPTOR' authenticated via SSH-ED25519.</div>
              <div className="text-[#FFDAB9]">[INCOMING] Ingesting take: 'SC01_T04_4K_PRORES.MOV' (4.2 GB) - 98MB/s.</div>
              <div className="text-[#A6B0BE]">[QUEUE] 0 remaining queue locks. Auto-insertion into NLE Timeline V1.</div>
            </div>
          </div>
        )}

        {/* TAB 3: EXPRESS ZIP COMPRESSOR */}
        {activeSubTab === 'zip' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#12151E] border border-[#262C3D] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[#FC8EAC] font-bold text-sm block">EXPRESS ZIP &amp; ARCHIVER</span>
                <p className="text-[11px] text-[#8E99A8]">
                  Lossless multi-threaded tar, zip, 7z archiving for Hollywood package distribution and DCP deliverables.
                </p>
              </div>

              <button
                onClick={() => onExecuteCommand('express-zip create --package "MASTER_DCP_RELEASE" --threads 16')}
                className="px-4 py-2 bg-[#1E2535] border border-[#FFDAB9]/40 text-[#FFDAB9] font-bold rounded-xs cursor-pointer hover:bg-[#283248]"
              >
                CREATE MASTER ARCHIVE (.ZIP / .TAR)
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SQLITE INGEST */}
        {activeSubTab === 'db' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#12151E] border border-[#262C3D] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[#E0FFFF] font-bold text-sm block">SQLITE ASSET INGESTION PORTAL</span>
                <p className="text-[11px] text-[#8E99A8]">
                  Automated filesystem indexing sweeps local drives, parses frame metadata, and stores indexing in SQLite.
                </p>
              </div>

              <button
                onClick={handleScanDatabase}
                className="px-4 py-2 bg-gradient-to-r from-[#FFDAB9] to-[#E0FFFF] text-[#0A0A0A] font-bold rounded-xs cursor-pointer hover:brightness-110"
              >
                SWEEP &amp; INDEX DIRECTORY NOW
              </button>
            </div>

            <div className="p-3 bg-[#11131A] border border-[#212634] rounded-xs flex items-center justify-between">
              <span className="text-[#A6B0BE]">TOTAL INDEXED ASSETS:</span>
              <span className="text-[#FFDAB9] font-bold text-base">{sqliteRecords.toLocaleString()} ASSETS</span>
            </div>
          </div>
        )}

        {/* TAB 5: MCP SERVER HUB */}
        {activeSubTab === 'mcp' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#12151E] border border-[#262C3D] rounded-xs flex items-center justify-between">
              <div>
                <span className="text-[#FFDAB9] font-bold text-sm block flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#FFDAB9]" />
                  MODEL CONTEXT PROTOCOL (MCP) SERVER HUB
                </span>
                <p className="text-[11px] text-[#8E99A8]">
                  Connect and orchestrate local MCP endpoints, tool plugins, Google Drive connectors, and shader rendering buffers.
                </p>
              </div>

              <button
                onClick={() => onExecuteCommand('mcp ping --all-servers')}
                className="px-3.5 py-1.5 bg-[#1B2232] border border-[#E0FFFF]/40 text-[#E0FFFF] rounded-xs font-bold cursor-pointer hover:bg-[#253046]"
              >
                PING ALL SERVERS
              </button>
            </div>

            <div className="space-y-2">
              {mcpServers.map((server) => (
                <div
                  key={server.id}
                  className="p-3 bg-[#11141C] border border-[#222736] rounded-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F5FFFA]">{server.name}</span>
                      <span className="text-[10px] text-[#E0FFFF] bg-[#16222F] px-1.5 py-0.2 rounded-xs font-mono">
                        {server.uri}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8E99A8]">{server.type}</span>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-[10px] text-[#FFDAB9] block font-bold">{server.status}</span>
                      <span className="text-[9px] text-[#6D7787]">{server.latency}</span>
                    </div>

                    <button
                      onClick={() => onExecuteCommand(`mcp inspect ${server.id}`)}
                      className="px-2.5 py-1 bg-[#1A1F2C] hover:bg-[#262E40] text-[#A6B0BE] rounded-xs cursor-pointer text-[10px]"
                    >
                      INSPECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
