import heroBg from "@/assets/hero-bg.jpg";
import { Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 animate-fade-in-up">
        <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-rose-gold/20 border border-rose-gold/40 text-rose-gold text-sm md:text-base font-body tracking-wide backdrop-blur-md">
          ✨ 1st Valentine's Day Completed • 2nd Valentine's Day Loading... ✨
        </div>
        <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground text-glow leading-tight mb-6">
          Our 2nd Valentine's Day Together,
          <br />
          <span className="font-cursive text-5xl md:text-7xl lg:text-8xl text-accent">
            Kavya chello❤️
          </span>
        </h1>
        <p className="font-serif-display text-xl md:text-2xl text-primary-foreground/80 italic mt-4">
          From your <span className="font-cursive text-3xl md:text-4xl text-rose-gold">Gowtham</span>
        </p>
      </div>

      {/* Scroll indicator */}
      <a
        href="#love-story"
        className="absolute bottom-10 z-20 flex flex-col items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
      >
        <Heart className="animate-pulse-heart text-primary" size={28} fill="currentColor" />
        <span className="animate-scroll-bounce text-sm font-body tracking-widest uppercase">
          Scroll Down
        </span>
      </a>
    </section>
  );
};

export default HeroSection;
