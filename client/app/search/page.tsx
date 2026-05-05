"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft as ArrowLeftLucide, Search as SearchLucide, SlidersHorizontal, TrendingUp, Navigation } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { PropertyCard } from '@/components/property/PropertyCard';

export default function SearchPage() {
  const router = useRouter();
  const { setLocation, locationName, coordinates } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // Used for the local results filter now
  const [localFilters, setLocalFilters] = useState({ type: 'all', sort: 'none' });
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('queryText');
        if (q) {
           setSearchQuery(q);
        }
     }
  }, []);

  const filteredResults = React.useMemo(() => {
      let res = [...searchResults];
      if (localFilters.type === 'pg') res = res.filter(r => r.propertyType === 'pg');
      if (localFilters.type === 'apartment') res = res.filter(r => r.propertyType === 'apartment');
      
      if (localFilters.sort === 'price_low') res.sort((a,b) => a.rent - b.rent);
      if (localFilters.sort === 'price_high') res.sort((a,b) => b.rent - a.rent);
      return res;
  }, [searchResults, localFilters]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hardware Tracking Handler
  const handleTargetLocation = () => {
    if (!navigator.geolocation) {
       alert("Geolocation is not supported by your browser.");
       return;
    }
    
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
       (pos) => {
          // Store physical coordinates dynamically protecting against duplicate town names
          setLocation("Validated GPS", { lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSearchQuery("Properties Near Me"); 
       },
       (err) => {
          console.error(err);
          alert("Please enable your device GPS location permissions.");
          setIsSearching(false);
       },
       { enableHighAccuracy: true }
    );
  };

  // Geographic Coordinate Search Hook
  useEffect(() => {
    // Main Debounced Search Hook
    const timer = setTimeout(async () => {
      setIsSearching(true);

      // Instantly clear dropdown if input is entirely wiped natively
      if (!searchQuery.trim()) {
         setSuggestions([]);
         setSearchResults([]);
         setIsSearching(false);
         return;
      }
      try {
        const rawText = searchQuery.toLowerCase();
        
        // Lightweight geographic stripper (removes nouns so Nominatim doesn't fail)
        const cleanForGeo = rawText
            .replace(/\b(pg|boys|girls|rent|house|apartment|bhk|room|flat|villa|mens|womens|in|near|around|for)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        const targetGeo = cleanForGeo || rawText.trim();
        
        let lat = null;
        let lng = null;

        // 1. Hardware Bypass OR Forward Geocode
        if (targetGeo.toLowerCase() === "properties me" || targetGeo.toLowerCase() === "properties near me") {
            // Bypass OSM mapping entirely if the user manually activated the hardware tracker securely
            if (coordinates) {
                lat = coordinates.lat;
                lng = coordinates.lng;
            }
        } else {
            try {
                // 1. Primary: Photon Search (Typo tolerant, Spatial bias)
                let photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(targetGeo)}&limit=5`;
                if (coordinates?.lat && coordinates?.lng) {
                    photonUrl += `&lat=${coordinates.lat}&lon=${coordinates.lng}`;
                }

                let geoData = [];
                try {
                    const photonRes = await fetch(photonUrl);
                    const photonJson = await photonRes.json();
                    if (photonJson.features && photonJson.features.length > 0) {
                        geoData = photonJson.features.map((f: any) => ({
                            lat: f.geometry.coordinates[1],
                            lon: f.geometry.coordinates[0],
                            display_name: [f.properties.name, f.properties.city, f.properties.state].filter(Boolean).join(', ')
                        }));
                    }
                } catch (e) {
                    console.warn("Photon failed, falling back to Nominatim");
                }

                // 2. Fallback: Nominatim (Strict string match)
                if (geoData.length === 0) {
                    let osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetGeo)}&limit=5`;
                    const geoRes = await fetch(osmUrl, { headers: { 'User-Agent': 'bnest-geo-engine' } });
                    geoData = await geoRes.json();
                }

                if (geoData && geoData.length > 0) {
                    lat = geoData[0].lat;
                    lng = geoData[0].lon;
                    
                    // Generate predictive suggestions natively
                    const places = geoData.map((g: any) => {
                        const chunks = (g.display_name || '').split(',');
                        return chunks.slice(0, 3).join(',').trim();
                    }).filter(Boolean);
                    const lowerText = rawText.toLowerCase();
                    const lowerTarget = targetGeo.toLowerCase();
                    let prefix = "";
                    if (lowerText.includes(lowerTarget) && targetGeo.length > 0) {
                       prefix = rawText.substring(0, lowerText.lastIndexOf(lowerTarget));
                    }
                    
                    // Build prediction list eliminating duplicates maximizing tolerance resolution natively
                    const uniquePlaces = Array.from(new Set(places)) as string[];
                    
                    if (prefix.trim() === "" && uniquePlaces.length > 0) {
                        const intents = ["Boys PG near", "Girls PG near", "Family apartments in", "Bachelor allowed near"];
                        let rawPicks: string[] = [];
                        uniquePlaces.slice(0, 2).forEach((place) => {
                            intents.forEach((intent) => rawPicks.push(`${intent} ${place}`));
                        });
                        setSuggestions(rawPicks.slice(0, 8)); // Top 8 smartest matching combos natively generated
                    } else {
                        const newSuggestions = uniquePlaces.slice(0, 10).map((place: string) => `${prefix}${place}`.trim());
                        setSuggestions(newSuggestions);
                    }
                } else {
                    setSuggestions([]);
                }
            } catch (e) { console.warn("OSM Geocoding failed", e); }
        }

        // 2. Transmit strict coords to backend API
        const params = new URLSearchParams();
        params.append('queryText', rawText.trim());
        if (lat && lng) {
            params.append('lat', lat);
            params.append('lng', lng);
            // Engine will natively try 3KM cutoff in backend, falling back to 5KM logic natively.
        }

        const res = await fetch(`/api/properties/search?${params.toString()}&_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (err) {
        console.error("Geographic Search Engine Failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 700); // 700ms debounce (slightly longer to protect OSM rates)

    return () => clearTimeout(timer);
  }, [searchQuery]);


  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Header & Smart Search Input */}
      <header className="px-3 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center justify-between gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 mr-[-4px] rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftLucide className="w-6 h-6 text-slate-700" />
        </button>
        
        <div ref={searchContainerRef} className="flex-1 relative flex items-center">
          <input 
            autoFocus
            type="text" 
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
            }}
            placeholder='Try "girls pg near saravanampatti"' 
            className="w-full bg-slate-100 placeholder:text-slate-400 text-slate-900 font-bold tracking-tight text-[14px] pl-5 pr-20 py-3.5 rounded-full outline-none focus:ring-2 focus:ring-[#801786]/20 focus:bg-white border border-transparent focus:border-[#801786] transition-all shadow-inner"
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="absolute right-4 pointer-events-none">
            {isSearching ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-[#801786] rounded-full animate-spin"></div>
            ) : (
                <SearchLucide className="w-5 h-5 text-slate-400" />
            )}
          </div>
          
          {/* Predictive Google-Styled Dropdown */}
          {showSuggestions && suggestions.length > 0 && searchQuery.trim().length > 0 && (
             <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                   {suggestions.map((sug, i) => (
                       <button 
                          key={i} 
                          className="w-full text-left px-5 py-3.5 hover:bg-slate-50 flex items-start gap-3 transition-colors active:bg-slate-100 border-b border-slate-50 last:border-0"
                          onClick={() => {
                             setSearchQuery(sug);
                             setShowSuggestions(false);
                          }}
                       >
                          <SearchLucide className="w-4 h-4 text-[#801786] shrink-0 opacity-40 mt-[3px]" />
                          <span className="text-slate-700 font-medium text-sm leading-snug">{sug}</span>
                       </button>
                   ))}
                </div>
             </div>
          )}


        </div>

        <button 
          onClick={handleTargetLocation}
          title="Track my physical location securely"
          className="w-[48px] h-[48px] shrink-0 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50"
        >
          <Navigation className="w-5 h-5 text-[#801786] fill-[#801786]/20" />
        </button>
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
                 <div className="relative">
                    <button 
                       onClick={() => setShowFilters(!showFilters)}
                       className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${showFilters ? 'text-white bg-[#801786]' : 'text-[#801786] bg-[#801786]/10 hover:bg-[#801786]/20'}`}
                    >
                       <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                    </button>
                    {showFilters && (
                       <div className="absolute right-0 top-[120%] mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                          <div className="mb-3">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property Type</p>
                             <div className="flex flex-wrap gap-1.5">
                               {['all', 'pg', 'apartment'].map(t => (
                                  <button 
                                     key={t}
                                     onClick={() => setLocalFilters(prev => ({...prev, type: t}))}
                                     className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${localFilters.type === t ? 'bg-[#801786] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                     {t}
                                  </button>
                               ))}
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort by Rent</p>
                             <div className="flex flex-col gap-1">
                               {[{val: 'none', label: 'Recommended'}, {val: 'price_low', label: 'Price: Low to High'}, {val: 'price_high', label: 'Price: High to Low'}].map(s => (
                                  <button 
                                     key={s.val}
                                     onClick={() => setLocalFilters(prev => ({...prev, sort: s.val}))}
                                     className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${localFilters.sort === s.val ? 'bg-[#801786]/10 text-[#801786]' : 'text-slate-600 hover:bg-slate-50'}`}
                                  >
                                     {s.label}
                                  </button>
                               ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResults.map((item) => (
                       <PropertyCard 
                          key={item._id}
                          id={item._id}
                          title={item.title}
                          bhkType={item.bhkType}
                          propertyType={item.propertyType}
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
           <div className="p-5 flex flex-col items-center justify-center h-full opacity-50">
              <SearchLucide className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-semibold">Start typing to search properties</p>
           </div>
        )}
      </main>
    </div>
  );
}
