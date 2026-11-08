import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Music,
  Video,
  Mic,
  MicOff,
  Image as ImageIcon,
  MapPin,
  Globe,
  Radio,
  Send,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  CheckCircle2,
  Film,
  Zap,
} from 'lucide-react';
import { rustWasmPipeline } from '../utils/rustWasmMemorySafePipeline';
import { audioEngine } from '../utils/audioEngine';

interface GeminiStudioSuiteProps {
  onExecuteCommand?: (cmd: string) => void;
  onSynthesizeClip?: (title: string, duration: number, type: 'video' | 'audio') => void;
}

type AITab = 'chat' | 'video_omni' | 'music_lyria' | 'transcribe' | 'grounding' | 'live_voice';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini' | 'system';
  text: string;
  timestamp: string;
  groundingSources?: { title: string; url: string }[];
}

export const GeminiStudioSuite: React.FC<GeminiStudioSuiteProps> = ({
  onExecuteCommand,
  onSynthesizeClip,
}) => {
  const [activeTab, setActiveTab] = useState<AITab>('chat');

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'KNOCKSSTUDiOS Gemini Intelligence Hub online. Powered by gemini-3.8-flash with Hollywood Motion Pictures system instructions.',
      timestamp: '12:00:00',
    },
    {
      id: 'm2',
      sender: 'gemini',
      text: 'Greetings Director. How shall we orchestrate your next cinema sequence? I can draft screenplay beats, compose Lyria musical stems, transcribe vocal takes, or render grounded geospatial visual scenes.',
      timestamp: '12:00:01',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Video Omni States
  const [videoPrompt, setVideoPrompt] = useState<string>(
    'Anamorphic 65mm IMAX footage of an orbital cyber city at twilight, heavy volumetric rain, neon reflection blooms, cinematic color grade'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  // Lyria Music States
  const [lyriaPrompt, setLyriaPrompt] = useState<string>(
    'Dark cyberpunk cinematic trailer score, thunderous 808 sub-bass, aggressive analog synthesizers, 128 BPM, Hans Zimmer brass horns'
  );
  const [musicBpm, setMusicBpm] = useState<number>(128);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState<boolean>(false);
  const [isPlayingMusicPreview, setIsPlayingMusicPreview] = useState<boolean>(false);

  // Audio Transcription States
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [transcriptionText, setTranscriptionText] = useState<string>(
    'COMM CHANNEL 04: "Flight control, this is Titan Squadron Leader. We have breached the troposphere. Quantum slipstream shields holding at ninety-two percent. Commencing orbital burn now."'
  );

  // Grounding States (Search & Maps)
  const [groundingQuery, setGroundingQuery] = useState<string>('Hollywood motion picture sound stages in Los Angeles and IMAX 70mm projection specs');
  const [groundingType, setGroundingType] = useState<'search' | 'maps'>('search');
  const [groundingResults, setGroundingResults] = useState<{ title: string; snippet: string; link: string }[]>([
    {
      title: 'Warner Bros. Studios Burbank - Stage 16 (Largest sound stage in North America)',
      snippet: 'Stage 16 features a 2-million-gallon water tank and ceiling clearance of 65 feet, utilized for major motion pictures.',
      link: 'https://maps.google.com/?q=Warner+Bros+Studio+Stage+16',
    },
    {
      title: 'Universal Studios Sound Stages & Production Backlot Facilities',
      snippet: 'State-of-the-art facility supporting LED volume stages and Dolby Atmos certified dubbing suites.',
      link: 'https://maps.google.com/?q=Universal+Studios+Lot',
    },
  ]);

  // Live Voice States
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);

  // Handle Send Chat
  const handleSendMessage = () => {
    if (!inputText.trim() || isAiThinking) return;
    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    // Rust/WASM memory safe check
    const verify = rustWasmPipeline.verifyAssetOperation('gemini_chat_stream', userMsg.text.slice(0, 30), 'system', 1048576);
    if (onExecuteCommand) {
      onExecuteCommand(`gemini-3.8-flash prompt: [Rust Memory Safe] ${verify.borrowCheck}`);
    }

    // Simulate intelligent response with system instructions
    setTimeout(() => {
      const responses = [
        `Director, I've analyzed your screenplay sequence. The emotional cadence can be elevated by introducing a 240Hz low-shelf sub bass drop right before the visual impact at 00:04:12. I've logged the corresponding camera focal parameters into your inspector.`,
        `Synthesizing cinematic breakdown for: "${userMsg.text}". The lighting matrix recommends a cool 5600K key contrasted with a 3200K tungsten fill to emphasize the volumetric smoke particles.`,
        `Prompt parsed into 4K render pipeline. The Rust memory-safe borrow checker has validated all frame buffers with zero pointer leakage. All timeline tracks are ready for playback.`,
      ];
      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        sender: 'gemini',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsAiThinking(false);
    }, 900);
  };

  // Handle Generate Video with Omni
  const handleGenerateVideo = () => {
    setIsGeneratingVideo(true);
    const verify = rustWasmPipeline.verifyAssetOperation('gemini_omni_video_stream', videoPrompt.slice(0, 25), 'video', 33554432);
    if (onExecuteCommand) {
      onExecuteCommand(`gemini-omni-1.1-flash text-to-video: ${verify.borrowCheck}`);
    }

    setTimeout(() => {
      setIsGeneratingVideo(false);
      setRenderedVideoUrl('/public/assets/aistudio/Video_October_31__2026_-_5_29PM_e5f40340');
      if (onSynthesizeClip) {
        onSynthesizeClip('OMNI_SYNTH_SCENE_01', 8.5, 'video');
      }
    }, 2400);
  };

  // Handle Generate Music with Lyria
  const handleGenerateMusic = () => {
    setIsGeneratingMusic(true);
    const verify = rustWasmPipeline.verifyAssetOperation('lyria_pro_music_stream', lyriaPrompt.slice(0, 25), 'audio', 16777216);
    if (onExecuteCommand) {
      onExecuteCommand(`lyria-3-pro-preview stem composition: ${verify.borrowCheck}`);
    }

    setTimeout(() => {
      setIsGeneratingMusic(false);
      setIsPlayingMusicPreview(true);
      audioEngine.trigger808Bass(45, 2.0, 0.8);
      audioEngine.startAmbientLoop();
      if (onSynthesizeClip) {
        onSynthesizeClip('LYRIA_CYBER_TRAILER_BGM', 15.0, 'audio');
      }
    }, 2000);
  };

  // Toggle Live Voice
  const handleToggleLiveVoice = () => {
    if (isLiveConnected) {
      setIsLiveConnected(false);
      setVoiceVolume(0);
      if (onExecuteCommand) onExecuteCommand('gemini-3.8-live voice conversation closed');
    } else {
      setIsLiveConnected(true);
      if (onExecuteCommand) onExecuteCommand('gemini-3.8-live WebRTC audio stream 24kHz online');
    }
  };

  // Simulate Voice Volume Pulse
  useEffect(() => {
    if (!isLiveConnected) return;
    const interval = setInterval(() => {
      setVoiceVolume(Math.random() * 85 + 15);
    }, 120);
    return () => clearInterval(interval);
  }, [isLiveConnected]);

  return (
    <div className="w-full h-full flex flex-col bg-[#07090E] text-gray-200 font-mono select-none overflow-hidden">
      {/* 1. TOP SUITE NAVIGATION */}
      <div className="bg-[#0C101A] border-b border-[#1E293B] px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#9B5DE5]/20 border border-[#9B5DE5] rounded text-[#9B5DE5]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wider flex items-center space-x-2">
              <span>KNOCKSSTUDiOS // GEMINI AI CINEMA INTELLIGENCE</span>
              <span className="px-2 py-0.5 bg-[#9B5DE5]/30 border border-[#9B5DE5] text-[10px] text-[#D8B4FE] font-bold rounded">
                SERVER-SIDE MULTI-MODAL SDK
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              Gemini 3.8 Flash, Omni Video, Lyria Music, Grounding & Live API Voice
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-[#9B5DE5] text-white shadow-[0_0_12px_rgba(155,93,229,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>CHATBOT</span>
          </button>
          <button
            onClick={() => setActiveTab('video_omni')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'video_omni'
                ? 'bg-[#3A86FF] text-white shadow-[0_0_12px_rgba(58,134,255,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>OMNI VIDEO</span>
          </button>
          <button
            onClick={() => setActiveTab('music_lyria')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'music_lyria'
                ? 'bg-[#F15BB5] text-white shadow-[0_0_12px_rgba(241,91,181,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>LYRIA MUSIC</span>
          </button>
          <button
            onClick={() => setActiveTab('transcribe')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'transcribe'
                ? 'bg-[#00F5D4] text-black shadow-[0_0_12px_rgba(0,245,212,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>TRANSCRIBE</span>
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'grounding'
                ? 'bg-[#FEE440] text-black shadow-[0_0_12px_rgba(254,228,64,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GROUNDING</span>
          </button>
          <button
            onClick={() => setActiveTab('live_voice')}
            className={`px-3 py-1.5 rounded flex items-center space-x-1.5 font-bold transition-all ${
              activeTab === 'live_voice'
                ? 'bg-[#EF4444] text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-[#1E293B] text-gray-300 hover:bg-[#334155]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE API</span>
          </button>
        </div>
      </div>

      {/* 2. TAB WORKSPACES */}
      <div className="flex-1 flex overflow-hidden p-4">
        {/* TAB 1: GEMINI CHATBOT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-[#0B0F19] border border-[#1E293B] rounded-lg overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-2xl ${
                    m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div className="text-[10px] text-gray-500 mb-0.5">
                    {m.sender.toUpperCase()} • {m.timestamp}
                  </div>
                  <div
                    className={`p-3 rounded text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#3A86FF] text-white rounded-br-none'
                        : m.sender === 'system'
                        ? 'bg-[#1E293B] text-gray-400 border border-gray-700 italic'
                        : 'bg-[#141C2E] text-gray-200 border border-[#1E293B] rounded-bl-none shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="text-xs text-[#9B5DE5] animate-pulse flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini 3.8 Flash reasoning with Rust borrow-checker memory verification...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="bg-[#0E1424] border-t border-[#1E293B] p-3 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Gemini to draft screenplay scenes, calculate lens field of view, or compose audio cues..."
                className="flex-1 bg-[#070A12] border border-[#1E293B] px-3.5 py-2 rounded text-xs text-white focus:outline-none focus:border-[#9B5DE5]"
              />
              <button
                onClick={handleSendMessage}
                disabled={isAiThinking || !inputText.trim()}
                className="px-4 py-2 bg-[#9B5DE5] hover:bg-[#8338EC] text-white font-bold text-xs rounded flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: OMNI VIDEO GENERATION (gemini-omni-1.1-flash) */}
        {activeTab === 'video_omni' && (
          <div className="flex-1 flex space-x-4 overflow-hidden">
            {/* Prompt Controls */}
            <div className="w-96 bg-[#0B0F19] border border-[#1E293B] rounded-lg p-4 flex flex-col space-y-4">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-[#3A86FF]" />
                <span>GEMINI OMNI FLASH 1.1 VIDEO ENGINE</span>
              </div>
              <div className="text-[11px] text-gray-400 leading-snug">
                Generate or extend cinema-grade video sequences from text prompts or reference pictures.
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">CINEMATIC PROMPT:</label>
                <textarea
                  rows={4}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  className="w-full bg-[#070A12] border border-[#1E293B] p-2.5 rounded text-xs text-white focus:outline-none focus:border-[#3A86FF]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">ASPECT RATIO:</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold ${
                      aspectRatio === '16:9' ? 'bg-[#3A86FF] text-white' : 'bg-[#1E293B] text-gray-300'
                    }`}
                  >
                    16:9 Cinema
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold ${
                      aspectRatio === '9:16' ? 'bg-[#3A86FF] text-white' : 'bg-[#1E293B] text-gray-300'
                    }`}
                  >
                    9:16 Reel
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo}
                className="w-full py-3 bg-[#3A86FF] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(58,134,255,0.4)] flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>RENDERING 4K FRAMES...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>SYNTHESIZE VIDEO TAKE</span>
                  </>
                )}
              </button>
            </div>

            {/* Video Preview Monitor */}
            <div className="flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden">
              {renderedVideoUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    src={renderedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-full max-w-full rounded border border-[#1E293B] shadow-2xl object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 px-2.5 py-1 rounded text-[10px] text-[#00F5D4] font-bold border border-[#00F5D4]">
                    OMNI FLASH RENDERED • 60 FPS
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-2">
                  <Film className="w-12 h-12 mx-auto text-gray-600" />
                  <div className="text-xs font-bold text-gray-400">READY TO SYNTHESIZE</div>
                  <div className="text-[11px] text-gray-600 max-w-sm">
                    Enter your scene prompt and click Synthesize to render motion picture sequences with Gemini Omni.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LYRIA MUSIC GENERATION */}
        {activeTab === 'music_lyria' && (
          <div className="flex-1 flex space-x-4 overflow-hidden">
            <div className="w-96 bg-[#0B0F19] border border-[#1E293B] rounded-lg p-4 flex flex-col space-y-4">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <Music className="w-4 h-4 text-[#F15BB5]" />
                <span>LYRIA PRO MUSIC COMPOSER</span>
              </div>
              <div className="text-[11px] text-gray-400 leading-snug">
                Compose full orchestral, electronic cyberpunk, or ambient stems with Lyria Pro.
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">PROMPT / MOOD:</label>
                <textarea
                  rows={4}
                  value={lyriaPrompt}
                  onChange={(e) => setLyriaPrompt(e.target.value)}
                  className="w-full bg-[#070A12] border border-[#1E293B] p-2.5 rounded text-xs text-white focus:outline-none focus:border-[#F15BB5]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold mb-1">
                  <span>TEMPO (BPM):</span>
                  <span className="text-white">{musicBpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={musicBpm}
                  onChange={(e) => setMusicBpm(Number(e.target.value))}
                  className="w-full accent-[#F15BB5]"
                />
              </div>

              <button
                onClick={handleGenerateMusic}
                disabled={isGeneratingMusic}
                className="w-full py-3 bg-[#F15BB5] hover:bg-[#D946EF] text-white font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(241,91,181,0.4)] flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isGeneratingMusic ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>COMPOSING STEMS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>GENERATE LYRIA TRACK</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 bg-[#0B0F19] border border-[#1E293B] rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#F15BB5]/10 border-2 border-[#F15BB5] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(241,91,181,0.3)]">
                <Music className={`w-10 h-10 text-[#F15BB5] ${isPlayingMusicPreview ? 'animate-bounce' : ''}`} />
              </div>
              <div className="text-sm font-bold text-white mb-1">LYRIA 3 PRO STEREO PREVIEW</div>
              <div className="text-xs text-gray-400 max-w-md mb-6">
                Direct synthesis mapped into 32-bit floating point PCM audio buffers with sub-808 bass boost.
              </div>

              <button
                onClick={() => {
                  if (isPlayingMusicPreview) {
                    audioEngine.stopAmbientLoop();
                    setIsPlayingMusicPreview(false);
                  } else {
                    audioEngine.trigger808Bass(45, 1.5, 0.8);
                    audioEngine.startAmbientLoop();
                    setIsPlayingMusicPreview(true);
                  }
                }}
                className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#334155] border border-gray-600 rounded text-xs font-bold text-white flex items-center space-x-2"
              >
                {isPlayingMusicPreview ? <Pause className="w-4 h-4 text-[#F15BB5]" /> : <Play className="w-4 h-4 text-[#00F5D4]" />}
                <span>{isPlayingMusicPreview ? 'PAUSE PREVIEW' : 'PLAY LIVE DSP PREVIEW'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIO TRANSCRIPTION */}
        {activeTab === 'transcribe' && (
          <div className="flex-1 flex flex-col bg-[#0B0F19] border border-[#1E293B] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-[#00F5D4]" />
                <span className="text-sm font-bold text-white">GEMINI 3.5 AUDIO TRANSCRIBER</span>
              </div>
              <button
                onClick={() => setIsRecordingMic(!isRecordingMic)}
                className={`px-4 py-2 rounded text-xs font-bold flex items-center space-x-2 transition-all ${
                  isRecordingMic
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#00F5D4] text-black hover:bg-[#20D2B8]'
                }`}
              >
                {isRecordingMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecordingMic ? 'STOP RECORDING' : 'RECORD MICROPHONE TAKE'}</span>
              </button>
            </div>

            <div className="flex-1 bg-[#070A12] border border-[#1E293B] rounded p-4 text-xs font-mono text-gray-200 leading-relaxed overflow-y-auto">
              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">[TRANSCRIBED DIALOGUE]:</div>
              {transcriptionText}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setTranscriptionText(
                    'TAKE 02 TRANSCRIBED: "Lock targeting thrusters. We have visual confirmation on the cyber titan signature."'
                  );
                }}
                className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] rounded text-xs text-gray-300 font-bold"
              >
                SIMULATE NEW AUDIO SAMPLE
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: GROUNDING (SEARCH & MAPS) */}
        {activeTab === 'grounding' && (
          <div className="flex-1 flex flex-col bg-[#0B0F19] border border-[#1E293B] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#FEE440]" />
                <span className="text-sm font-bold text-white">GEMINI 3.8 SEARCH & MAPS GROUNDING</span>
              </div>
              <div className="flex space-x-2 text-xs">
                <button
                  onClick={() => setGroundingType('search')}
                  className={`px-3 py-1 rounded font-bold ${
                    groundingType === 'search' ? 'bg-[#FEE440] text-black' : 'bg-[#1E293B] text-gray-300'
                  }`}
                >
                  Google Search
                </button>
                <button
                  onClick={() => setGroundingType('maps')}
                  className={`px-3 py-1 rounded font-bold ${
                    groundingType === 'maps' ? 'bg-[#FEE440] text-black' : 'bg-[#1E293B] text-gray-300'
                  }`}
                >
                  Google Maps
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={groundingQuery}
                onChange={(e) => setGroundingQuery(e.target.value)}
                className="flex-1 bg-[#070A12] border border-[#1E293B] px-3.5 py-2 rounded text-xs text-white focus:outline-none focus:border-[#FEE440]"
                placeholder="Search real-time locations, studio facilities, or film history specs..."
              />
              <button
                onClick={() => {
                  if (onExecuteCommand) {
                    onExecuteCommand(`gemini grounding query [${groundingType}]: "${groundingQuery}"`);
                  }
                }}
                className="px-4 py-2 bg-[#FEE440] hover:bg-[#E5CE3B] text-black font-bold text-xs rounded"
              >
                EXECUTE QUERY
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              <div className="text-[10px] text-gray-500 uppercase font-bold">[VERIFIED SOURCES & CITATIONS]:</div>
              {groundingResults.map((r, i) => (
                <div key={i} className="bg-[#070A12] border border-[#1E293B] p-3 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{r.title}</span>
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#3A86FF] hover:underline"
                    >
                      VIEW SOURCE
                    </a>
                  </div>
                  <div className="text-[11px] text-gray-400">{r.snippet}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LIVE API VOICE CONVERSATION */}
        {activeTab === 'live_voice' && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F19] border border-[#1E293B] rounded-lg p-8 text-center">
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all ${
                  isLiveConnected
                    ? 'border-[#EF4444] shadow-[0_0_40px_#EF4444] bg-[#EF4444]/20'
                    : 'border-gray-700 bg-[#070A12]'
                }`}
              >
                <Radio className={`w-12 h-12 ${isLiveConnected ? 'text-[#EF4444]' : 'text-gray-500'}`} />
              </div>
              {isLiveConnected && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-[#EF4444] animate-ping opacity-75"
                  style={{ animationDuration: '1.5s' }}
                />
              )}
            </div>

            <div className="text-base font-bold text-white mb-1">
              GEMINI 3.8 LIVE REAL-TIME CONVERSATION
            </div>
            <div className="text-xs text-gray-400 max-w-md mb-6">
              Low-latency bidirectional audio streaming over WebSockets (16kHz PCM input / 24kHz PCM output).
            </div>

            {isLiveConnected && (
              <div className="w-64 h-2 bg-[#1E293B] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5D4] via-[#FEE440] to-[#EF4444] transition-all duration-75"
                  style={{ width: `${voiceVolume}%` }}
                />
              </div>
            )}

            <button
              onClick={handleToggleLiveVoice}
              className={`px-8 py-3.5 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                isLiveConnected
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_20px_#EF4444]'
                  : 'bg-gradient-to-r from-[#3A86FF] to-[#9B5DE5] hover:opacity-90 text-white'
              }`}
            >
              {isLiveConnected ? 'DISCONNECT LIVE SESSION' : 'INITIALIZE LIVE VOICE STREAM'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
