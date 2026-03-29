"use client";

import React from 'react';
import BottomBar from '@/components/common/BottomBar';
import SearchBar from '@/components/common/SearchBar';
import { Construction } from 'lucide-react';

export default function HomeListPage() {
  return (
    <div className="relative w-full min-h-screen bg-slate-50 flex flex-col pt-24 pb-36 px-5">
      
      {/* Search Header */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-black rounded-b-[40px] z-10 shadow-lg">
         <SearchBar />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
        <div className="w-24 h-24 bg-orange-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner pointer-events-none">
           <Construction className="w-12 h-12 text-[#FF6A3D]" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">List Mode is Building</h1>
        <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mb-8">
          The classic scrolling grid is currently being wired to the new database API. Please use the immersive Video Reels mode for now!
        </p>
      </div>

      <BottomBar location="📍 Coimbatore" viewMode="list" />
    </div>
  );
}
