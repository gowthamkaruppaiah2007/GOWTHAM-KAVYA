import { Link, useLocation } from "react-router-dom";
import { Heart, Image, Home, Sparkles } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 py-3 px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="text-primary group-hover:scale-110 transition-transform animate-pulse-heart" size={22} fill="currentColor" />
          <span className="font-cursive text-2xl text-primary font-bold">Kavya & Gowtham</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Home size={16} />
            <span>Home</span>
          </Link>

          <Link
            to="/photos"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              location.pathname === "/photos"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Image size={16} />
            <span>Photos & Videos</span>
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
