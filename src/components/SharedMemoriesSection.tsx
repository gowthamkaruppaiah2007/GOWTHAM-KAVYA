import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, Memory } from '@/lib/supabase';
import { BookOpen, PlusCircle, Heart, Sparkles, Calendar, User, Trash2, Send, Lock, Search } from 'lucide-react';
import { toast } from 'sonner';

export const SharedMemoriesSection: React.FC = () => {
  const { user, partner, setLoginModalOpen } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error);
        toast.error('Failed to load shared memories');
      } else {
        setMemories(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();

    const channel = supabase
      .channel('public:memories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memories' },
        (payload) => {
          const newMem = payload.new as Memory;
          setMemories((prev) => [newMem, ...prev.filter((m) => m.id !== newMem.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'memories' },
        (payload) => {
          setMemories((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    const newMemoryData: Memory = {
      author_id: user.id,
      author_name: user.name,
      title: title.trim() || 'A Sweet Memory',
      content: content.trim(),
    };

    const { data, error } = await supabase
      .from('memories')
      .insert([newMemoryData])
      .select();

    setSubmitting(false);

    if (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to save memory. Please try again.');
    } else {
      toast.success('Memory saved forever in database ❤️');
      setTitle('');
      setContent('');
      setIsFormOpen(false);
      if (data && data.length > 0) {
        setMemories((prev) => [data[0], ...prev]);
      }
    }
  };

  const handleDeleteMemory = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this memory?')) return;

    const { error } = await supabase.from('memories').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete memory');
    } else {
      toast.success('Memory removed');
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const filteredMemories = memories.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      (m.title && m.title.toLowerCase().includes(q)) ||
      m.author_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center relative py-8 px-4 bg-gradient-to-r from-rose-500/10 via-primary/10 to-pink-500/10 rounded-3xl border border-primary/20 shadow-sm overflow-hidden">
        <div className="absolute top-2 left-4 text-primary/20 animate-float-heart">
          <Heart size={40} fill="currentColor" />
        </div>
        <div className="absolute bottom-2 right-4 text-primary/20 animate-float-heart" style={{ animationDelay: '1.5s' }}>
          <Heart size={30} fill="currentColor" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
          <Sparkles size={14} /> Shared Forever in Database
        </span>
        <h2 className="text-3xl md:text-5xl font-serif text-foreground font-bold">Our Text Memories</h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mt-2">
          A timeless journal where Gowtham k and Kavya write down thoughts, moments, and special stories to treasure anytime.
        </p>

        {user ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-md transition-all hover:scale-105 flex items-center gap-2 text-sm"
            >
              <PlusCircle size={18} />
              <span>{isFormOpen ? 'Close Writer' : 'Write New Memory'}</span>
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-rose-600 text-white font-semibold rounded-full shadow-md hover:scale-105 transition-all flex items-center gap-2 text-sm mx-auto"
            >
              <Lock size={16} />
              <span>Login as Gowtham or Kavya to Write Memories</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Memory Form */}
      {isFormOpen && user && (
        <form
          onSubmit={handleAddMemory}
          className="bg-card border border-primary/30 rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in-up backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="text-primary" size={20} />
              Write a Memory as {user.name}
            </h3>
            <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
              Author: {user.name}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Title / Headline (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our First Trip, Late Night Talks..."
              className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Your Memory Story *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write down the details of this beautiful memory..."
              className="w-full bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
            >
              <Send size={16} />
              <span>{submitting ? 'Saving...' : 'Save Memory'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card/70 border border-border/80 rounded-2xl p-2 px-4 shadow-sm">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search through saved memories..."
          className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {/* Memories Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="animate-spin text-primary mx-auto mb-2" size={28} />
          <p className="text-sm">Fetching memories from database...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-16 bg-card/40 border border-dashed border-border rounded-3xl p-8">
          <BookOpen size={48} className="text-primary/40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-foreground">No Memories Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            {searchQuery ? 'No memory matched your search.' : 'No text memories have been created yet. Click "Write New Memory" to start!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMemories.map((mem) => {
            const isAuthorMe = user && mem.author_id === user.id;
            const dateStr = mem.created_at
              ? new Date(mem.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Special Moment';

            return (
              <div
                key={mem.id}
                className="group relative bg-card border border-primary/15 hover:border-primary/40 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Memory Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${mem.author_name.includes('Gowtham') ? 'from-rose-500 to-red-600' : 'from-pink-500 to-purple-600'} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
                        {mem.author_name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {mem.author_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar size={11} /> {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-rose-500 fill-rose-500/20 group-hover:fill-rose-500 transition-colors" />
                      {user && (isAuthorMe || user.id === '9626652426' || user.id === '7845760300') && (
                        <button
                          onClick={() => handleDeleteMemory(mem.id)}
                          title="Delete memory"
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 rounded-full transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Body */}
                  {mem.title && (
                    <h3 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {mem.title}
                    </h3>
                  )}

                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {mem.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="italic font-serif text-primary/80">❤️ Shared Love Memory</span>
                  <span className="font-mono text-[10px] opacity-60">Database ID: #{mem.id?.slice(0, 6)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
