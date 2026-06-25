"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component that hooks into map pan/drag events to detect center position (Uber-style)
function CenterTracker({ onCenterChange, forcePosition }: { onCenterChange: (pos: [number, number]) => void, forcePosition: [number, number] | null }) {
  const map = useMapEvents({
      moveend: () => {
          const center = map.getCenter();
          onCenterChange([center.lat, center.lng]);
      },
      click: (e) => {
          // Instantly fly tapped location exactly to center underneath the needle
          map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 0.15 });
      }
  });

  const lastFlown = React.useRef<string | null>(null);

  // Whenever forcePosition updates (e.g. from "Pick Me" button or Search Bar), fly exactly to it cinematically
  useEffect(() => {
    if (forcePosition) {
       const strPos = `${forcePosition[0]},${forcePosition[1]}`;
       if (lastFlown.current !== strPos) {
           lastFlown.current = strPos;
           map.flyTo(forcePosition, 15, { animate: true, duration: 1.5 }); // Cinematic smooth zoom at 1.5 seconds
           onCenterChange(forcePosition);
       }
    }
  }, [forcePosition, map, onCenterChange]);

  // Invalidate map size on mount to correct grey tiles / wrong viewport initialization inside animated modals/containers
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function InteractiveMap({ 
    initialCoordinates, 
    forceLocation,
    onLocationUpdate 
}: { 
    initialCoordinates: { lat: number, lng: number } | null,
    forceLocation: [number, number] | null,
    onLocationUpdate: (lat: number, lng: number) => void
}) {
  const indiaCenter: [number, number] = [22.5937, 78.9629]; // Full India view
  const isDefaultOrNull = !initialCoordinates || 
                          (initialCoordinates.lat === 22.5937 && initialCoordinates.lng === 78.9629);
  
  const position: [number, number] = isDefaultOrNull 
    ? indiaCenter 
    : [initialCoordinates.lat, initialCoordinates.lng];
  const initialZoom = isDefaultOrNull ? 5 : 15;

  const handleCenterUpdate = (pos: [number, number]) => {
      onLocationUpdate(pos[0], pos[1]);
  };

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={position} 
        zoom={initialZoom}  
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <CenterTracker onCenterChange={handleCenterUpdate} forcePosition={forceLocation} />
      </MapContainer>

      {/* FIXED CENTER AIM POINT / RETICLE */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none drop-shadow-lg flex items-center justify-center">
         {/* Center Target Dot */}
         <div className="w-2.5 h-2.5 bg-[#ec38b7] rounded-full border border-white shadow-md"></div>
         
         {/* Outer Target Circle */}
         <div className="absolute w-10 h-10 rounded-full border-2 border-[#ec38b7] bg-[#ec38b7]/10 animate-pulse"></div>
         
         {/* Crosshair Ticks */}
         {/* Top Tick */}
         <div className="absolute top-[-6px] w-0.5 h-2 bg-[#ec38b7]"></div>
         {/* Bottom Tick */}
         <div className="absolute bottom-[-6px] w-0.5 h-2 bg-[#ec38b7]"></div>
         {/* Left Tick */}
         <div className="absolute left-[-6px] w-2 h-0.5 bg-[#ec38b7]"></div>
         {/* Right Tick */}
         <div className="absolute right-[-6px] w-2 h-0.5 bg-[#ec38b7]"></div>
      </div>
    </div>
  );
}
