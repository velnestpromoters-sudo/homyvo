"use client";

import React from 'react';
import { Navigation, List, PlaySquare, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BottomBarProps {
  location: string;
  viewMode: 'reel' | 'list' | 'wishlist';
}

export default function BottomBar({ location, viewMode }: BottomBarProps) {
  const router = useRouter();

  const isLight = viewMode === 'list';
  const bgClass = isLight 
    ? 'bg-gradient-to-t from-white via-white/95 to-transparent' 
    : 'bg-gradient-to-t from-black via-black/90 to-transparent';

  const textClass = isLight ? 'text-gray-900' : 'text-white';
  const textMutedClass = isLight ? 'text-gray-500' : 'text-white/50';
  const iconBgClass = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10';
  const centerPillClass = isLight 
    ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 text-gray-900'
    : 'bg-black/50 backdrop-blur-md border border-white/10 text-white shadow-lg';

  return (
    <div className={`fixed bottom-0 left-0 right-0 px-5 pt-8 pb-6 ${bgClass} z-40 pointer-events-none`}>
      <div className="flex justify-between items-center max-w-md mx-auto pointer-events-auto">
        
        {/* Toggle Mode Button */}
        <button 
          onClick={() => {
            if (viewMode === 'reel') router.push('/home-list');
            if (viewMode === 'list') router.push('/home');
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-95 ${iconBgClass} ${textMutedClass}`}
        >
          {viewMode === 'reel' ? (
             <><List className={`w-6 h-6 mb-1 ${textClass}`} /><span className={`text-[10px] font-bold uppercase tracking-wider ${textClass}`}>Home</span></>
          ) : (
             <><PlaySquare className={`w-6 h-6 mb-1 ${textClass}`} /><span className={`text-[10px] font-bold uppercase tracking-wider ${textClass}`}>Reels</span></>
          )}
        </button>

        {/* Location Display */}
        <div 
          onClick={() => router.push('/location')}
          className={`flex-1 max-w-[160px] mx-4 flex items-center justify-center gap-1.5 rounded-full py-3 px-4 active:scale-95 transition-all cursor-pointer min-w-0 ${centerPillClass}`}
        >
          <Navigation className="w-4 h-4 text-[#ec38b7] fill-[#ec38b7]/20 shrink-0" />
          <span className="font-bold text-sm truncate block">{location || 'Map View'}</span>
        </div>
        
        {/* Wishlist/Saved Button */}
        <button 
          onClick={() => router.push('/wishlist')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-95 ${iconBgClass}`}
        >
          <Bookmark className={`w-6 h-6 mb-1 ${viewMode === 'wishlist' ? `${textClass} fill-current` : textMutedClass}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${viewMode === 'wishlist' ? textClass : textMutedClass}`}>Saved</span>
        </button>

      </div>
    </div>
  );
}
