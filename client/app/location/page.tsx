"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation } from 'lucide-react';
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

  // Called 60 times a second when user drags the map!
  const handleMapMove = useCallback((lat: number, lng: number) => {
      setNeedlePosition([lat, lng]);
  }, []);

  // Native GPS triangulation (Satellite Ping) + Cinematic Zoom Automator
  const triggerGPSLocate = () => {
    if (!('geolocation' in navigator)) return alert("GPS not supported on this device.");
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
         const { latitude, longitude } = pos.coords;
         setForceFlyTo([latitude, longitude]); // Map organically swoops to exact GPS chip location (1.5s animation)
         
         // Wait exactly 1.8 seconds for the fast zoom animation to finish, then auto-confirm location!
         setTimeout(() => {
            handleAutoConfirm([latitude, longitude]);
         }, 1800);
      },
      (err) => {
         console.warn("GPS Permission Denied:", err);
         alert("Please enable GPS Location Permissions allowing the browser to track satellites.");
         setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Final Geocoding Step (Hits OSM Native Proxy Server automatically)
  const handleAutoConfirm = async (coords: [number, number]) => {
      const [lat, lng] = coords;

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
      } finally {
          setIsLocating(false);
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

      {/* 2. Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-5 pt-10 pb-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none flex items-center">
        <button onClick={() => router.back()} className="p-3 bg-white/10 backdrop-blur-md rounded-full active:scale-95 transition pointer-events-auto border border-white/20 shadow-xl">
          <ArrowLeft className="w-6 h-6 text-white drop-shadow-lg" />
        </button>
      </header>

      {/* 3. Locator FAB Button (Bottom Center) */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <button 
            onClick={triggerGPSLocate}
            disabled={isLocating}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-white text-[#FF6A3D] rounded-full shadow-2xl border-2 border-white/50 active:scale-95 transition-all hover:shadow-[#FF6A3D]/40 hover:shadow-lg overflow-hidden relative"
        >
            {isLocating && <div className="absolute inset-0 bg-[#FF6A3D]/5 animate-pulse" />}
            
            {isLocating ? (
                <div className="w-5 h-5 border-2 border-[#FF6A3D] border-t-transparent rounded-full animate-spin shrink-0"></div>
            ) : (
                <Navigation className="w-6 h-6 fill-[#FF6A3D]/20 animate-bounce shrink-0" />
            )}
            <span className="font-extrabold text-[#FF6A3D] text-lg tracking-tight pr-1">
                {isLocating ? 'Scanning Satellites...' : 'Pick My Location'}
            </span>
        </button>
      </div>

    </div>
  );
}
