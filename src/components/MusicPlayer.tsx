import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";

const MusicPlayer = () => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Autoplay blocked until user interaction
    });
  }, []);

  // Show mute/unmute button ONLY on Home screen ("/")
  if (location.pathname !== "/") {
    return null;
  }

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
        className="fixed bottom-20 md:bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-gentle-float"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>
    </>
  );
};

export default MusicPlayer;
