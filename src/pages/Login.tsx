import React, { useState } from 'react';
import { useAuth, PROFILES } from '@/context/AuthContext';
import FloatingHearts from '@/components/FloatingHearts';
import { Lock, Phone, Heart, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('9626652426');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />

      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 text-primary/10 pointer-events-none">
        <Heart size={160} fill="currentColor" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-card/90 border border-primary/20 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 backdrop-blur-md animate-fade-in-up">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-3 shadow-inner">
            <Heart className="animate-pulse-heart" size={36} fill="currentColor" />
          </div>
          <h1 className="font-cursive text-4xl text-primary font-bold">Kavya & Gowtham</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
            Private Access Portal
          </p>
        </div>

        {/* Profile Selector */}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-center">
          Select Profile to Login:
        </p>
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
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/15 shadow-md scale-[1.02]'
                    : 'border-border bg-background/60 hover:bg-muted/60 opacity-80'
                }`}
              >
                <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${profile.color} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
                  {profile.avatar}
                </div>
                <span className="font-bold text-sm text-foreground">{profile.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{profile.phone}</span>
              </button>
            );
          })}
        </div>

        {/* Credentials Form */}
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
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
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
                placeholder={`Password for ${selectedProfileId === '9626652426' ? 'Gowtham k' : 'Kavya'}`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <UserCheck size={18} />
            <span>Unlock Website</span>
          </button>
        </form>

        {/* Quick One-Click Access */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-2">Quick One-Click Login:</p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleQuickLogin('9626652426')}
              className="px-3.5 py-1.5 text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1 font-semibold"
            >
              <Sparkles size={13} /> Login as Gowtham k
            </button>
            <button
              onClick={() => handleQuickLogin('7845760300')}
              className="px-3.5 py-1.5 text-xs bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border border-pink-500/30 rounded-lg transition-colors flex items-center gap-1 font-semibold"
            >
              <Sparkles size={13} /> Login as Kavya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
