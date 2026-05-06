"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle, ShieldCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlistStore } from '@/store/wishlistStore';

interface PropertyCardProps {
  id: string | number;
  title?: string;
  bhkType?: string;
  propertyType?: string;
  image: string;
  rent: number;
  location: string;
  matchScore?: number;
  moveInStatus?: string;
}

export function PropertyCard({ id, title = 'Property', bhkType, propertyType, image, rent, location, matchScore, moveInStatus }: PropertyCardProps) {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlistStore();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/property/${id}`)}
      className="cursor-pointer mb-3 md:mb-5"
    >
      <Card className="overflow-hidden border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] rounded-[16px] md:rounded-[24px] bg-white flex flex-row md:flex-col h-[130px] md:h-auto">
        {/* Image Section */}
        <div className="relative h-full w-[130px] md:w-full md:h-56 bg-slate-100 shrink-0">
          <img src={image} alt={location} className="object-cover w-full h-full rounded-l-[16px] md:rounded-l-none md:rounded-t-[24px]" />
          
          <button 
             onClick={(e) => {
                e.stopPropagation();
                const isSaved = wishlist.some(w => w._id === id);
                if (isSaved) {
                   removeFromWishlist(id as string);
                } else {
                   addToWishlist({
                       _id: id as string,
                       title: title,
                       price: rent,
                       typeStr: bhkType ? `${bhkType} • ${propertyType}` : (propertyType || 'Property'),
                       img: image
                   });
                }
             }}
             className="absolute top-2 left-2 md:top-4 md:left-4 w-7 h-7 md:w-9 md:h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 flex items-center justify-center hover:bg-white active:scale-90 transition-transform z-10"
          >
             <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${wishlist.some(w => w._id === id) ? 'fill-[#ec38b7] text-[#ec38b7]' : 'text-slate-400'}`} />
          </button>

          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold text-[#801786] shadow-[0_5px_15px_-5px_rgba(128,23,134,0.3)] border border-purple-100 uppercase tracking-wider flex items-center gap-1">
              {matchScore}% Match
            </div>
          )}
          
          {/* Move-in Ready Tag */}
          {moveInStatus && (
            <div className="hidden md:flex absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              {moveInStatus}
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-3 md:p-5 flex flex-col justify-between md:justify-start flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 mb-2">
            <div className="min-w-0">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
                ₹{rent.toLocaleString()} <span className="text-[10px] md:text-sm font-medium text-slate-400">/mo</span>
              </h3>
              <div className="text-[11px] md:text-sm font-bold text-slate-800 mt-0.5 truncate">{title}</div>
              <div className="flex items-center gap-1 md:gap-1.5 mt-1 md:mt-2 text-slate-500 text-[10px] md:text-sm font-medium">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-slate-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
            
            {/* Trust Indicator */}
            <div className="hidden md:flex items-center gap-1 bg-blue-50/80 text-blue-700 px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-extrabold border border-blue-100 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>
          
          <div className="flex md:hidden items-center justify-between mt-auto pt-2 border-t border-slate-50">
             <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold">
                <ShieldCheck className="w-3 h-3" />
                Verified
             </div>
             {moveInStatus && (
               <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                 <CheckCircle className="w-3 h-3" /> Ready
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
