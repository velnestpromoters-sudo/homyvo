"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Search, Sparkles, MapPin, DollarSign, Key, BedDouble, CheckCircle2, TrendingUp, X } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const { coordinates } = useLocationStore();

  const [interactions, setInteractions] = useState<any[]>([]);
  
  // AI Engine States
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recFilter, setRecFilter] = useState('best_match');
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null);

  const [savedSortMode, setSavedSortMode] = useState<string>('none');
  const [detailedWishlist, setDetailedWishlist] = useState<any[]>([]);

  useEffect(() => {
    const validateWishlistItems = async () => {
       // Validate Wishlist & Fetch Access Interactions sequentially
       if (wishlist.length > 0) {
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
                
                // Map the full property pipelines into state for local heuristic sorting
                if (data.populatedProperties) {
                   setDetailedWishlist(data.populatedProperties);
                }

                ids.forEach(id => {
                   if (!activeIds.includes(id)) {
                      removeFromWishlist(id);
                   }
                });
             }
          } catch (err) { console.error("Wishlist sync error:", err); }
       }
       
       // Now Fetch Tracking Accesses seamlessly
       try {
          const token = useAuthStore.getState().token;
          if (token) {
             const trackRes = await fetch('/api/interactions/tenant/my-interactions', {
                headers: { 'Authorization': `Bearer ${token}` }
             });
             const trackData = await trackRes.json();
             if (trackData.success) {
                setInteractions(trackData.data);
             }
          }
       } catch (e) {
          console.error("Failed to load pipeline tracking", e);
       }
    };
    
    validateWishlistItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI Recommendation Fetcher
  useEffect(() => {
     const fetchAIRecommendations = async () => {
        setRecLoading(true);
        try {
           const payload = {
              wishlistIds: wishlist.map(w => w._id),
              filter: recFilter,
              lat: coordinates?.lat,
              lng: coordinates?.lng
           };
           const res = await fetch('/api/properties/recommend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
           });
           const json = await res.json();
           if (json.success) {
              setRecommendations(json.data);
           }
        } catch (e) { console.error("AI Recommendation Engine failed:", e); }
        finally { setRecLoading(false); }
     };
     
     // Only run if they actually have wishlist items, otherwise recommendations are purely local.
     // Actually AI Engine returns global matches even with empty wishlist, so let it run!
     fetchAIRecommendations();
     
  }, [recFilter, wishlist.length, coordinates]);

  // Distance helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a)); 
  };

  const displayWishlist = React.useMemo(() => {
     if (detailedWishlist.length === 0) return wishlist;
     
     let sorted = [...detailedWishlist];
     if (savedSortMode === 'price_low') {
        sorted.sort((a, b) => (a.rent || 0) - (b.rent || 0));
     } else if (savedSortMode === 'amenities') {
        sorted.sort((a, b) => (b.amenities?.length || 0) - (a.amenities?.length || 0));
     } else if (savedSortMode === 'furnished') {
        sorted.sort((a, b) => (b.furnishing === 'full' ? -1 : 1) - (a.furnishing === 'full' ? -1 : 1));
     } else if (savedSortMode === 'checkin') {
        sorted.sort((a, b) => (b.availability === 'immediate' ? -1 : 1) - (a.availability === 'immediate' ? -1 : 1));
     } else if (savedSortMode === 'nearest' && coordinates?.lat) {
        sorted.sort((a, b) => {
           const distA = a.location?.coordinates?.length === 2 ? getDistance(coordinates.lat, coordinates.lng, a.location.coordinates[1], a.location.coordinates[0]) : Infinity;
           const distB = b.location?.coordinates?.length === 2 ? getDistance(coordinates.lat, coordinates.lng, b.location.coordinates[1], b.location.coordinates[0]) : Infinity;
           return distA - distB;
        });
     }
     
     return sorted.map(s => ({
        _id: s._id,
        title: s.title,
        price: s.rent,
        typeStr: s.bhkType ? `${s.bhkType} • ${s.propertyType}` : s.propertyType,
        img: s.images?.[0] || 'https://via.placeholder.com/300'
     }));
  }, [detailedWishlist, savedSortMode, coordinates, wishlist]);

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

      {/* Active Deal Pipelines / Unlocked Interactions */}
      {interactions.length > 0 && (
         <div className="pt-6 px-4 pb-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-4">
               <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
               Active Tracking Pipelines
            </h2>
            <div className="flex flex-col gap-3">
               {interactions.map(interaction => (
                  <div key={interaction._id} className="bg-white border-2 border-indigo-50 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <img src={interaction.property?.images?.[0] || 'https://via.placeholder.com/150'} alt="prop" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex flex-col">
                           <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{interaction.property?.title}</h3>
                           <p className="text-xs text-slate-500 line-clamp-1">{interaction.property?.location?.area}</p>
                           <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Stage: {interaction.interactionStage?.replace('_', ' ')}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => router.push(`/tracking/${interaction._id}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-md active:scale-95 whitespace-nowrap"
                     >
                        Track Status
                     </button>
                  </div>
               ))}
            </div>
            
            <div className="h-px bg-slate-200 my-6 mx-4"></div>
         </div>
      )}

      {/* Saved Properties Sorting Engine */}
      {wishlist.length > 0 && (
         <div className="px-4 mt-2 mb-2">
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-1">Sort Your Collection</h3>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar scroll-smooth snap-x">
               {[
                  { id: 'none', label: 'Default', icon: Heart },
                  { id: 'price_low', label: 'Price: Low to High', icon: DollarSign },
                  { id: 'nearest', label: 'Nearest to Me', icon: MapPin },
                  { id: 'amenities', label: 'Most Amenities', icon: CheckCircle2 },
                  { id: 'furnished', label: 'Fully Furnished', icon: BedDouble },
                  { id: 'checkin', label: 'Fast Check-in', icon: Key }
               ].map(filter => {
                  const Icon = filter.icon;
                  const isActive = savedSortMode === filter.id;
                  return (
                     <button 
                        key={filter.id}
                        onClick={() => setSavedSortMode(filter.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 shrink-0 rounded-xl font-bold text-[11px] tracking-wide transition-all border snap-start ${
                           isActive ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                     >
                        <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {filter.label}
                     </button>
                  )
               })}
            </div>
         </div>
      )}

      {/* Grid Layout */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayWishlist.length === 0 ? (
          <div className="col-span-full mt-10 flex flex-col items-center justify-center text-center px-6">
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
          displayWishlist.map(item => (
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

      {/* AI Recommendation Engine Block */}
      <div className="mt-8 pb-10">
         <div className="px-4 mb-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-3">
               <Sparkles className="w-5 h-5 text-purple-600" />
               AI Curated For You
            </h2>
            
            {/* Dynamic Heuristic Filters */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar scroll-smooth snap-x">
               {[
                  { id: 'best_match', label: 'Best Match', icon: Sparkles },
                  { id: 'price_low', label: 'Price: Low to High', icon: DollarSign },
                  { id: 'nearest', label: 'Nearest to Me', icon: MapPin },
                  { id: 'amenities', label: 'Most Amenities', icon: CheckCircle2 },
                  { id: 'furnished', label: 'Fully Furnished', icon: BedDouble },
                  { id: 'checkin', label: 'Fast Check-in', icon: Key }
               ].map(filter => {
                  const Icon = filter.icon;
                  const isActive = recFilter === filter.id;
                  return (
                     <button 
                        key={filter.id}
                        onClick={() => setRecFilter(filter.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 shrink-0 rounded-xl font-bold text-xs tracking-wide transition-all border snap-start ${
                           isActive ? 'bg-[#801786] text-white border-[#801786] shadow-md shadow-purple-500/20' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                     >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {filter.label}
                     </button>
                  )
               })}
            </div>
         </div>

         {recLoading ? (
            <div className="flex flex-col items-center justify-center p-10">
               <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
               <p className="text-sm font-bold text-slate-500 animate-pulse">Running AI heuristic matching...</p>
            </div>
         ) : recommendations.length === 0 ? (
            <div className="mx-4 bg-white rounded-3xl p-6 text-center shadow-sm border border-slate-100">
               <p className="text-sm font-bold text-slate-500">No explicit recommendations found right now.</p>
            </div>
         ) : (
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar snap-x snap-mandatory">
               {recommendations.map(prop => (
                  <div 
                     key={prop._id}
                     onClick={() => router.push(`/property/${prop._id}`)}
                     className="bg-white rounded-3xl shadow-sm border border-slate-100/80 p-3 min-w-[280px] shrink-0 snap-center cursor-pointer active:scale-[0.98] transition-transform"
                  >
                     <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 relative mb-3">
                        <img src={prop.images?.[0] || 'https://via.placeholder.com/300'} alt="prop" className="w-full h-full object-cover" />
                        {prop.score && recFilter === 'best_match' ? (
                           <button 
                              onClick={(e) => { e.stopPropagation(); if(prop.scoreBreakdown) setSelectedInsight(prop); }}
                              className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-black text-purple-700 shadow-sm border border-purple-100 uppercase tracking-wider flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                           >
                              <TrendingUp className="w-3 h-3 text-purple-500" /> {prop.score} Match Score
                           </button>
                        ) : (
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-black text-purple-700 shadow-sm border border-white/50">
                              Recommended
                           </div>
                        )}
                     </div>
                     <h3 className="font-extrabold text-slate-800 text-base leading-tight mb-1 truncate">{prop.title}</h3>
                     <p className="text-[11px] font-bold text-slate-400 mb-3 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {prop.location?.area || prop.location?.city}
                     </p>
                     <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p className="font-black text-[#801786]">₹{prop.rent?.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{prop.bhkType}</p>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
      
      {/* Deep AI Insight Modal */}
      {selectedInsight && selectedInsight.scoreBreakdown && (
         <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div 
               className="bg-white w-full sm:max-w-md rounded-t-[30px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 relative z-50"
            >
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" /> AI Insights Matrix
                     </h3>
                     <p className="text-xs font-bold text-slate-500 mt-1 line-clamp-1">{selectedInsight.title}</p>
                  </div>
                  <button 
                     onClick={() => setSelectedInsight(null)}
                     className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-colors"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregate Rating</span>
                     <span className="text-4xl font-black text-purple-600 tracking-tighter">{selectedInsight.score}<span className="text-lg text-slate-300 font-bold ml-1">pts</span></span>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-purple-50 border-4 border-purple-100 flex items-center justify-center">
                     <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
               </div>

               <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Geometric Allocation</h4>
               
               <div className="space-y-5 mb-4">
                  {/* Budget */}
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400"/> Pricing Geometry</span>
                        <span className="text-slate-900">{selectedInsight.scoreBreakdown.budget} <span className="text-slate-400">/ 15</span></span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(selectedInsight.scoreBreakdown.budget / 15) * 100}%` }}></div>
                     </div>
                  </div>

                  {/* Layout */}
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-slate-400"/> Layout Dominance</span>
                        <span className="text-slate-900">{selectedInsight.scoreBreakdown.layout} <span className="text-slate-400">/ 20</span></span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(selectedInsight.scoreBreakdown.layout / 20) * 100}%` }}></div>
                     </div>
                  </div>

                  {/* Architecture */}
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400"/> Asset Type Match</span>
                        <span className="text-slate-900">{selectedInsight.scoreBreakdown.architecture} <span className="text-slate-400">/ 10</span></span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(selectedInsight.scoreBreakdown.architecture / 10) * 100}%` }}></div>
                     </div>
                  </div>

                  {/* Amenities */}
                  <div>
                     <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-slate-400"/> Common Cross-Attributes</span>
                        <span className="text-slate-900">+{selectedInsight.scoreBreakdown.amenities} <span className="text-slate-400">pts</span></span>
                     </div>
                     <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((selectedInsight.scoreBreakdown.amenities / 15) * 100, 100)}%` }}></div>
                     </div>
                  </div>
               </div>
               
               <button onClick={() => setSelectedInsight(null)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-black transition-colors mt-6">
                  Close Visualization
               </button>
            </div>
         </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
