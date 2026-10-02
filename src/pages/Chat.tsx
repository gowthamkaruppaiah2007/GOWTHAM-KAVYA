import React from 'react';
import Navbar from '@/components/Navbar';
import FloatingHearts from '@/components/FloatingHearts';
import MusicPlayer from '@/components/MusicPlayer';
import { ChatSection } from '@/components/ChatSection';

const ChatPage: React.FC = () => {
  return (
    <div className="h-[100dvh] w-screen bg-background overflow-hidden flex flex-col pt-16 md:pt-20">
      <Navbar />
      <FloatingHearts />
      <MusicPlayer />
      <main className="flex-1 h-full w-full overflow-hidden p-0 md:p-4">
        <ChatSection />
      </main>
    </div>
  );
};

export default ChatPage;
