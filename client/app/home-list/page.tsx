"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BottomBar from '@/components/common/BottomBar';
import { Search, SlidersHorizontal, MapPin, GraduationCap, Home, Star, LayoutDashboard, Clock, UserCircle, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthModalStore } from '@/store/authModalStore';
import { useWishlistStore } from '@/store/wishlistStore';
import api from '@/lib/api';

export default function HomeListPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const logout = useAuthStore(state => state.logout);
  const { locationName } = useLocationStore();
  const { openModal } = useAuthModalStore();
  
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [studentProperties, setStudentProperties] = useState<any[]>([]);
  const [familyProperties, setFamilyProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ... rest of the fetch properties logic and JSX
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        if (res.data.success) {
          const fetched = res.data.data || [];
          
          const students: any[] = [];
          const families: any[] = [];
          
          fetched.forEach((p: any) => {
            const isPg = p.propertyType === 'pg';
            const typeStr = isPg ? 'PG' : (p.bhkType || 'Apartment');
            
            const cardData = {
              _id: p._id,
              title: `${p.location?.area || 'Unknown Area'}, ${p.location?.city || ''}`,
              type: typeStr,
              price: `₹${p.rent?.toLocaleString()}`,
              rating: (Math.random() * (5 - 4.2) + 4.2).toFixed(1), // Visual placeholder rating
              img: p.images?.[0] || 'https://picsum.photos/id/1018/400/300'
            };

            // Business logic for sorting into categories
            if (p.preferences?.bachelorAllowed || isPg) {
              students.push(cardData);
            } else {
              families.push(cardData);
            }
          });
          
          setStudentProperties(students);
          setFamilyProperties(families);
        }
      } catch (error) {
        console.error("Failed to fetch property list", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-white pb-24 overflow-x-hidden font-sans text-[#111827]">
      
      <div className="sticky top-0 z-50 bg-white px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div 
             onClick={() => router.push('/about')}
             className="flex items-center gap-0 cursor-pointer active:scale-95 transition-transform"
          >
            <Image src="/logo.svg" alt="Homyvo" width={84} height={84} className="shrink-0 object-contain drop-shadow-md" />
            <h1 className="text-[24px] font-black text-[#111827] tracking-tighter -ml-4">Homyvo</h1>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button 
                onClick={openModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#801786]/10 border border-[#801786]/20 rounded-full text-[#801786] hover:bg-[#801786]/20 transition-colors shadow-sm active:scale-95"
              >
                <UserCircle className="w-4 h-4" />
                <span className="text-sm font-bold">Sign In</span>
              </button>
            )}

            {/* Conditional Tenant Profile Dropdown */}
            {isAuthenticated && user?.role === 'tenant' && (
              <div className="relative">
                 <button 
                   onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                   className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-gray-800 hover:bg-gray-200 transition-colors shadow-sm active:scale-95"
                 >
                   <UserCircle className="w-4 h-4 text-[#801786]" />
                   <span className="text-sm font-bold tracking-tight truncate max-w-[80px]">{user?.name || 'Tenant'}</span>
                 </button>
                 
                 {showLogoutMenu && (
                   <div className="absolute top-10 right-0 z-50 bg-white border border-gray-100 shadow-xl rounded-xl w-36 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <button 
                         onClick={() => {
                            router.push('/tenant/profile');
                            setShowLogoutMenu(false);
                         }}
                         className="flex items-center w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors gap-2"
                      >
                         <UserCircle className="w-4 h-4 text-slate-500" />
                         <span>Profile</span>
                      </button>
                      <div className="h-px bg-slate-100 w-full" />
                      <button 
                         onClick={() => {
                            logout();
                            setShowLogoutMenu(false);
                         }}
                         className="flex items-center w-full px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors gap-2"
                      >
                         <LogOut className="w-4 h-4" />
                         <span>Logout</span>
                      </button>
                   </div>
                 )}
              </div>
            )}

            {/* Conditional Owner Dashboard Button */}
            {isAuthenticated && user?.role === 'owner' && (
              <Link href="/owner/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm active:scale-95">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold">Owner Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div onClick={() => router.push('/search')} className="flex items-center bg-white border border-[#E5E7EB] rounded-full h-[56px] px-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <Search className="w-5 h-5 text-[#111827] shrink-0" />
            <div className="flex-1 px-3 flex flex-col justify-center">
              <span className="text-sm font-semibold text-[#111827] leading-tight">Search on Homyvo</span>
              <span className="text-xs text-[#6B7280] leading-tight mt-0.5">Anywhere • Any week</span>
            </div>
            <div className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#111827]" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-8 mt-2">
        
        {/* 3. HERO SECTION */}
        <div className="w-full rounded-2xl p-6 bg-gradient-to-b from-[#b22394] to-[#1819a8] flex flex-col justify-center min-h-[140px] md:min-h-[160px] shadow-sm relative overflow-hidden">
          {/* Subtle fade backdrop shape */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent blur-md"></div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">Find your perfect stay</h2>
          <p className="text-white/90 text-sm leading-snug lg:max-w-xs">Discover student-friendly apartments and family homes</p>
        </div>

        {/* 4. CATEGORY CARDS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#F9FAFB] p-4 flex items-start gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] text-sm">Student / Bachelor</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{studentProperties.length}+ Affordable stays</p>
            </div>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] p-4 flex items-start gap-3">
             <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
              <Home className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] text-sm">Family</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">{familyProperties.length}+ Family homes</p>
            </div>
          </div>
        </div>

        {/* 5. TRENDING NOW (Placeholder) */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Trending Now</h2>
            <p className="text-sm text-[#6B7280]">Popular places in Tamil Nadu</p>
          </div>
          <div className="w-full bg-[#111827]/5 border border-[#111827]/10 rounded-2xl h-[120px] flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-[#111827]/40 mb-2" />
            <h3 className="font-semibold text-[#111827]/60 text-sm">Will be updated soon</h3>
          </div>
        </section>

        {/* 6. STUDENT & BACHELOR */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Student & Bachelor</h2>
            <p className="text-sm text-[#6B7280]">Affordable rooms near colleges</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x min-h-[150px]">
             {isLoading ? (
               <div className="w-full flex justify-center py-4">
                 <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : studentProperties.length > 0 ? (
               <HorizontalScrollCards items={studentProperties} router={router} />
             ) : (
               <div className="text-sm text-[#6B7280] italic ml-1">No bachelor stays available currently.</div>
             )}
          </div>
        </section>

        {/* 7. FAMILY HOMES */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Family Homes</h2>
            <p className="text-sm text-[#6B7280]">Spacious homes for families</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x min-h-[150px]">
            {isLoading ? (
               <div className="w-full flex justify-center py-4">
                 <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : familyProperties.length > 0 ? (
               <HorizontalScrollCards items={familyProperties} router={router} />
             ) : (
               <div className="text-sm text-[#6B7280] italic ml-1">No family homes available currently.</div>
             )}
          </div>
        </section>

        {/* 8. POPULAR LOCATIONS */}
        <section className="mb-4">
           <div className="bg-[#F3F4F6] rounded-2xl p-2">
             {['Coimbatore, Tamil Nadu', 'Chennai, Tamil Nadu', 'Madurai, Tamil Nadu'].map((loc, i) => (
               <div key={i} className="flex items-center gap-4 p-3 border-b border-gray-200/50 last:border-0 active:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                 <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0">
                   <MapPin className="w-5 h-5 text-[#111827]" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-sm font-semibold text-[#111827]">{loc}</h3>
                   <p className="text-xs text-[#6B7280] mt-0.5">View properties</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* SEO BRAND SIGNAL */}
        <div className="py-6 flex justify-center text-center">
            <span className="text-xs font-medium text-gray-400">Homyvo – Trusted Rental Platform in Tamil Nadu</span>
        </div>

      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomBar location={locationName} viewMode="list" />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Reusable card for property horizontal scrolls
function HorizontalScrollCards({ items, router }: { items: any[], router: any }) {
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlistStore();

  return (
    <>
      {items.map((item, i) => (
        <div key={i} onClick={() => router.push(`/property/${item._id}`)} className="w-[240px] shrink-0 snap-start group cursor-pointer hover:opacity-90 active:scale-95 transition-all">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 relative">
            <Image src={item.img} alt={item.title} fill sizes="240px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
            
            <button 
               onClick={(e) => {
                  e.stopPropagation();
                  const isSaved = wishlist.some(w => w._id === item._id);
                  if (isSaved) {
                     removeFromWishlist(item._id);
                  } else {
                     addToWishlist({
                         _id: item._id,
                         title: item.title,
                         price: parseInt(item.price.replace(/\D/g, '')),
                         typeStr: item.type,
                         img: item.img
                     });
                  }
               }}
               className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 flex items-center justify-center hover:bg-white active:scale-90 transition-transform z-10"
            >
               <Heart className={`w-4 h-4 ${wishlist.some(w => w._id === item._id) ? 'fill-[#ec38b7] text-[#ec38b7]' : 'text-slate-400'}`} />
            </button>
          </div>
          <div className="mb-0.5">
            <h3 className="font-semibold text-[#111827] text-sm leading-tight">{item.title}</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">{item.type}</p>
          <p className="text-sm font-semibold text-[#111827]">
            {item.price} <span className="font-normal text-[#6B7280]">/ month</span>
          </p>
        </div>
      ))}
    </>
  );
}
