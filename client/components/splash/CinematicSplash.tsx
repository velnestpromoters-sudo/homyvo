"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Complete the animation sequence after 2.6 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2600); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex items-center justify-center">
      
      {/* 1. White Background + Elegant Logo Reveal */}
      <div className="absolute inset-0 bg-white z-0" />
      
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} 
        className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      >
        <img src="/logo.png" alt="Homyvo Logo" className="w-full h-full object-contain drop-shadow-xl" />
      </motion.div>

      {/* 2. Diagonal Curtain Wrapper (Rotated -45deg) */}
      <motion.div 
        initial={{ x: "-50%", y: "-50%", rotate: -45 }}
        className="absolute z-20 flex flex-col pointer-events-none w-[350vw] h-[350vh] left-[50%] top-[50%]"
      >
        
        {/* Strip 1 - Top Left Pink */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-150vh" }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          className="w-full flex-1 shadow-[0_10px_50px_rgba(0,0,0,0.5)] relative z-10"
          style={{ backgroundColor: '#aa1e91' }}
        />

        {/* Strip 2 - Upper Middle Purple */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-150vh" }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          className="w-full flex-1 shadow-[0_10px_50px_rgba(0,0,0,0.5)] relative z-20"
          style={{ backgroundColor: '#871a90' }}
        />

        {/* Strip 3 - Center Velvet Dark Purple */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "-150vh" }}
          transition={{ duration: 1.0, delay: 0.05, ease: [0.65, 0, 0.35, 1] }}
          className="w-full flex-1 shadow-[0_10px_50px_rgba(0,0,0,0.5)] relative z-30"
          style={{ backgroundColor: '#621685' }}
        />

        {/* Strip 4 - Lower Middle Indigo */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "150vh" }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
          className="w-full flex-1 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] relative z-20"
          style={{ backgroundColor: '#3e1d87' }}
        />

        {/* Strip 5 - Bottom Right Navy */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: "150vh" }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
          className="w-full flex-1 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] relative z-10"
          style={{ backgroundColor: '#211a68' }}
        />

      </motion.div>
    </div>
  );
}
