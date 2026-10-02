import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import FloatingHearts from "@/components/FloatingHearts";
import MusicPlayer from "@/components/MusicPlayer";
import HeroSection from "@/components/HeroSection";
import LoveStory from "@/components/LoveStory";
import ReasonsILoveYou from "@/components/ReasonsILoveYou";
import MemoriesGallery from "@/components/MemoriesGallery";
import LoveLetter from "@/components/LoveLetter";
import SurprisePopup from "@/components/SurprisePopup";
import CountdownTimer from "@/components/CountdownTimer";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-16 md:pb-0">
      <Navbar />
      <FloatingHearts />
      <MusicPlayer />
      <HeroSection />
      <LoveStory />
      <ReasonsILoveYou />
      <MemoriesGallery />
      <LoveLetter />
      <SurprisePopup />
      <CountdownTimer />
      <Footer />
    </div>
  );
};

export default Index;
