"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/reel/VideoCard';
import SearchBar from '@/components/common/SearchBar';
import BottomBar from '@/components/common/BottomBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthModalStore } from '@/store/authModalStore';

// Mock Data: 5 Vertical Video Properties
const MOCK_REELS = [
  {
    id: 'prop_101',
    video: 'https://cdn.pixabay.com/video/2019/07/26/25556-351147055_tiny.mp4',
    images: ['/mockups/exterior.png', '/mockups/living.png', '/mockups/bed.png'],
    rent: 25000,
    area: 'RSpuram',
    district: 'Coimbatore',
    matchScore: 98,
    moveInReady: true,
  },
  {
    id: 'prop_102',
    video: 'https://cdn.pixabay.com/video/2019/11/05/28807-372134591_tiny.mp4',
    images: ['https://images.unsplash.com/photo-1560184897-ae75f418c935?w=400', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', 'https://images.unsplash.com/photo-1620626011761-9ea018903148?w=400'],
    rent: 18000,
    area: 'Saibaba Colony',
    district: 'Coimbatore',
    matchScore: 85,
    moveInReady: false,
  },
  {
    id: 'prop_103',
    video: 'https://cdn.pixabay.com/video/2019/10/22/28169-368595604_tiny.mp4',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400', 'https://images.unsplash.com/photo-1600607687931-5781ebca4205?w=400'],
    rent: 32000,
    area: 'Peelamedu',
    district: 'Coimbatore',
    matchScore: 92,
    moveInReady: true,
  },
  {
    id: 'prop_104',
    video: 'https://cdn.pixabay.com/video/2021/08/25/86278-592659102_tiny.mp4',
    images: ['https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=400', 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
    rent: 15000,
    area: 'Ganapathy',
    district: 'Coimbatore',
    matchScore: 88,
    moveInReady: true,
  },
  {
    id: 'prop_105',
    video: 'https://cdn.pixabay.com/video/2020/06/17/42240-431878345_tiny.mp4',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', 'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?w=400', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400'],
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

  
  // States
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { locationName, setLocation } = useLocationStore();

  // 1. Dual-Fallback Geolocation Architecture (Mappls Proxy -> BigDataCloud)
  useEffect(() => {
    // Only detect if user hasn't physically set their location manually yet
    if (locationName === '📍 Select Location' && 'geolocation' in navigator) {
      setLocation('Locating...');
      
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            let detected = null;

            // Strategy 1: Attempt highly-accurate Mappls via secure Backend Proxy
            try {
              const mapplsRes = await fetch(`/api/location?lat=${latitude}&lng=${longitude}`);
              const mapplsData = await mapplsRes.json();
              if (mapplsData.success && mapplsData.location) {
                detected = mapplsData.location;
              }
            } catch (proxyErr) {
               console.warn("Mappls proxy crashed natively.", proxyErr);
            }

            // Strategy 2: If Mappls failed (or returned false), blindly default to BigDataCloud
            if (!detected) {
               console.log("Failing gracefully to BigDataCloud fallback...");
               const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
               const bdcData = await bdcRes.json();
               detected = bdcData.locality || bdcData.city || bdcData.principalSubdivision;
            }

            setLocation(`📍 ${detected || 'Unknown Area'}`, { lat: latitude, lng: longitude });

          } catch (error) {
            console.error('Total Geocoding failure:', error);
            setLocation('📍 Select Location');
          }
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setLocation('📍 Select Location');
        }
      );
    }
  }, [locationName, setLocation]);

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

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden">
      
      {/* Header overlays that sit above the snapping videos */}
      <div className="absolute top-0 left-0 right-0 z-[50] p-5 mt-2 flex items-center justify-center pointer-events-none">
         <div className="w-full pointer-events-auto">
             <SearchBar />
         </div>
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
            images={reel.images}
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
