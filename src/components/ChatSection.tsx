import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, ChatMessage } from '@/lib/supabase';
import { ICE_SERVERS, ringtoneService } from '@/lib/webrtc';
import { VideoCallModal } from '@/components/VideoCallModal';
import { IncomingCallModal } from '@/components/IncomingCallModal';
import { Send, Heart, MessageCircle, RefreshCw, Lock, Video, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const ChatSection: React.FC = () => {
  const { user, partner, setLoginModalOpen } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebRTC Call States
  const [callState, setCallState] = useState<'idle' | 'calling' | 'receiving' | 'in-call'>('idle');
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callChannelRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const pendingOfferRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const chatChannel = supabase
      .channel('public:chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          const newChat = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newChat.id)) return prev;
            return [...prev, newChat];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('call_room', {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'call-invite' }, async ({ payload }) => {
        if (payload.targetId === user.id) {
          setCallState('receiving');
          setIsAudioOnly(payload.audioOnly);
          pendingOfferRef.current = payload.offer;
          ringtoneService.startRingtone();
        }
      })
      .on('broadcast', { event: 'call-accept' }, async ({ payload }) => {
        if (payload.targetId === user.id && peerConnectionRef.current) {
          ringtoneService.stopRingtone();
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
          setCallState('in-call');
          startTimer();
        }
      })
      .on('broadcast', { event: 'call-decline' }, ({ payload }) => {
        if (payload.targetId === user.id) {
          ringtoneService.stopRingtone();
          toast.info('Call declined');
          endCallTeardown();
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.targetId === user.id && peerConnectionRef.current && payload.candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error('Error adding ICE candidate', e);
          }
        }
      })
      .on('broadcast', { event: 'end-call' }, ({ payload }) => {
        if (payload.targetId === user.id) {
          toast.info('Call ended');
          endCallTeardown();
        }
      })
      .subscribe();

    callChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const startTimer = () => {
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);
  };

  const createPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && partner && callChannelRef.current) {
        callChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { targetId: partner.id, candidate: event.candidate },
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (audioOnly: boolean) => {
    if (!partner || !user) return;

    try {
      setIsAudioOnly(audioOnly);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !audioOnly,
        audio: true,
      });

      setLocalStream(stream);
      setCallState('calling');
      ringtoneService.startRingtone();

      const pc = createPeerConnection(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      callChannelRef.current?.send({
        type: 'broadcast',
        event: 'call-invite',
        payload: {
          callerId: user.id,
          targetId: partner.id,
          audioOnly,
          offer,
        },
      });

      toast.info(`Calling ${partner.name}...`);
    } catch (err) {
      console.error('Error starting call:', err);
      toast.error('Could not access camera/microphone. Please allow browser permissions.');
      endCallTeardown();
    }
  };

  const acceptCall = async () => {
    if (!partner || !user || !pendingOfferRef.current) return;
    ringtoneService.stopRingtone();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isAudioOnly,
        audio: true,
      });

      setLocalStream(stream);
      const pc = createPeerConnection(stream);
      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      callChannelRef.current?.send({
        type: 'broadcast',
        event: 'call-accept',
        payload: {
          targetId: partner.id,
          answer,
        },
      });

      setCallState('in-call');
      startTimer();
    } catch (err) {
      console.error('Error accepting call:', err);
      toast.error('Could not access camera/microphone');
      declineCall();
    }
  };

  const declineCall = () => {
    ringtoneService.stopRingtone();
    if (partner) {
      callChannelRef.current?.send({
        type: 'broadcast',
        event: 'call-decline',
        payload: { targetId: partner.id },
      });
    }
    endCallTeardown();
  };

  const endCall = () => {
    if (partner) {
      callChannelRef.current?.send({
        type: 'broadcast',
        event: 'end-call',
        payload: { targetId: partner.id },
      });
    }
    endCallTeardown();
  };

  const endCallTeardown = () => {
    ringtoneService.stopRingtone();
    stopTimer();

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    setCallState('idle');
    setIsMicMuted(false);
    setIsCameraOff(false);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !partner) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const chatData: ChatMessage = {
      sender_id: user.id,
      sender_name: user.name,
      receiver_id: partner.id,
      message: messageText,
    };

    const { data, error } = await supabase.from('chats').insert([chatData]).select();
    setSending(false);

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Could not send message.');
      setNewMessage(messageText);
    } else if (data && data.length > 0) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Private Chat</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Log in as Gowtham k or Kavya to chat, call, and view shared text memories.
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Heart size={18} fill="currentColor" />
          <span>Login to Chat</span>
        </button>
      </div>
    );
  }

  const loveEmojis = ['❤️', '💖', '💕', '🥰', '🌹', '✨', '💋', '💍'];

  return (
    <div className="w-full h-full max-w-5xl mx-auto flex flex-col">
      {/* Incoming Call Dialog */}
      <IncomingCallModal
        isOpen={callState === 'receiving'}
        callerName={partner?.name || 'Partner'}
        callerAvatar={partner?.avatar || 'K'}
        isAudioOnly={isAudioOnly}
        onAccept={acceptCall}
        onDecline={declineCall}
      />

      {/* Active Call Modal */}
      <VideoCallModal
        isOpen={callState === 'calling' || callState === 'in-call'}
        onEndCall={endCall}
        isAudioOnly={isAudioOnly}
        localStream={localStream}
        remoteStream={remoteStream}
        partnerName={partner?.name || 'Partner'}
        partnerAvatar={partner?.avatar || 'K'}
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
        callDuration={callDuration}
      />

      {/* Full Viewport Height Mobile & Desktop Chat Container */}
      <div className="bg-card/95 border border-primary/20 md:rounded-3xl shadow-xl overflow-hidden backdrop-blur-md flex flex-col flex-1 h-full">
        {/* Responsive Mobile Chat Header */}
        <div className="bg-gradient-to-r from-rose-500/10 via-primary/10 to-pink-500/10 p-3 md:p-4 border-b border-border/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr ${user.color} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-foreground text-sm md:text-base leading-tight">{user.name}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] md:text-xs text-muted-foreground flex items-center gap-1">
                Chatting with <span className="font-semibold text-foreground">{partner?.name}</span> <Heart size={11} className="text-rose-500 fill-rose-500 inline" />
              </p>
            </div>
          </div>

          {/* Touch-Friendly Action Icons & Call Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => startCall(true)}
              title="Voice Call"
              className="p-2 md:p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-full border border-emerald-500/30 transition-all active:scale-95 flex items-center justify-center"
            >
              <Phone size={17} />
            </button>

            <button
              onClick={() => startCall(false)}
              title="Video Call"
              className="p-2 md:p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-full border border-rose-500/30 transition-all active:scale-95 flex items-center justify-center"
            >
              <Video size={17} />
            </button>

            <button
              onClick={fetchMessages}
              title="Refresh messages"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Dynamic Mobile Scrollable Message Log */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto space-y-3 md:space-y-4 bg-background/40">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <RefreshCw size={24} className="animate-spin mb-2 text-primary" />
              <p className="text-sm">Loading love notes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
              <MessageCircle size={44} className="text-primary/40 mb-3" />
              <h4 className="font-serif text-lg font-semibold text-foreground">No messages yet!</h4>
              <p className="text-xs md:text-sm max-w-xs mt-1">
                Be the first to say something sweet or start a video call ❤️
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === user.id;
              const formattedTime = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-end gap-1.5 md:gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr ${partner?.color || 'from-pink-500 to-purple-600'} text-white text-[10px] md:text-xs font-bold flex items-center justify-center shadow-sm shrink-0`}>
                      {partner?.avatar || 'K'}
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl p-3 shadow-sm text-xs md:text-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-primary to-rose-600 text-white rounded-br-none'
                      : 'bg-card border border-border text-foreground rounded-bl-none'
                  }`}>
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className={`text-[10px] md:text-[11px] font-bold ${isMe ? 'text-white/80' : 'text-primary'}`}>
                        {msg.sender_name}
                      </span>
                      <span className={`text-[9px] md:text-[10px] ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {formattedTime}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                  </div>

                  {isMe && (
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr ${user.color} text-white text-[10px] md:text-xs font-bold flex items-center justify-center shadow-sm shrink-0`}>
                      {user.avatar}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Mobile Keyboard Friendly Input Footer */}
        <div className="p-2.5 md:p-4 bg-card border-t border-border/50 shrink-0">
          <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 no-scrollbar">
            {loveEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-base md:text-lg p-1 hover:bg-muted rounded-full transition-transform active:scale-125 shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={() => {
                setIsInputFocused(true);
                setTimeout(scrollToBottom, 150);
              }}
              onBlur={() => setIsInputFocused(false)}
              placeholder={`Write to ${partner?.name}...`}
              className="flex-1 bg-background border border-input rounded-full px-4 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="p-2.5 md:p-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send size={16} className="md:w-4 md:h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
