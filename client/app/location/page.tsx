"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, Search, MapPin, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLocationStore } from '@/store/locationStore';

// Disable SSR for Leaflet interactive maps
const MapInteractive = dynamic(() => import('@/components/map/MapBackground'), { ssr: false });

export default function LocationTracker() {
  const router = useRouter();
  const { setLocation, coordinates } = useLocationStore();
  
  // Tracking the needle's physical coordinate on the map
  const [needlePosition, setNeedlePosition] = useState<[number, number]>(coordinates ? [coordinates.lat, coordinates.lng] : [11.0168, 76.9558]);
  // State to force map to organically fly to the physical GPS location
  const [forceFlyTo, setForceFlyTo] = useState<[number, number] | null>(null);
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // Auto-Complete Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Called 60 times a second when user drags the map!
  const handleMapMove = useCallback((lat: number, lng: number) => {
      setNeedlePosition([lat, lng]);
  }, []);

  // Debounced Proxy API fetching for spelling-tolerant POI auto-complete (Bypasses CORS!)
  useEffect(() => {
     if (!searchQuery.trim()) {
         setSearchResults([]);
         setIsSearching(false);
         return;
     }

     const timer = setTimeout(async () => {
         setIsSearching(true);
         try {
             const [lat, lng] = needlePosition; // Inject Spatial Mapping to bias results to local Indian cities!
             const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&lat=${lat}&lng=${lng}`);
             const data = await res.json();
             if (data.success) {
                 setSearchResults(data.features || []);
             }
         } catch (err) {
             console.error("Proxy Auto-Complete failed", err);
         } finally {
             setIsSearching(false);
         }
     }, 300);

     return () => clearTimeout(timer);
  }, [searchQuery]);

  // Unified Background Confirm Action natively avoiding multiple explicit confirms
  const confirmCoordinates = async (lat: number, lng: number) => {
      setIsConfirming(true);
      try {
          const res = await fetch(`/api/location?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          if (data.success && data.location) {
             setLocation(`📍 ${data.location}`, { lat, lng });
          } else {
             setLocation('📍 Unknown Area', { lat, lng });
          }
          router.push('/home'); // Swoop back to Reel with fresh location!
      } catch (err) {
          console.error("OSM Geocoding failed:", err);
          setLocation('📍 Map Area', { lat, lng });
          router.push('/home');
      }
  };

  // Handle User tapping a dropdown result natively forcing instantly secure confirmation
  const handleSelectResult = async (result: any) => {
      const [lon, lat] = result.geometry.coordinates; // GeoJSON
      setForceFlyTo([lat, lon]); 
      
      setSearchQuery('');
      setSearchResults([]);
  };

  // If user explicitly taps the "Search" button instead of selecting a dropdown item
  const handleManualSearchSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
          const [nLat, nLng] = needlePosition;
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&lat=${nLat}&lng=${nLng}`);
          const data = await res.json();
          if (data.success && data.features.length > 0) {
              // Take the absolute best matching result and fly there!
              const bestResult = data.features[0];
              const [lon, lat] = bestResult.geometry.coordinates;
              setForceFlyTo([lat, lon]);
              
              setSearchQuery('');
              setSearchResults([]);
          } else {
              alert("Location not found! Try searching a nearby neighborhood.");
          }
      } catch (err) {
          console.error("Manual Search failed", err);
      } finally {
          setIsSearching(false);
      }
  };

  // Native GPS triangulation (Satellite Ping)
  const triggerGPSLocate = () => {
    if (!('geolocation' in navigator)) return alert("GPS not supported on this device.");
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
         const { latitude, longitude } = pos.coords;
         setForceFlyTo([latitude, longitude]); 
         
         setIsLocating(false); // Stop tracking spin instantly natively!
      },
      (err) => {
         console.warn("GPS Permission Denied:", err);
         alert("Please enable GPS Location Permissions allowing the browser to track satellites.");
         setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative h-[100dvh] bg-black flex flex-col overflow-hidden">
      
      {/* 1. Underlying Interactive Map (Uber-Style) */}
      <MapInteractive 
          initialCoordinates={coordinates} 
          forceLocation={forceFlyTo} 
          onLocationUpdate={handleMapMove}
      />

      {/* 2. Floating Header & Search Engine */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 pt-10 pb-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex flex-col gap-4">
        
        <div className="flex items-center w-full">
            <button onClick={() => router.back()} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl text-white pointer-events-auto active:scale-95 transition-all mr-3">
              <ArrowLeft className="w-5 h-5 drop-shadow-lg" />
            </button>
            
            {/* Awesome Floating Map Search Engine with Auto-complete */}
            <form onSubmit={handleManualSearchSubmit} className="flex-1 relative group pointer-events-auto flex items-center bg-white/95 backdrop-blur-3xl shadow-xl rounded-full border-2 border-transparent focus-within:border-[#ec38b7]/50 transition-colors">
                
                <div className="pl-4 pr-2 py-3.5 flex items-center pointer-events-none">
                    {isSearching ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-[#ec38b7] rounded-full animate-spin"></div>
                    ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                    )}
                </div>
                
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search schools, malls, places..." 
                    className="flex-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 py-3.5"
                />

                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="px-5 py-2 mr-1.5 bg-[#ec38b7] hover:bg-[#ff5522] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all"
                >
                  Search
                </button>

                {/* Auto-Complete Live Dropdown Menu */}
                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden py-2 z-50">
                        {searchResults.map((res: any, idx: number) => {
                            const name = res.properties.name || "Unknown Place";
                            const street = res.properties.street || res.properties.city || res.properties.state || "Exact Location";
                            return (
                                <button 
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectResult(res)}
                                    className="w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-center gap-4 active:scale-95"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-[#ec38b7]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 font-extrabold text-sm line-clamp-1">{name}</span>
                                        <span className="text-slate-500 font-medium text-xs line-clamp-1">{street}</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </form>
        </div>

      </header>

      {/* 3. Locator FAB & Explicit Bottom Confirm Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none flex items-end justify-between">
          <button 
              onClick={() => confirmCoordinates(needlePosition[0], needlePosition[1])}
              disabled={isConfirming || isLocating}
              className="bg-[#ec38b7] text-white px-7 py-3.5 rounded-full font-black text-[15px] shadow-[0_8px_30px_rgba(236,56,183,0.3)] pointer-events-auto active:scale-95 transition-all flex items-center gap-1.5 border-2 border-white/20"
          >
              {isConfirming ? "Confirming..." : "Confirm Location"}
              {!isConfirming && <ChevronRight className="w-5 h-5 ml-0.5" />}
          </button>
          
          <button 
              onClick={triggerGPSLocate}
              disabled={isConfirming || isLocating}
              className="w-14 h-14 shrink-0 bg-white text-[#ec38b7] rounded-full shadow-2xl flex items-center justify-center border-2 border-white/50 active:scale-90 transition-transform hover:shadow-[#ec38b7]/40 pointer-events-auto"
          >
              {(isLocating || isConfirming) ? (
                  <div className="w-6 h-6 border-2 border-[#ec38b7] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  <Navigation className="w-6 h-6 fill-[#ec38b7]/20" />
              )}
          </button>
      </div>

    </div>
  );
}
