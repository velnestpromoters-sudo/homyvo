"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, Search } from 'lucide-react';
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
  
  // Search Bar
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Called 60 times a second when user drags the map!
  const handleMapMove = useCallback((lat: number, lng: number) => {
      setNeedlePosition([lat, lng]);
  }, []);

  // Text -> Coordinates (OSM Forward Geocoding)
  const executeSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      setIsSearching(true);
      
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
              headers: { 'User-Agent': 'Bnest-App-Client' }
          });
          const data = await res.json();
          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              setForceFlyTo([lat, lon]); // Turbo 0.8s Cinematic Map Fly!
          } else {
              alert("Location not found on map! Try a nearby city or district.");
          }
      } catch (err) {
          console.error("OSM Search block", err);
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
         setForceFlyTo([latitude, longitude]); // Ultra-Fast Map Fly
         setIsLocating(false);
      },
      (err) => {
         console.warn("GPS Permission Denied:", err);
         alert("Please enable GPS Location Permissions allowing the browser to track satellites.");
         setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Final Geocoding Step (Triggered only by the Confirm button)
  const handleConfirmLocation = async () => {
      setIsConfirming(true);
      const [lat, lng] = needlePosition;

      try {
          // Hits our Secure Proxy
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
      } finally {
          setIsConfirming(false);
      }
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
            
            {/* Awesome Floating Map Search Engine */}
            <form onSubmit={executeSearch} className="flex-1 relative group pointer-events-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {isSearching ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-[#FF6A3D] rounded-full animate-spin"></div>
                    ) : (
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF6A3D] transition-colors" />
                    )}
                </div>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, district..." 
                    className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/95 backdrop-blur-3xl shadow-xl text-sm font-bold text-slate-800 outline-none border-2 border-transparent focus:border-[#FF6A3D]/50 placeholder:font-medium placeholder:text-slate-400"
                />
            </form>
        </div>

      </header>

      {/* 3. Locator FAB Button (Center Right) */}
      <button 
          onClick={triggerGPSLocate}
          disabled={isLocating}
          className="absolute right-5 bottom-[140px] z-20 w-14 h-14 bg-white text-[#FF6A3D] rounded-full shadow-2xl flex items-center justify-center border-2 border-white/50 active:scale-90 transition-transform hover:shadow-[#FF6A3D]/40 hover:shadow-lg pointer-events-auto"
      >
          {isLocating ? (
              <div className="w-5 h-5 border-2 border-[#FF6A3D] border-t-transparent rounded-full animate-spin"></div>
          ) : (
              <Navigation className="w-6 h-6 fill-[#FF6A3D]/20" />
          )}
      </button>

      {/* 4. Final Bottom Confirmation Action Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-5 bg-gradient-to-t from-black/80 via-black/60 to-transparent pb-8 pointer-events-none">
         <div className="max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-5 shadow-2xl pointer-events-auto">
            <h3 className="font-extrabold text-white text-lg tracking-tight mb-1">Confirm Specific Location</h3>
            <p className="text-white/60 text-xs font-medium mb-4 leading-relaxed line-clamp-2">Move the needle precisely to your target house or district via Search or GPS.</p>
            
            <button 
                onClick={handleConfirmLocation}
                disabled={isConfirming}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#FF6A3D] text-white rounded-2xl font-black text-sm uppercase tracking-wide active:scale-[0.98] transition-all shadow-xl shadow-[#FF6A3D]/30"
            >
                {isConfirming ? (
                    'Pinpointing Block...'
                ) : (
                    'Confirm Location Pin'
                )}
            </button>
         </div>
      </div>

    </div>
  );
}
