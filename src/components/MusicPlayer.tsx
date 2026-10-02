import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.3;
    // Attempt autoplay
    audio.play().catch(() => {
      // Autoplay blocked, user needs to click unmute
    });
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      audio.muted = true;
    }
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio ref={audioRef} loop muted>
        <source src="/audio/love.mp3" type="audio/mpeg" />
      </audio>
      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-gentle-float"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>
    </>
  );
};

export default MusicPlayer;
