"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Search } from 'lucide-react';

export default function LocationSelector() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  
  // Mock districts
  const districts = [
    'Coimbatore',
    'Chennai',
    'Bangalore',
    'Kochi',
    'Trivandrum',
    'Hyderabad'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-5 py-5 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <span className="font-extrabold text-xl tracking-tight text-slate-900">Select Location</span>
      </header>

      <div className="p-5 flex-1 max-w-md mx-auto w-full">
        {/* Search */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6A3D] transition-colors" />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your district..." 
            className="w-full pl-14 pr-5 py-4 rounded-3xl bg-white border border-slate-200 outline-none text-slate-900 shadow-sm focus:shadow-md focus:border-[#FF6A3D] transition-all text-sm font-semibold placeholder:font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Current Location auto-detect banner */}
        <button 
          onClick={() => router.back()}
          className="w-full flex items-center gap-3 p-4 bg-orange-50/50 border border-orange-100 rounded-3xl mb-6 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
             <MapPin className="w-5 h-5 text-[#FF6A3D]" />
          </div>
          <div className="flex-1">
             <h4 className="text-slate-900 font-bold text-sm">Use Current Location</h4>
             <p className="text-slate-500 text-xs mt-0.5">Enable GPS for precision</p>
          </div>
        </button>

        {/* List */}
        <div>
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3 ml-2">Popular Districts</h3>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {districts.filter(d => d.toLowerCase().includes(search.toLowerCase())).map((district, index) => (
              <button 
                key={district}
                onClick={() => router.back()}
                className={`w-full text-left p-4 font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-3 ${index !== districts.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                   <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                {district}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
