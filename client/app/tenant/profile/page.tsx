"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserCircle, Phone, Mail, MapPin, Key, Heart, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function TenantProfilePage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { wishlist } = useWishlistStore();
  
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
       router.push('/home'); // Security redirect
       return;
    }
    
    const fetchInteractions = async () => {
      try {
         const res = await fetch('/api/interactions/tenant/my-interactions', {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const json = await res.json();
         if (json.success) {
            setInteractions(json.data);
         }
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    
    fetchInteractions();
  }, [token, router]);

  const activeDeals = interactions.filter(i => i.interactionStage !== 'finalized' && i.interactionStage !== 'rejected');
  
  // Dynamic UI Avatar Generator
  const userAvatar = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Tenant')}&background=random&size=150`;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-900 overflow-x-hidden">
      {/* Header Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm px-4 py-4 flex items-center justify-between z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-slate-800">My Profile</h1>
        </div>
        <div className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
           <ShieldCheck className="w-4 h-4 text-indigo-500" />
           <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">{user?.role} Access</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6 mt-2">
         
         {/* Top Bio Card */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex items-center gap-5">
            {/* Abstract Design Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <img src={userAvatar} alt="avatar" className="w-20 h-20 rounded-full shadow-md object-cover relative z-10 border-2 border-white" />
            
            <div className="relative z-10 flex-1">
               <h2 className="text-2xl font-black text-slate-900 mb-1">{user?.name || "Guest Tenant"}</h2>
               <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                     <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || "No Email Provided"}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                     <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.mobile || "No Mobile Provided"}
                  </p>
                  {user?.gender && (
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Gender: {user.gender}
                     </p>
                  )}
               </div>
            </div>
         </div>

         {/* Usage Analytics Grid */}
         <h3 className="font-bold text-slate-800 px-1 mt-2">Your Dashboard</h3>
         <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1">
               <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-1">
                  <Key className="w-5 h-5 text-[#ec38b7]" />
               </div>
               <p className="text-2xl font-black text-slate-800">{interactions.length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unlocked</p>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1" onClick={() => router.push('/wishlist')}>
               <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-1">
                  <Heart className="w-5 h-5 text-red-500" />
               </div>
               <p className="text-2xl font-black text-slate-800">{wishlist.length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved</p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1">
               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
               </div>
               <p className="text-2xl font-black text-slate-800">{activeDeals.length}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</p>
            </div>
         </div>

         {/* Active Pipeline List */}
         <div className="mt-4">
            <h3 className="font-bold text-slate-800 px-1 mb-4 flex items-center justify-between">
               <span>Tracking Pipelines</span>
               {interactions.length > 0 && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{interactions.length} Total</span>}
            </h3>
            
            {loading ? (
               <div className="w-full text-center py-10">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent mx-auto rounded-full animate-spin mb-3" />
               </div>
            ) : interactions.length === 0 ? (
               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
                  <MapPin className="w-8 h-8 text-slate-300" />
                  You haven't unlocked any properties for tracking yet.
               </div>
            ) : (
               <div className="flex flex-col gap-3">
                  {interactions.map(deal => {
                     const isRejected = deal.interactionStage === 'rejected';
                     const isFinalized = deal.interactionStage === 'finalized';
                     
                     return (
                        <div key={deal._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex gap-3 items-center active:scale-[0.98] transition-transform" onClick={() => router.push(`/tracking/${deal._id}`)}>
                           <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                              <img src={deal.property?.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="prop" />
                              {isRejected && <div className="absolute inset-0 bg-red-500/30 backdrop-blur-[1px]" />}
                           </div>
                           
                           <div className="flex-1 overflow-hidden pr-2">
                              <h4 className="font-black text-slate-800 text-sm truncate mb-0.5">{deal.property?.title || 'Unknown Property'}</h4>
                              <p className="text-[11px] font-semibold text-slate-400 mb-2 truncate">{deal.property?.location?.area}</p>
                              
                              <div className="flex items-center justify-between">
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                    isRejected ? 'bg-red-50 text-red-600' :
                                    isFinalized ? 'bg-green-50 text-green-600' :
                                    'bg-indigo-50 text-indigo-600'
                                 }`}>
                                    {deal.interactionStage?.replace('_', ' ')}
                                 </span>
                              </div>
                           </div>
                           
                           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
         </div>

      </div>
    </div>
  );
}
