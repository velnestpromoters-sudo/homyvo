"use client";

import React, { useEffect, useMemo } from 'react';
import { motion, useAnimationControls, Variants } from 'framer-motion';

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  const controlsSpheres = useAnimationControls();
  const controlsBg = useAnimationControls();
  const controlsB = useAnimationControls();
  const controlsRoof = useAnimationControls();
  const controlsNest = useAnimationControls();

  // Memoize random base sphere coordinates so they don't regenerate on re-renders
  const spheres = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 1200,
    size: Math.random() * 200 + 100,
    blur: Math.random() * 20 + 10,
    color: ['#FF5A1F', '#FF7A3C', '#FFB199'][i % 3]
  })), []);

  const sphereVariants: Variants = {
      initial: (i: number) => ({ 
          opacity: 1, 
          scale: 0.8, 
          x: spheres[i].x, 
          y: spheres[i].y,
          filter: `blur(${spheres[i].blur}px)`
      }),
      parallax: { 
          scale: [0.8, 1.2], 
          y: [0, -50], 
          opacity: 1, 
          transition: { duration: 1.2, ease: "easeInOut" } 
      },
      scatter: (i: number) => ({ 
          scale: 2, 
          x: spheres[i].x * 2.5, 
          y: spheres[i].y * 2.5, 
          opacity: 0.15, 
          transition: { duration: 1.0, ease: "easeOut" } 
      }),
      hide: { 
          opacity: 0, 
          scale: 3, 
          transition: { duration: 0.8, ease: "easeIn" } 
      }
  };

  useEffect(() => {
    // Master Animation Choreographer (5000ms Timeline)
    const runSequence = async () => {
      
      // 0ms - 1200ms: Spheres Parallax In
      controlsSpheres.start("parallax");

      // Wait exactly 1200ms
      await new Promise(r => setTimeout(r, 1200));

      // 1200ms: Scatter Spheres & Fade BG
      controlsSpheres.start("scatter");
      controlsBg.start({
        backgroundColor: "#F5F5F5",
        transition: { duration: 1.0, ease: "easeInOut" }
      });

      // Wait until 2200ms timeline mark
      await new Promise(r => setTimeout(r, 1000));

      // 2200ms - 3000ms: "B" letter handwriting draw effect
      controlsB.start({
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.8, ease: "easeOut" }
      });

      // Wait til 2600ms
      await new Promise(r => setTimeout(r, 400));

      // 2600ms - 3200ms: Roof Drops from top
      controlsRoof.start({
        y: [-150, 0],
        opacity: [0, 1],
        transition: { duration: 0.6, type: "spring", bounce: 0.4 }
      });

      // Wait til 3000ms
      await new Promise(r => setTimeout(r, 400));

      // 3000ms - 3600ms: Nest fades in
      controlsNest.start({
        opacity: [0, 1],
        scale: [0.85, 1],
        transition: { duration: 0.6, ease: "easeOut" }
      });

      // Wait til 3200ms
      await new Promise(r => setTimeout(r, 200));

      // 3200ms: Pure White final cleanup
      controlsSpheres.start("hide");
      controlsBg.start({
        backgroundColor: "#FFFFFF",
        transition: { duration: 0.8, ease: "easeInOut" }
      });

      // 4000ms - 5000ms: Hold final static frame
      await new Promise(r => setTimeout(r, 1800));

      // Execute redirect callback at exactly 5000ms
      onComplete();
    };

    runSequence();
  }, [controlsSpheres, controlsBg, controlsB, controlsRoof, controlsNest, onComplete]);

  return (
    <motion.div 
      animate={controlsBg}
      initial={{ backgroundColor: "#000000" }}
      className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center font-sans tracking-wide"
    >
      {/* 1. Organic Spheres Layer */}
      {spheres.map((sphere, index) => (
        <motion.div
           key={sphere.id}
           custom={index}
           variants={sphereVariants}
           initial="initial"
           animate={controlsSpheres}
           style={{
             position: 'absolute',
             width: sphere.size,
             height: sphere.size,
             borderRadius: '50%',
             backgroundColor: sphere.color,
             mixBlendMode: 'screen',
           }}
        />
      ))}

      {/* 2. Logo Container */}
      <div className="relative w-[140px] h-[140px] z-10 flex items-center justify-center drop-shadow-xl">
        <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] overflow-visible">
            {/* The Roof SVG (Chevron) */}
            <motion.path
                animate={controlsRoof}
                initial={{ opacity: 0, y: -150 }}
                d="M 20 50 L 50 20 L 80 50"
                fill="none"
                stroke="#FF5A1F"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* The Nest (Semi-Circle Base) */}
            <motion.path
              animate={controlsNest}
              initial={{ opacity: 0, scale: 0.85 }}
              d="M 20 60 A 30 20 0 0 0 80 60 Z"
              fill="#FFB199"
            />
            {/* The Dynamic "B" Handwriting Draw */}
            <motion.path
               animate={controlsB}
               initial={{ pathLength: 0, opacity: 0 }}
               d="M 40 35 L 40 85 M 40 60 C 65 60 70 85 45 85 M 40 35 C 60 35 65 60 45 60"
               fill="none"
               stroke="#FF5A1F"
               strokeWidth="10"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
        </svg>
      </div>
    </motion.div>
  );
}
