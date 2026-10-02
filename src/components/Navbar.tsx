import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Image, Home, MessageCircle, BookOpen, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Photos", path: "/photos", icon: Image },
    { label: "Our Chat", path: "/chat", icon: MessageCircle, badge: true },
    { label: "Memories", path: "/memories", icon: BookOpen },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 py-2.5 px-4 md:px-6 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 group shrink-0">
          <Heart className="text-primary group-hover:scale-110 transition-transform animate-pulse-heart" size={20} fill="currentColor" />
          <span className="font-cursive text-xl md:text-2xl text-primary font-bold tracking-wide">
            Kavya & Gowtham
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
              </Link>
            );
          })}
        </div>

        {/* Right Header Area (User Profile + Mobile Toggle) */}
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <div className="flex items-center gap-2 bg-card border border-primary/20 rounded-full pl-2 pr-3 py-1 shadow-sm">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${user.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                {user.avatar}
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:inline">{user.name}</span>
              <button
                onClick={logout}
                title="Logout"
                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 px-2 border-t border-border/40 mt-2 flex flex-col gap-1.5 animate-fade-in-up">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
