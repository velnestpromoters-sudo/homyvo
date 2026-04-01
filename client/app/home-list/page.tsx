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

      {/* Fixed Logout Popup - Independent of Header Bounds */}
      {showLogoutMenu && isAuthenticated && user?.role === 'tenant' && (
          <div className="fixed inset-0 z-[999999]" onClick={() => setShowLogoutMenu(false)}>
              <div 
                className="absolute top-24 right-5 bg-white/95 backdrop-blur-3xl shadow-2xl rounded-2xl overflow-hidden py-2 w-40 border border-black/5 animate-in fade-in slide-in-from-top-2"
                onClick={e => e.stopPropagation()}
              >
                  <div className="px-4 py-2 border-b border-black/5 mb-1">
                      <p className="text-black/50 text-[10px] uppercase font-black tracking-widest leading-tight">Logged in</p>
                      <p className="text-black font-bold text-sm truncate">{user?.name || 'Tenant'}</p>
                  </div>
                  <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-[#FF3D3D] font-bold text-sm hover:bg-black/5 active:bg-black/10 transition-colors"
                  >
                      Sign Out
                  </button>
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
