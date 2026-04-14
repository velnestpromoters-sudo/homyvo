"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Search } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    const validateWishlistItems = async () => {
       if (wishlist.length === 0) return;
       
       const ids = wishlist.map(w => w._id);
       try {
          const res = await fetch('/api/properties/validate-wishlist', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ ids })
          });
          const data = await res.json();
          if (data.success) {
             const activeIds = data.activeIds;
             ids.forEach(id => {
                if (!activeIds.includes(id)) {
                   removeFromWishlist(id);
                }
             });
          }
       } catch (err) { console.error("Wishlist sync error:", err); }
    };
    
    validateWishlistItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] pb-24 font-sans text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm px-4 py-4 flex items-center justify-between z-10 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#111827]" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-[#111827]">Saved Homes</h1>
        </div>
        <span className="text-sm font-bold text-[#801786] bg-[#801786]/10 px-3 py-1 rounded-full">
          {wishlist.length} Items
        </span>
      </div>

      {/* Grid Layout */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.length === 0 ? (
          <div className="col-span-full mt-24 flex flex-col items-center justify-center text-center px-6">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
               <Heart className="w-8 h-8 text-gray-400 fill-gray-200" />
             </div>
             <h2 className="text-2xl font-black text-[#111827] mb-2 tracking-tight">No saved homes yet</h2>
             <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
               Tap the heart icon on any property reel you love to save it here for later viewing.
             </p>
             <button 
                onClick={() => router.push('/home')} 
                className="font-bold text-white bg-[#ec38b7] hover:bg-[#d42d99] shadow-lg px-8 py-3.5 rounded-full transition-all active:scale-95 flex items-center gap-2"
             >
                <Search className="w-4 h-4" /> Explore Homes
             </button>
          </div>
        ) : (
          wishlist.map(item => (
            <div 
              key={item._id} 
              className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-200/60 p-4 flex gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] duration-200 relative group" 
              onClick={() => router.push(`/property/${item._id}`)}
            >
               <div className="w-[110px] h-[110px] shrink-0 rounded-2xl overflow-hidden bg-gray-100 relative">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               </div>
               
               <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-extrabold text-[#111827] text-sm leading-tight line-clamp-2 pr-6 hover:text-[#801786] transition-colors">{item.title}</h3>
                    
                  </div>
                  
                  <p className="text-xs font-semibold text-gray-500 bg-gray-100 self-start px-2 py-0.5 rounded-md mb-auto">{item.typeStr}</p>
                  
                  <div className="flex items-end justify-between mt-3">
                     <p className="font-black text-[#801786] text-lg leading-none">
                        ₹{item.price.toLocaleString()} 
                        <span className="text-[11px] text-gray-500 font-semibold ml-0.5">/mo</span>
                     </p>
                  </div>
               </div>

               {/* Absolute Remove Button */}
               <button 
                  onClick={(e) => { 
                     e.stopPropagation(); 
                     removeFromWishlist(item._id); 
                  }} 
                  className="absolute p-2 top-3 right-3 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-transform shrink-0"
               >
                  <Heart className="w-4 h-4 text-[#ec38b7] fill-[#ec38b7]" />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
