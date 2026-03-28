"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyCardProps {
  id: string | number;
  image: string;
  rent: number;
  location: string;
  matchScore?: number;
  moveInStatus?: string;
}

export function PropertyCard({ id, image, rent, location, matchScore, moveInStatus }: PropertyCardProps) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/property/${id}`)}
      className="cursor-pointer mb-5"
    >
      <Card className="overflow-hidden border-0 shadow-sm rounded-[24px] bg-white">
        {/* Image Section */}
        <div className="relative h-56 w-full bg-slate-100">
          <img src={image} alt={location} className="object-cover w-full h-full rounded-t-[24px]" />
          
          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-emerald-600 shadow-sm flex items-center gap-1">
              {matchScore}% Match
            </div>
          )}
          
          {/* Move-in Ready Tag */}
          {moveInStatus && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              {moveInStatus}
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{rent.toLocaleString()} <span className="text-sm font-medium text-slate-400">/mo</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate max-w-[200px]">{location}</span>
              </div>
            </div>
            
            {/* Trust Indicator */}
            <div className="flex items-center gap-1 bg-blue-50/80 text-blue-700 px-2.5 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-extrabold border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
