import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import FloatingHearts from '@/components/FloatingHearts';
import { Lock, Phone, Heart, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [idOrPhone, setIdOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />

      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 text-primary/10 pointer-events-none">
        <Heart size={160} fill="currentColor" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-card/90 border border-primary/20 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 backdrop-blur-md animate-fade-in-up">
        {/* Private Access Portal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-primary mb-3 shadow-inner">
            <Heart className="animate-pulse-heart" size={36} fill="currentColor" />
          </div>
          <h1 className="font-cursive text-4xl text-primary font-bold">Kavya & Gowtham</h1>
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
            className="w-full py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <UserCheck size={18} />
            <span>Unlock Access</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
