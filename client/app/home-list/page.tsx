"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import BottomBar from '@/components/common/BottomBar';
import { Search, SlidersHorizontal, MapPin, GraduationCap, Home, Star } from 'lucide-react';

const TRENDING_CITIES = [
  { name: 'Coimbatore', count: '350+', img: 'https://images.unsplash.com/photo-1548013146-72479768bcaa?q=80&w=400' },
  { name: 'Chennai', count: '850+', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=400' },
  { name: 'Madurai', count: '240+', img: 'https://images.unsplash.com/photo-1560058356-4d0365774a38?q=80&w=400' },
  { name: 'Tiruppur', count: '120+', img: 'https://images.unsplash.com/photo-1514222788100-642154564077?q=80&w=400' },
  { name: 'Erode', count: '90+', img: 'https://images.unsplash.com/photo-1524492412937-b65746b19a10?q=80&w=400' },
];

const STUDENTS = [
  { title: 'Peelamedu, Coimbatore', type: 'PG • 4 Sharing', price: '₹6,500', rating: 4.5, img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400' },
  { title: 'Saravanampatti, Coimbatore', type: 'Room • 2 Sharing', price: '₹5,000', rating: 4.2, img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=400' },
];

const FAMILIES = [
  { title: 'Saibaba Colony, Coimbatore', type: '2 BHK Apartment', price: '₹12,000', rating: 4.8, img: 'https://images.unsplash.com/photo-1502672260266-1c1c2f4090ab?q=80&w=400' },
  { title: 'R.S. Puram, Coimbatore', type: '3 BHK Independent House', price: '₹22,000', rating: 4.9, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400' },
];

const TRENDING_NOW = [
  { title: 'Anna Nagar, Chennai', type: '3 BHK Luxury', price: '₹35,000', rating: 4.7, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400' },
  { title: 'Velachery, Chennai', type: '1 BHK Apartment', price: '₹14,000', rating: 4.4, img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400' },
];

export default function HomeListPage() {
  const router = useRouter();

  return (
    <div className="relative w-full min-h-screen bg-white pb-24 overflow-x-hidden font-sans text-[#111827]">
      
      {/* 1. TOP NAVBAR & 2. SEARCH BAR */}
      <div className="sticky top-0 z-50 bg-white px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-[36px] h-[36px] rounded-full bg-[#F3F4F6] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
            <img src="/logo.svg" alt="Homyvo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-[18px] md:text-[20px] font-semibold text-[#111827] tracking-tight">Homyvo</h1>
        </div>

        <div className="mt-4">
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-full h-[56px] px-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
        <div className="w-full rounded-2xl p-6 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] flex flex-col justify-center h-[120px] md:h-[150px]">
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
              <h3 className="font-semibold text-[#111827] text-sm">Student</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">250+ Affordable stays</p>
            </div>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] p-4 flex items-start gap-3">
             <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
              <Home className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] text-sm">Family</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">180+ Family homes</p>
            </div>
          </div>
        </div>

        {/* 5. TOP TRENDING CITIES (Infinite Horizontal Marquee) */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Top Trending Cities</h2>
            <p className="text-sm text-[#6B7280]">Popular destinations for rentals</p>
          </div>
          <div className="relative w-full overflow-hidden flex pb-4 -mx-4 px-0">
            <div className="flex gap-4 animate-marquee whitespace-nowrap w-max hover:[animation-play-state:paused]">
              
              {/* Set 1 */}
              {TRENDING_CITIES.map((city, i) => (
                <div key={`set1-${i}`} className="relative w-[160px] md:w-[180px] h-[120px] rounded-xl overflow-hidden shrink-0 shadow-sm cursor-pointer ml-4 first:ml-4">
                  <img src={city.img} alt={city.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-semibold text-sm">{city.name}</h3>
                    <p className="text-white/80 text-[10px]">{city.count} properties</p>
                  </div>
                </div>
              ))}

              {/* Set 2 (Duplicate for seamless continuous loop) */}
              {TRENDING_CITIES.map((city, i) => (
                <div key={`set2-${i}`} className="relative w-[160px] md:w-[180px] h-[120px] rounded-xl overflow-hidden shrink-0 shadow-sm cursor-pointer ml-4">
                  <img src={city.img} alt={city.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-white font-semibold text-sm">{city.name}</h3>
                    <p className="text-white/80 text-[10px]">{city.count} properties</p>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        </section>

        {/* 6. STUDENT & BACHELOR */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Student & Bachelor</h2>
            <p className="text-sm text-[#6B7280]">Affordable rooms near colleges</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
             <HorizontalScrollCards items={STUDENTS} />
          </div>
        </section>

        {/* 7. FAMILY HOMES */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Family Homes</h2>
            <p className="text-sm text-[#6B7280]">Spacious homes for families</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
            <HorizontalScrollCards items={FAMILIES} />
          </div>
        </section>

        {/* 8. TRENDING NOW */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#111827]">Trending Now</h2>
            <p className="text-sm text-[#6B7280]">Popular places in Tamil Nadu</p>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
            <HorizontalScrollCards items={TRENDING_NOW} />
          </div>
        </section>

        {/* 9. POPULAR LOCATIONS */}
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

      </div>

      {/* 10. BOTTOM NAVIGATION */}
      <BottomBar location="" viewMode="list" />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(calc(-50% - 8px)); }
        }
        
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Reusable card for property horizontal scrolls
function HorizontalScrollCards({ items }: { items: any[] }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="w-[240px] shrink-0 snap-start group cursor-pointer">
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-semibold text-[#111827] text-sm truncate mr-2">{item.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#111827] text-[#111827]" />
              <span className="text-xs font-semibold text-[#111827]">{item.rating}</span>
            </div>
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
