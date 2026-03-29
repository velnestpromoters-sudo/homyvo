"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[60%] sm:w-72 z-20">
      <div 
        onClick={() => router.push('/search')}
        className="flex items-center bg-black/40 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 shadow-xl cursor-pointer transition-all active:scale-95"
      >
        <Search className="w-4 h-4 text-white/80 mr-2" />
        <span className="text-white/80 text-sm font-semibold truncate leading-none pt-0.5">
          Find your nest...
        </span>
      </div>
    </div>
  );
}
