"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, CheckCircle, Percent, Share2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlistStore';

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
  bhkType?: string;
  bachelorsAllowed?: boolean;
  distanceKm?: number;
  propertyType?: 'apartment' | 'pg';
  pgDetails?: any;
}

export default function VideoCard({ 
  id, video, images, rent, area, district, matchScore, moveInReady, isActive, 
  bhkType, bachelorsAllowed, distanceKm, propertyType, pgDetails
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  // Using exclusively the uploaded images array from the new property system
  const mediaList = images && images.length > 0 ? images : ['/images/placeholder.jpg'];

  const isSaved = isInWishlist(id.toString());

  const toggleWishlist = () => {
    const isPgLocal = propertyType === 'pg';
    const typeStr = isPgLocal ? 'PG' : (bhkType || 'Apartment');

    if (isSaved) {
      removeFromWishlist(id.toString());
    } else {
      addToWishlist({
        _id: id.toString(),
        title: `${area}, ${district}`,
        price: rent,
        img: mediaList[0],
        typeStr: typeStr
      });
    }
  };

  useEffect(() => {
    // Play video if active property slide AND the first horizontal slide (video) is active
    if (isActive && activeMediaIndex === 0 && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.log('Video autoplay blocked', e));
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, activeMediaIndex]);

  const handleShare = async () => {
      try {
          if (navigator.share) {
              await navigator.share({
                  title: `Beautiful Property in ${area}, ${district}`,
                  text: `Check out this amazing home in ${area} for ₹${rent.toLocaleString()}/mo on Homyvo!`,
                  url: window.location.origin + `/property/${id}`
              });
          } else {
              alert("Link copied! Share this with your friends.");
              navigator.clipboard.writeText(window.location.origin + `/property/${id}`);
          }
      } catch (err) {
          console.log("Share sheet closed");
      }
  };

  // Mouse Drag-To-Scroll (Desktop Simulation of swiping)
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDragging = (e: React.MouseEvent) => {
      setIsDragging(true);
      if (!scrollRef.current) return;
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
      setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // Drag sensitivity
      scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Detect horizontal swipe to update pagination dots
  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const slideWidth = container.clientWidth;
      const newActiveIndex = Math.round(container.scrollLeft / slideWidth);
      if (newActiveIndex !== activeMediaIndex) {
          setActiveMediaIndex(newActiveIndex);
      }
  };

  // --- PG Display Logic System ---
  const isPg = propertyType === 'pg';
  let bestPgSharingStr = "";
  let bestPgBedStr = "";
  let pgGenderStr = "";

  if (isPg && pgDetails) {
      pgGenderStr = pgDetails.gender === 'boys' ? 'Boys PG' : pgDetails.gender === 'girls' ? 'Girls PG' : 'Co-living PG';
      
      if (pgDetails.rooms && pgDetails.rooms.length > 0) {
         // Sort by highest available beds to highlight the best option
         const bestRoom = [...pgDetails.rooms].sort((a, b) => b.availableBeds - a.availableBeds)[0];
         
         if (pgDetails.rooms.length > 1) {
            // Multi-sharing case summary
            const sortedSharing = [...pgDetails.sharingTypes].sort();
            bestPgSharingStr = `${sortedSharing.join(',')} Sharing Available`;
            bestPgBedStr = `Up to ${bestRoom.availableBeds} beds available`;
         } else {
            // Single sharing case exactly as requested
            bestPgSharingStr = `${bestRoom.sharing} Sharing`;
            bestPgBedStr = `${bestRoom.availableBeds} Beds Available`;
         }
      }
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black snap-start snap-always shrink-0 overflow-hidden">
      
      {/* Horizontal Full Screen Scrollable Carousel (Video + Images) */}
      <div 
        ref={scrollRef}
        onScroll={handleHorizontalScroll}
        onMouseDown={startDragging}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={onDrag}
        className={`absolute inset-0 flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
          {mediaList.map((mediaSrc, idx) => (
             <div key={idx} className="relative w-full h-full shrink-0 snap-center flex items-center justify-center bg-black">
                <img 
                    src={mediaSrc} 
                    className="w-full h-full object-cover pointer-events-none" 
                    alt="Property View"
                />
             </div>
          ))}
      </div>

      {/* Dark Overlay Gradient (Better text readability for the bottom text) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 pointer-events-none" />

      {/* Top Carousel Pagination Dots (Tinder-style) */}
      {mediaList.length > 1 && (
         <div className="absolute top-[75px] left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-4 pointer-events-none">
             {mediaList.map((_, dotIdx) => (
                 <div 
                    key={dotIdx} 
                    className={`h-1.5 rounded-full transition-all duration-300 shadow-[0_0_5px_rgba(0,0,0,0.5)] ${activeMediaIndex === dotIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                 />
             ))}
         </div>
      )}

      {/* Top Right: Actions Container */}
      <div className="absolute top-[96px] right-4 pointer-events-none z-10 flex flex-col gap-4">
        <button 
          onClick={handleShare}
          className="flex flex-col items-center pointer-events-auto active:scale-90 transition-transform mt-2"
        >
          <div className="bg-white/10 backdrop-blur-md text-white rounded-full p-3.5 mb-1 border border-white/20 shadow-xl">
             <Share2 className="w-6 h-6 fill-white/10" />
          </div>
          <span className="text-white font-bold text-xs drop-shadow-md">Share</span>
        </button>  

        <button 
          onClick={toggleWishlist}
          className="flex flex-col items-center pointer-events-auto active:scale-90 transition-transform mt-1"
        >
          <div className="bg-white/10 backdrop-blur-md text-white rounded-full p-3.5 mb-1 border border-white/20 shadow-xl">
             <Heart className={`w-6 h-6 transition-colors ${isSaved ? 'fill-[#ec38b7] text-[#ec38b7]' : 'fill-white/10 text-white'}`} />
          </div>
          <span className={`font-bold text-xs drop-shadow-md ${isSaved ? 'text-[#ec38b7]' : 'text-white'}`}>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Bottom overlay: Property details */}
      <div className="absolute bottom-[90px] left-0 right-0 px-5 mb-2 z-10 flex flex-col justify-end pointer-events-auto">
        
        {/* Title / Rent / Sharing */}
        <h2 className="text-white text-3xl font-black mb-1 drop-shadow-md flex items-end gap-2">
          {isPg && <span className="text-[#ec38b7] text-2xl tracking-tight">PG • {bestPgSharingStr}</span>}
          {!isPg && <>₹{rent.toLocaleString()} <span className="text-lg text-white/80 font-semibold mb-0.5">/mo</span></>}
        </h2>
        
        {/* PG Rent Fallback if PG replaces Rent Title */}
        {isPg && (
            <p className="text-white font-black text-xl mb-1 mt-0.5 drop-shadow-md">
                ₹{rent.toLocaleString()} <span className="text-sm font-semibold text-white/80">/mo average rent</span>
            </p>
        )}

        {/* Location & Distance */}
        <div className="flex flex-wrap items-center gap-1.5 text-white/90 mb-2 font-bold drop-shadow-md">
          <MapPin className="w-4 h-4 text-[#ec38b7]" />
          <span>{area}, {district}</span>
          {distanceKm !== undefined && (
            <span className="text-white/70 ml-0.5">• <strong className="text-white">{distanceKm.toFixed(1)} km</strong> away</span>
          )}
        </div>

        {/* PG Specific Sub-Details */}
        {isPg && (
            <div className="text-emerald-300 font-bold mb-3 flex items-center gap-2 drop-shadow-md">
                <CheckCircle className="w-4 h-4" />
                {bestPgBedStr}
            </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-1">
          {isPg && (
            <div className="bg-[#801786]/70 backdrop-blur-md border border-white/20 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5">
               {pgGenderStr}
            </div>
          )}
          {!isPg && bhkType && (
            <div className="bg-white/15 backdrop-blur-md border border-white/30 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
              {bhkType}
            </div>
          )}
          {!isPg && bachelorsAllowed && (
            <div className="bg-[#801786]/60 backdrop-blur-md border border-[#801786] text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-lg">
              Bachelor Allowed
            </div>
          )}
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
