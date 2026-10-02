import React, { useState } from 'react';
import { useAuth, PROFILES } from '@/context/AuthContext';
import { Lock, Phone, Heart, Sparkles, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, login, quickLogin, user } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('9626652426');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = login(selectedProfileId, password);
    setLoading(false);
    if (res.success) {
      toast.success(res.message);
      setPassword('');
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickLogin = (id: string) => {
    quickLogin(id);
    const profile = PROFILES.find((p) => p.id === id);
    toast.success(`Logged in as ${profile?.name}`);
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

        {/* Title */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Heart className="animate-pulse-heart" size={30} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-serif text-foreground font-bold">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please log in as Gowtham or Kavya to chat & view memories
          </p>
        </div>

        {/* Profile Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {PROFILES.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setSelectedProfileId(profile.id);
                  setPassword('');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                    : 'border-border bg-background/50 hover:bg-muted/60 opacity-80'
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${profile.color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {profile.avatar}
                </div>
                <span className="font-semibold text-sm text-foreground">{profile.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{profile.phone}</span>
              </button>
            );
          })}
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Phone / ID
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Enter ID or Phone"
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
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={`Password for ${selectedProfileId === '9626652426' ? 'Gowtham' : 'Kavya'}`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <UserCheck size={18} />
            <span>Login to Profile</span>
          </button>
        </form>

        {/* Quick One-Click Login Option */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-2">Quick Access (One Click):</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleQuickLogin('9626652426')}
              className="px-3 py-1.5 text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} /> Login as Gowtham k
            </button>
            <button
              onClick={() => handleQuickLogin('7845760300')}
              className="px-3 py-1.5 text-xs bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-colors flex items-center gap-1 font-medium"
            >
              <Sparkles size={12} /> Login as Kavya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
