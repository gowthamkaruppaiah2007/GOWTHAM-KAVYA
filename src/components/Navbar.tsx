import { Link, useLocation } from "react-router-dom";
import { Heart, Image, Home, Sparkles, MessageCircle, BookOpen, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout, setLoginModalOpen } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/50 py-3 px-4 md:px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <Heart className="text-primary group-hover:scale-110 transition-transform animate-pulse-heart" size={22} fill="currentColor" />
          <span className="font-cursive text-xl md:text-2xl text-primary font-bold">Kavya & Gowtham</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 md:gap-3 overflow-x-auto py-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Home size={15} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            to="/photos"
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
              location.pathname === "/photos"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Image size={15} />
            <span className="hidden sm:inline">Photos</span>
          </Link>

          <Link
            to="/chat"
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all relative ${
              location.pathname === "/chat"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <MessageCircle size={15} />
            <span>Our Chat</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </Link>

          <Link
            to="/memories"
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
              location.pathname === "/memories"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <BookOpen size={15} />
            <span>Memories</span>
          </Link>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 bg-card border border-primary/20 rounded-full pl-2 pr-3 py-1 shadow-sm">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${user.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                {user.avatar}
              </div>
              <span className="text-xs font-semibold text-foreground hidden md:inline">{user.name}</span>
              <button
                onClick={logout}
                title="Logout"
                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-primary to-rose-600 text-white rounded-full text-xs md:text-sm font-semibold shadow-md hover:scale-105 transition-all"
            >
              <LogIn size={15} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
