"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SplashPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const totalFrames = 18;

  // 1. Invisible Preloader to guarantee smooth playback
  useEffect(() => {
    let loadedCount = 0;
    const padding = (num: number) => num.toString().padStart(3, '0');
    
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = `/splash-frames/ezgif-frame-${padding(i)}.jpg`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === totalFrames) {
                setImagesLoaded(true);
            }
        };
        // Error handling in case one drops
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalFrames) {
                setImagesLoaded(true);
            }
        };
    }
  }, []);

  // 2. Playback Sequence
  useEffect(() => {
    if (!imagesLoaded) return;

    const interval = setInterval(() => {
        setCurrentFrame((prev) => {
            if (prev >= totalFrames) {
                clearInterval(interval);
                return totalFrames;
            }
            return prev + 1;
        });
    }, 125); // 8 FPS = ~125ms per frame

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // 3. Routing Hook (Fires precisely when frame 18 hits)
  useEffect(() => {
    if (imagesLoaded && currentFrame === totalFrames) {
      // Add a tiny 200ms buffer after the last frame so users can see it
      const timer = setTimeout(() => {
         if (isAuthenticated && user?.role === 'owner') {
             router.push('/home-list');
         } else {
             router.push('/home-list'); // Both tenant and guests go to Home
         }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentFrame, imagesLoaded, isAuthenticated, user, router]);

  const padNum = (num: number) => num.toString().padStart(3, '0');

  return (
    <div className="w-full h-[100dvh] relative bg-black overflow-hidden flex items-center justify-center">
      {/* Black background is perfect for video frame borders */}
      
      {!imagesLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
             {/* Barebones spinner while loading the 18 frames into cache */}
             <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
      )}

      {imagesLoaded && (
         <img 
            src={`/splash-frames/ezgif-frame-${padNum(currentFrame)}.jpg`} 
            alt="Homyvo Loading Sequence" 
            className="w-full h-full object-cover"
         />
      )}
    </div>
  );
}
