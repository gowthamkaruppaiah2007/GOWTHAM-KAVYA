import React from 'react';
import { Phone, PhoneOff, Video, Heart } from 'lucide-react';

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar: string;
  isAudioOnly: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callerName,
  callerAvatar,
  isAudioOnly,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
      <div className="relative w-full max-w-sm bg-card border border-primary/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl overflow-hidden">
        {/* Animated Ripple Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full animate-ping pointer-events-none" />

        {/* Avatar */}
        <div className="relative z-10 mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-rose-500 via-primary to-pink-600 text-white text-3xl font-bold flex items-center justify-center shadow-xl mb-4">
          {callerAvatar}
          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-rose-600 text-white">
            <Heart size={16} fill="currentColor" />
          </div>
        </div>

        {/* Info */}
        <h2 className="relative z-10 font-serif text-2xl font-bold text-foreground">
          {callerName}
        </h2>
        <p className="relative z-10 text-sm text-primary font-medium mt-1 flex items-center justify-center gap-1.5">
          {isAudioOnly ? <Phone size={16} /> : <Video size={16} />}
          <span>Incoming {isAudioOnly ? 'Audio' : 'Video'} Call...</span>
        </p>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center justify-center gap-6 mt-8">
          <button
            onClick={onDecline}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Decline Call"
          >
            <PhoneOff size={24} />
          </button>

          <button
            onClick={onAccept}
            className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 animate-bounce"
            title="Accept Call"
          >
            {isAudioOnly ? <Phone size={28} /> : <Video size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};
