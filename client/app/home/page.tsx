"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/reel/VideoCard';
import SearchBar from '@/components/common/SearchBar';
import BottomBar from '@/components/common/BottomBar';
import { useAuth } from '@/hooks/useAuth';

// Mock Data: 5 Vertical Video Properties
const MOCK_REELS = [
  {
    id: 'prop_101',
    video: 'https://cdn.pixabay.com/video/2019/07/26/25556-351147055_tiny.mp4',
    rent: 25000,
    area: 'RSpuram',
    district: 'Coimbatore',
    matchScore: 98,
    moveInReady: true,
  },
  {
    id: 'prop_102',
    video: 'https://cdn.pixabay.com/video/2019/11/05/28807-372134591_tiny.mp4',
    rent: 18000,
    area: 'Saibaba Colony',
    district: 'Coimbatore',
    matchScore: 85,
    moveInReady: false,
  },
  {
    id: 'prop_103',
    video: 'https://cdn.pixabay.com/video/2019/10/22/28169-368595604_tiny.mp4',
    rent: 32000,
    area: 'Peelamedu',
    district: 'Coimbatore',
    matchScore: 92,
    moveInReady: true,
  },
  {
    id: 'prop_104',
    video: 'https://cdn.pixabay.com/video/2021/08/25/86278-592659102_tiny.mp4',
    rent: 15000,
    area: 'Ganapathy',
    district: 'Coimbatore',
    matchScore: 88,
    moveInReady: true,
  },
  {
    id: 'prop_105',
    video: 'https://cdn.pixabay.com/video/2020/06/17/42240-431878345_tiny.mp4',
    rent: 45000,
    area: 'Race Course',
    district: 'Coimbatore',
    matchScore: 99,
    moveInReady: true,
  }
];

export default function HomeReelPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // States
  const [activeSlide, setActiveSlide] = useState(0);
  const [locationName, setLocationName] = useState('Detecting...');
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Geolocation Logic with Mappls Enterprise API
  useEffect(() => {
    // Attempt auto-detect
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const mapplsKey = process.env.NEXT_PUBLIC_MAPPLS_API || '';
            const res = await fetch(`https://apis.mappls.com/advancedmaps/v1/${mapplsKey}/rev_geocode?lat=${latitude}&lng=${longitude}`);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
              const locationData = data.results[0];
              // MapmyIndia returns hyper-local boundaries like subLocality, city, district
              const detectedLocation = locationData.subLocality || locationData.city || locationData.district || 'Location Setup';
              setLocationName(`📍 ${detectedLocation}`);
            } else {
              setLocationName('📍 Unknown Area');
            }
          } catch (error) {
            console.error('Failed to deduce location from Mappls:', error);
            setLocationName('📍 Select Location');
          }
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setLocationName('📍 Select Location');
        }
      );
    } else {
      setLocationName('📍 Select Location');
    }
  }, []);

  // 2. Scroll Logic to detect Active Video (Intersection Observer technique via scrolling)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const slideHeight = container.clientHeight;
    // Calculate which slide is currently most visible
    const newActiveIndex = Math.round(container.scrollTop / slideHeight);
    
    if (newActiveIndex !== activeSlide) {
      setActiveSlide(newActiveIndex);
    }
  };

  // Login click handler
  const handleLoginClick = () => {
    if (!isAuthenticated) return router.push('/login');
    if (user?.role === 'tenant') return router.push('/tenant/home');
    if (user?.role === 'owner') return router.push('/owner/dashboard');
    return router.push('/login');
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      
      {/* Header overlays that sit above the snapping videos */}
      <div className="absolute top-0 left-0 right-0 z-20 p-5 mt-2 flex items-center gap-3">
        <button 
          onClick={handleLoginClick}
          className="shrink-0 bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl px-4 py-2.5 rounded-full text-white/90 font-bold text-sm active:scale-95 transition-all flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF6A3D] animate-pulse"></div>
          {isAuthenticated ? 'Dash' : 'Sign In'}
        </button>
        <SearchBar />
      </div>

      {/* Snap Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {MOCK_REELS.map((reel, index) => (
          <VideoCard 
            key={reel.id}
            id={reel.id}
            video={reel.video}
            rent={reel.rent}
            area={reel.area}
            district={reel.district}
            matchScore={reel.matchScore}
            moveInReady={reel.moveInReady}
            isActive={index === activeSlide}
          />
        ))}
      </div>

      <BottomBar location={locationName} viewMode="reel" />

      {/* CSS to hide scrollbar cross-browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
