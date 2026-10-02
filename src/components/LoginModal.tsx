import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Phone, Heart, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login, user } = useAuth();
  const [idOrPhone, setIdOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrPhone.trim() || !password.trim()) return;

    setLoading(true);
    const res = login(idOrPhone, password);
    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      setPassword('');
      setIdOrPhone('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in-up">
      <div className="relative w-full max-w-md bg-card/95 border border-primary/20 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
        {/* Close Button */}
        {user && (
          <button
            onClick={() => setLoginModalOpen(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Private Access Portal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Heart className="animate-pulse-heart" size={30} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-serif text-foreground font-bold">Kavya & Gowtham</h2>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
            Private Access Portal
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              User ID / Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={idOrPhone}
                onChange={(e) => setIdOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                placeholder="Enter User ID or Phone"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Enter Password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !idOrPhone.trim() || !password.trim()}
            className="w-full py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <UserCheck size={18} />
            <span>Unlock Access</span>
          </button>
        </form>
      </div>
    </div>
  );
};
