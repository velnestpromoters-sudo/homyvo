"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft as ArrowLeftLucide, Search as SearchLucide, SlidersHorizontal, TrendingUp, MapPin } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { parseSearch } from '@/utils/parseSearch';
import { PropertyCard } from '@/components/property/PropertyCard';

export default function SearchPage() {
  const router = useRouter();
  const { setLocation, locationName, coordinates } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Debounced Intent Engine
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const parsed = parseSearch(searchQuery) as any;
        
        let targetLat = coordinates?.lat || null;
        let targetLng = coordinates?.lng || null;

        // Smart Default: If no location explicitly found in text, use current context if available
        if (!parsed.locationText && locationName && locationName !== 'Detecting...') {
            parsed.locationText = locationName.replace('📍 ', '').split(',')[0].toLowerCase();
        }

        // 1. Resolve Explicit Named Locations to Lat/Lng Anchor Point
        if (parsed.locationText && typeof parsed.locationText === 'string') {
            try {
                const geoRes = await fetch(`/api/search?q=${encodeURIComponent(parsed.locationText)}`);
                const geoData = await geoRes.json();
                if (geoData.success && geoData.features && geoData.features.length > 0) {
                    const [geoLng, geoLat] = geoData.features[0].geometry.coordinates;
                    parsed.lat = geoLat;
                    parsed.lng = geoLng;
                }
            } catch(e) { console.warn("Forward geocoding failed", e); }
        }

        // 2. Hardware GPS Fallback for exact proximity if location hasn't been explicitly anchored yet
        if (!parsed.locationText && (parsed.useGeo || parsed.radius || (targetLat && targetLng)) && !parsed.lat) {
           parsed.lat = targetLat;
           parsed.lng = targetLng;
        }
        
        // Final sanity check for distances ensuring we have a $near fallback parameter dynamically injected
        if (parsed.lat && parsed.lng && !parsed.radius) {
            parsed.radius = 8;
        }

        let fallBackParamStr = searchQuery.trim();
        if (parsed.useGeo && !parsed.locationText) {
             fallBackParamStr = ""; // Strip "near me" noise entirely
        }
        
        // Clean out nulls and booleans before sending, map parsed location isolating tanglish noise explicitly
        const cleanParams: Record<string, any> = { queryText: parsed.locationText || fallBackParamStr };
        Object.entries(parsed).forEach(([key, value]) => {
             if (value !== null && value !== false && value !== undefined) {
                 if (typeof value === 'object' && !Array.isArray(value)) {
                     // Exclude maps
                     cleanParams[key] = JSON.stringify(value);
                 } else if (Array.isArray(value)) {
                     // Arrays -> Comma strings
                     cleanParams[key] = value.join(',');
                 } else {
                     cleanParams[key] = String(value);
                 }
             }
        });
        
        const params = new URLSearchParams(cleanParams).toString();
        const res = await fetch(`/api/properties/search?${params}&_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Search Engine Failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, locationName]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Header & Smart Search Input */}
      <header className="px-3 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center gap-2">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftLucide className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex-1 relative flex items-center">
          <input 
            autoFocus
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "boys pg under 6000 near peelamedu"' 
            className="w-full bg-slate-100 placeholder:text-slate-400 text-slate-900 font-bold tracking-tight text-[14px] pl-5 pr-12 py-3 rounded-full outline-none focus:ring-2 focus:ring-[#801786]/20 focus:bg-white border border-transparent focus:border-[#801786] transition-all shadow-inner"
          />
          <div className="absolute right-4 pointer-events-none">
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-[#801786] rounded-full animate-spin"></div>
            ) : (
                <SearchLucide className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </header>

      {/* Main Engine Results */}
      <main className="flex-1 bg-slate-50 overflow-y-auto">
        
        {/* Dynamic Display */}
        {searchQuery.trim() ? (
           <div className="p-4 space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {searchResults.length} Results Found
                 </h2>
                 <p className="text-xs text-red-500 font-mono">DEBUG: {searchQuery}</p>
                 <button className="flex items-center gap-1.5 text-xs font-bold text-[#801786] bg-[#801786]/10 px-3 py-1.5 rounded-full">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                 </button>
              </div>

              {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {searchResults.map((item) => (
                       <PropertyCard 
                          key={item._id}
                          id={item._id}
                          image={item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                          rent={item.rent}
                          location={`${item.location?.area || 'Area'}, ${item.location?.city || 'City'}`}
                          matchScore={item.matchScore > 0 ? item.matchScore : undefined}
                          moveInStatus={item.moveInReady ? 'Move-in Ready' : undefined}
                       />
                    ))}
                 </div>
              ) : (
                 !isSearching && (
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center mt-6">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <SearchLucide className="w-8 h-8 text-slate-300" />
                       </div>
                       <h3 className="text-slate-800 font-extrabold text-lg mb-1">No exact matches found</h3>
                       <p className="text-slate-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                          Try simplifying your search. For example, instead of 'beautiful single room', try <b>'1bhk'</b>.
                       </p>
                    </div>
                 )
              )}
           </div>
        ) : (
           <div className="p-5">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-[#801786] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Recommended Searches
              </h2>
              <div className="flex flex-wrap gap-2.5">
                 {['Boys PG under 6000', '1BHK near Peelamedu', 'Family house below 15000', 'Girls Hostel with Wifi'].map((suggestion, idx) => (
                    <button 
                       key={idx}
                       onClick={() => setSearchQuery(suggestion)}
                       className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm active:scale-95 text-left"
                    >
                       {suggestion}
                    </button>
                 ))}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}
