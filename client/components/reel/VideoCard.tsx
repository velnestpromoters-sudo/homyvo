"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, CheckCircle, Percent, Share2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoCardProps {
  id: string | number;
  video: string;
  images: string[];
  rent: number;
  area: string;
  district: string;
  matchScore: number;
  moveInReady: boolean;
  isActive: boolean; // Tells the component if it is currently intersecting (visible)
}

export default function VideoCard({ id, video, images, rent, area, district, matchScore, moveInReady, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Play video if active slide, otherwise pause
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log('Video autoplay blocked', e));
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleShare = async () => {
      try {
          if (navigator.share) {
              await navigator.share({
                  title: `Beautiful Property in ${area}, ${district}`,
                  text: `Check out this amazing home in ${area} for ₹${rent.toLocaleString()}/mo on Bnest!`,
                  url: window.location.origin + `/property/${id}`
              });
          } else {
              // Fallback copy to clipboard or custom bottom sheet.
              alert("Link copied! Share this with your friends.");
              navigator.clipboard.writeText(window.location.origin + `/property/${id}`);
          }
      } catch (err) {
          // user cancelled the native share sheet
          console.log("Share sheet closed");
      }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black snap-start snap-always shrink-0 overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={video}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
      />

      {/* Dark Overlay Gradient (Better text readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Top Right: Match Badge */}
      <div className="absolute top-[88px] right-4 pointer-events-none z-10 flex flex-col gap-4">
        <div className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-white/10 shadow-lg pointer-events-auto">
          <div className="bg-emerald-500 text-white rounded-full p-1.5 mb-1 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Percent className="w-3.5 h-3.5" />
          </div>
          <span className="text-white font-black text-xs">{matchScore}%</span>
          <span className="text-white/70 font-bold text-[9px] uppercase tracking-widest mt-0.5">Match</span>
        </div>
        
        {/* Native OS Share Sheet Launcher Button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center pointer-events-auto active:scale-90 transition-transform mt-2"
        >
          <div className="bg-white/10 backdrop-blur-md text-white rounded-full p-3.5 mb-1 border border-white/20 shadow-xl">
             <Share2 className="w-6 h-6 fill-white/10" />
          </div>
          <span className="text-white font-bold text-xs drop-shadow-md">Share</span>
        </button>  
      </div>

      {/* Bottom overlay: Images Gallery & Property details */}
      <div className="absolute bottom-[90px] left-0 right-0 px-5 mb-2 z-10 flex flex-col justify-end pointer-events-auto">
        
        {/* Horizontal Scroll Image Snippets */}
        {images && images.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-5 pb-1 -mx-5 px-5">
               {images.map((imgUrl, i) => (
                   <img 
                      key={i} 
                      src={imgUrl} 
                      className="w-[110px] h-[75px] object-cover rounded-xl border border-white/20 shadow-lg shrink-0 pointer-events-none" 
                      alt="Property Image Thumbnail"
                   />
               ))}
               <div className="w-[110px] h-[75px] shrink-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg flex flex-col items-center justify-center text-white/80">
                   <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">+5 More</span>
               </div>
            </div>
        )}

        {/* Title / Rent */}
        <h2 className="text-white text-3xl font-black mb-1 drop-shadow-md">
          ₹{rent.toLocaleString()} <span className="text-lg text-white/80 font-semibold">/mo</span>
        </h2>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-white/90 mb-3 font-medium">
          <MapPin className="w-4 h-4 text-[#FF6A3D]" />
          <span>{area}, {district}</span>
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          {moveInReady && (
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 text-emerald-300 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              Move-in Ready
            </div>
          )}
        </div>

        {/* Read More / Apply invisible layer over text to view details */}
        <div className="mt-4">
           <button 
             onClick={() => router.push(`/property/${id}`)}
             className="w-full py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl text-sm shadow-xl active:scale-95 transition-all"
           >
             View Home Details
           </button>
        </div>
      </div>
    </div>
  );
}
