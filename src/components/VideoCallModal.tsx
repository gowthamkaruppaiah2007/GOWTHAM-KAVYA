import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, Heart } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onEndCall: () => void;
  isAudioOnly: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  partnerName: string;
  partnerAvatar: string;
  isMicMuted: boolean;
  isCameraOff: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  callDuration: number;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onEndCall,
  isAudioOnly,
  localStream,
  remoteStream,
  partnerName,
  partnerAvatar,
  isMicMuted,
  isCameraOff,
  toggleMic,
  toggleCamera,
  callDuration,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isOpen]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between p-4 md:p-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 text-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 font-bold flex items-center justify-center text-sm shadow-md">
            {partnerAvatar}
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              {partnerName} <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse" />
            </h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {isAudioOnly ? 'Audio Call' : 'HD Video Call'} • {formatTime(callDuration)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Main Video View Container */}
      <div className="relative w-full max-w-4xl flex-1 my-4 bg-gray-900/80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
        {/* Remote Video / Audio Avatar */}
        {remoteStream && !isAudioOnly ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-6">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-rose-500 via-primary to-pink-600 text-white text-4xl md:text-5xl font-bold flex items-center justify-center shadow-2xl animate-pulse">
                {partnerAvatar}
              </div>
              <div className="absolute -bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-gray-900 flex items-center justify-center text-white">
                <Heart size={14} fill="currentColor" />
              </div>
            </div>
            <h2 className="text-2xl font-serif text-white font-bold">{partnerName}</h2>
            <p className="text-sm text-white/60 mt-1">
              {remoteStream ? 'Connected' : 'Connecting video stream...'}
            </p>
          </div>
        )}

        {/* Local Self-Preview Floating Window */}
        {!isAudioOnly && (
          <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-black/80 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl group">
            {localStream && !isCameraOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white/60 text-xs">
                <VideoOff size={18} className="mb-1" />
                <span>Camera Off</span>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white/80">
              You
            </div>
          </div>
        )}
      </div>

      {/* Control Action Toolbar */}
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-full border border-white/15 shadow-2xl z-10">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${
            isMicMuted
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {!isAudioOnly && (
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all ${
              isCameraOff
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
        )}

        <button
          onClick={onEndCall}
          className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center px-6 gap-2"
          title="End Call"
        >
          <PhoneOff size={24} />
          <span className="font-bold text-sm hidden md:inline">End Call</span>
        </button>
      </div>
    </div>
  );
};
