import { useEffect, useState } from "react";
import { Heart, CheckCircle2, Hourglass, Calendar, Sparkles } from "lucide-react";

const getTimeLeft = () => {
  const now = new Date();
  const valentine = new Date(now.getFullYear(), 1, 14); // Feb 14
  if (now > valentine) valentine.setFullYear(valentine.getFullYear() + 1);
  const diff = valentine.getTime() - now.getTime();
  return {
    targetYear: valentine.getFullYear(),
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountdownTimer = () => {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <section className="py-24 px-6 bg-card relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center reveal">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 shadow-sm">
          <Sparkles size={16} />
          <span>Valentine's Day Counter: #2</span>
          <Heart size={14} fill="currentColor" className="text-love-red animate-pulse-heart" />
        </div>

        <p className="font-cursive text-primary text-3xl md:text-4xl mb-2">
          Counting Every Single Second
        </p>
        <h2 className="font-serif-display text-3xl md:text-5xl font-bold text-foreground mb-4">
          Countdown to Our 2nd Valentine's Day
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-12 font-body">
          1st Valentine's Day is officially in our memory album! Here's to our <strong>2nd Valentine's Day</strong> together ❤️
        </p>

        {/* Timer Boxes */}
        <div className="flex justify-center gap-3 sm:gap-6 md:gap-8 mb-16">
          {units.map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl bg-background border border-primary/20 shadow-md flex items-center justify-center mb-3 relative group hover:border-primary transition-colors">
                <span className="font-serif-display text-3xl sm:text-4xl md:text-6xl font-bold text-primary">
                  {String(unit.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-muted-foreground text-xs md:text-sm font-body uppercase tracking-widest font-semibold">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Milestone Tracker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
          {/* Milestone 1 */}
          <div className="bg-background/80 border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-display font-bold text-foreground text-lg">1st Valentine's Day</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">Completed 🎉</span>
              </div>
              <p className="text-sm text-muted-foreground font-body">Our sweet first milestone stored forever in our hearts ❤️</p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="bg-background/80 border border-primary/40 rounded-2xl p-5 flex items-center gap-4 shadow-md ring-2 ring-primary/20">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Hourglass size={24} className="animate-spin" style={{ animationDuration: "6s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-display font-bold text-foreground text-lg">2nd Valentine's Day</span>
                <span className="text-xs bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full">Current Target ⏳</span>
              </div>
              <p className="text-sm text-muted-foreground font-body">Feb 14, {time.targetYear} — Preparing for more magical memories!</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CountdownTimer;
