import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";

const SurprisePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-2xl mx-auto text-center reveal">
        <p className="font-cursive text-primary text-3xl md:text-4xl mb-6">One Last Thing...</p>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-full text-xl font-serif-display font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="group-hover:rotate-12 transition-transform" size={24} />
          Open My Surprise
          <Heart className="animate-pulse-heart" size={24} fill="currentColor" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background rounded-3xl p-10 md:p-14 max-w-lg w-full text-center shadow-2xl animate-fade-in-up border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-6">💝</div>
            <h3 className="font-cursive text-primary text-4xl md:text-5xl mb-6 text-glow-sm">
              bujikubujiku!,
            </h3>
            <p className="font-serif-display text-xl md:text-2xl text-foreground leading-relaxed mb-8">
               ❤️
            </p>
            <p className="text-muted-foreground font-body mb-8">
             I love you soo much thango.
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-serif-display text-lg hover:scale-105 transition-transform shadow-md"
            >
              touch pannu thango! 💕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SurprisePopup;
