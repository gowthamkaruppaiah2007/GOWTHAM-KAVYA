import React from 'react';
import Navbar from '@/components/Navbar';
import FloatingHearts from '@/components/FloatingHearts';
import MusicPlayer from '@/components/MusicPlayer';
import { SharedMemoriesSection } from '@/components/SharedMemoriesSection';
import Footer from '@/components/Footer';

const MemoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col pt-20">
      <Navbar />
      <FloatingHearts />
      <MusicPlayer />
      <main className="flex-1 py-6">
        <SharedMemoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default MemoriesPage;
