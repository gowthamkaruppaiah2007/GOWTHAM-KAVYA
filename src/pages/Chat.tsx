import React from 'react';
import Navbar from '@/components/Navbar';
import FloatingHearts from '@/components/FloatingHearts';
import MusicPlayer from '@/components/MusicPlayer';
import { ChatSection } from '@/components/ChatSection';
import Footer from '@/components/Footer';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col pt-20">
      <Navbar />
      <FloatingHearts />
      <MusicPlayer />
      <main className="flex-1 py-6">
        <ChatSection />
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
