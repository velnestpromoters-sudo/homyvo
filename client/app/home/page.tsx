"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/reel/VideoCard';
import BottomBar from '@/components/common/BottomBar';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthModalStore } from '@/store/authModalStore';

import api from '@/lib/api';

interface PropertyFeedData {
  _id: string;
  images: string[];
  rent: number;
  location: {
    area?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };
  matchScore?: number;
  moveInReady?: boolean;
  bhkType?: string;
  preferences?: {
    bachelorAllowed?: boolean;
  };
  propertyType?: 'apartment' | 'pg';
  pgDetails?: {
    gender: 'boys' | 'girls' | 'co-living';
    totalRooms: number;
    sharingTypes: number[];
    rooms: {
      sharing: number;
      totalBeds: number;
      availableBeds: number;
    }[];
  };
}

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
  const { locationName, setLocation, coordinates } = useLocationStore();
  const [properties, setProperties] = useState<PropertyFeedData[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // Sync API Properties
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load property feed", err);
      } finally {
        setIsLoadingFeed(false);
      }
    };
    loadFeed();
  }, []);

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
      
      {/* Snap Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {isLoadingFeed ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#ec38b7] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/60 font-medium animate-pulse">Loading amazing homes...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center">
            <h2 className="text-2xl font-black text-white mb-2">No Homes Nearby</h2>
            <p className="text-white/50 text-sm">Be the first to list a property in your city.</p>
          </div>
        ) : (
          properties.map((reel, index) => {
            // Calculate Haversine Distance if both coords exist
            let distance = undefined;
            if (coordinates && coordinates.lat && reel.location?.lat && reel.location?.lng) {
               const R = 6371; // Earth radius in km
               const dLat = (reel.location.lat - coordinates.lat) * Math.PI / 180;
               const dLon = (reel.location.lng - coordinates.lng) * Math.PI / 180;
               const lat1 = coordinates.lat * Math.PI / 180;
               const lat2 = reel.location.lat * Math.PI / 180;
               const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
               const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
               distance = R * c;
            }

            return (
              <VideoCard 
                key={reel._id || index.toString()}
                id={reel._id}
                video="" 
                images={reel.images}
                rent={reel.rent}
                area={reel.location?.area || 'Unknown Area'}
                district={reel.location?.city || 'Unknown City'}
                matchScore={reel.matchScore || 0}
                moveInReady={Boolean(reel.moveInReady)}
                isActive={index === activeSlide}
                bhkType={reel.bhkType}
                bachelorsAllowed={Boolean(reel.preferences?.bachelorAllowed)}
                distanceKm={distance}
                propertyType={reel.propertyType}
                pgDetails={reel.pgDetails}
              />
            )
          })
        )}
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
