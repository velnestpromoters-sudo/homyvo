"use client";

import React from 'react';
import { Navigation, List, PlaySquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BottomBarProps {
  location: string;
  viewMode: 'reel' | 'list';
}

export default function BottomBar({ location, viewMode }: BottomBarProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        
        {/* Toggle Mode Button */}
        <button 
          onClick={() => {
            if (viewMode === 'reel') router.push('/home'); // Fallback list route wasn't explicitly named but user asked placeholder `/home-list`? Actually user asks to toggle to list mode, fallback `/home-list`
            if (viewMode === 'list') router.push('/home');
            // Assuming current is reel, pushing to /home-list
            if (viewMode === 'reel') router.push('/home-list');
          }}
          className="flex flex-col items-center justify-center p-2 rounded-2xl transition hover:bg-white/10 active:scale-95 text-white/50"
        >
          {viewMode === 'reel' ? (
             <><List className="w-6 h-6 mb-1 text-white" /><span className="text-[10px] font-bold text-white uppercase tracking-wider">Home</span></>
          ) : (
             <><PlaySquare className="w-6 h-6 mb-1 text-white" /><span className="text-[10px] font-bold text-white uppercase tracking-wider">Reels</span></>
          )}
        </button>

        {/* Location Display */}
        <div 
          onClick={() => router.push('/location')}
          className="flex-1 max-w-[160px] mx-4 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full py-3 px-4 shadow-lg active:scale-95 transition-all text-white cursor-pointer min-w-0"
        >
          <Navigation className="w-4 h-4 text-[#ec38b7] fill-[#ec38b7]/20 shrink-0" />
          <span className="font-bold text-sm truncate block">{location || 'Map View'}</span>
        </div>
        
        {/* Decorative Space / Future "Saved" button */}
        <button className="flex flex-col items-center justify-center p-2 rounded-2xl transition hover:bg-white/10 active:scale-95 text-white/50 opacity-0 pointer-events-none">
          <List className="w-6 h-6 mb-1 text-white" /><span className="text-[10px] font-bold text-white uppercase tracking-wider">Saved</span>
        </button>

      </div>
    </div>
  );
}
