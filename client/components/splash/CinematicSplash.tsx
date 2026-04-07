"use client";

import React, { useEffect, useState } from 'react';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const totalFrames = 43;

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
    }, 50); // 20 FPS = 50ms per frame

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // 3. Routing Hook (Fires precisely when frame 43 hits)
  useEffect(() => {
    if (imagesLoaded && currentFrame === totalFrames) {
      // Add a tiny 200ms buffer after the last frame so users can see it
      const timer = setTimeout(() => {
         onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentFrame, imagesLoaded, onComplete]);

  const padNum = (num: number) => num.toString().padStart(3, '0');

  return (
    <div className="w-full h-[100dvh] relative bg-black overflow-hidden flex items-center justify-center">
      {/* Black background is perfect for video frame borders */}
      
      {!imagesLoaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
             {/* Barebones spinner while loading the 43 frames into cache */}
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
