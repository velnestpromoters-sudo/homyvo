"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomBar from '@/components/common/BottomBar';
import SearchBar from '@/components/common/SearchBar';
import { Construction } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthModalStore } from '@/store/authModalStore';

export default function HomeListPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { locationName } = useLocationStore();
  const { openModal } = useAuthModalStore();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const logout = useAuthStore(state => state.logout);

  const handleProfileClick = () => {
    if (!isAuthenticated) return openModal();
    if (user?.role === 'owner') return router.push('/owner/dashboard');
    if (user?.role === 'tenant') setShowLogoutMenu(!showLogoutMenu);
  };

  const handleLogout = () => {
      logout();
      setShowLogoutMenu(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 flex flex-col pt-24 pb-36 px-0 overflow-x-hidden">
      
      {/* Search Header */}
      <div className="absolute top-0 left-0 right-0 h-[104px] pb-4 bg-black rounded-b-[40px] z-20 shadow-lg px-5 flex items-end justify-between gap-3">
         <div className="flex-1">
             <SearchBar />
         </div>
         
         <div className="relative shrink-0 mb-1 z-[9999]">
             <button 
               onClick={handleProfileClick}
               className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl px-4 py-2.5 rounded-full text-white/90 font-bold text-sm hover:bg-white/20 active:scale-95 transition-all flex items-center gap-2"
             >
               <div className="w-2 h-2 rounded-full bg-[#FF6A3D] animate-pulse"></div>
               {isAuthenticated ? (user?.name || 'Tenant') : 'Sign In'}
             </button>
         </div>
      </div>

      {showLogoutMenu && isAuthenticated && user?.role === 'tenant' && (
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-end justify-center pb-12 px-5 animate-in fade-in" onClick={() => setShowLogoutMenu(false)}>
              <div className="bg-[#1A1A1A] w-full max-w-sm rounded-[32px] p-2 animate-in slide-in-from-bottom-8 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="px-5 py-6 border-b border-white/5 text-center flex flex-col items-center gap-1">
                     <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Logged in as</span>
                     <p className="text-white font-black text-2xl">{user?.name || 'Tenant'}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-2">
                     <button 
                         onClick={handleLogout}
                         className="w-full text-center py-4 bg-[#FF3D3D]/10 text-[#FF3D3D] font-black text-lg hover:bg-[#FF3D3D]/20 active:scale-95 transition-all rounded-[24px]"
                     >
                         Sign Out
                     </button>
                     <button 
                         onClick={() => setShowLogoutMenu(false)}
                         className="w-full text-center py-4 text-white/50 font-bold text-base hover:text-white active:scale-95 transition-all rounded-[24px]"
                     >
                         Cancel
                     </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center text-center mt-10 px-5">
        <div className="w-24 h-24 bg-orange-100/50 rounded-full flex items-center justify-center mb-6 shadow-inner pointer-events-none">
           <Construction className="w-12 h-12 text-[#FF6A3D]" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">List Mode is Building</h1>
        <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto mb-8">
          The classic scrolling grid is currently being wired to the new database API. Please use the immersive Video Reels mode for now!
        </p>
      </div>

      <BottomBar location={locationName} viewMode="list" />
    </div>
  );
}
