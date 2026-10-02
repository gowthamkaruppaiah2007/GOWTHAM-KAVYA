import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="py-12 px-6 bg-background text-center">
    <p className="font-cursive text-primary text-2xl mb-2">
      Made with <Heart className="inline text-love-red animate-pulse-heart" size={18} fill="currentColor" /> by Gowtham
    </p>
    <p className="text-muted-foreground text-sm font-body">
      For my bujikubujiku
    </p>
  </footer>
);

export default Footer;
