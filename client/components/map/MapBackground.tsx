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
          map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 0.4 });
      }
  });

  // Whenever forcePosition updates (e.g. from "Pick Me" button or Search Bar), fly exactly to it cinematically
  useEffect(() => {
    if (forcePosition) {
       map.flyTo(forcePosition, 18, { animate: true, duration: 0.4 }); // Ultra-Fast cinematic zoom to street level
       onCenterChange(forcePosition);
    }
  }, [forcePosition, map, onCenterChange]);

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
  // Always lock initial map view to the entire country at Zoom 5
  const position: [number, number] = indiaCenter;
  const initialZoom = 5;

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

      {/* FIXED CENTER NEEDLE (Uber Style) */}
      <div className="absolute top-1/2 left-1/2 -mt-10 -ml-5 z-10 pointer-events-none drop-shadow-xl flex flex-col items-center animate-bounce">
         <div className="bg-[#FF6A3D] text-white p-2.5 rounded-full shadow-lg border-2 border-white">
            <MapPin className="w-6 h-6 fill-white stroke-[#FF6A3D]" />
         </div>
         {/* The literal Needle Tip */}
         <div className="w-1 h-3 bg-black/80 rounded-b-full"></div>
         <div className="w-3 h-1 bg-black/40 rounded-[100%] blur-[2px] mt-0.5" />
      </div>
    </div>
  );
}
