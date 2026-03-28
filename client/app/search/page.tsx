"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex-1 relative">
          <input 
            autoFocus
            type="text" 
            placeholder="Search matching homes..." 
            className="w-full bg-slate-100 placeholder:text-slate-400 text-slate-900 font-semibold tracking-tight text-[15px] px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white border text-sm transition-all focus:border-[#FF6A3D]"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">No recent searches</h2>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-[250px]">
          Type an area, budget, or preferred amenities to start discovering your nest.
        </p>
      </main>
    </div>
  );
}
