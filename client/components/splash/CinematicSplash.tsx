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
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="140pt" height="140pt" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet" className="w-[120px] h-[120px] overflow-visible">
            <motion.g 
               transform="translate(0.000000,140.000000) scale(0.100000,-0.100000)" 
               fill="#FF5A1F" 
               stroke="#FF5A1F"
               strokeWidth="15"
               animate={controlsB}
               initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
               onAnimationComplete={(definition) => {
                  // After it finishes drawing the stroke, pulse the fill opacity!
                  controlsNest.start({ fillOpacity: 1, transition: { duration: 0.8, ease: "easeOut" } });
               }}
            >
                <motion.path
                   animate={controlsNest}
                   initial={{ fillOpacity: 0 }}
                   d="M344 1168 c-4 -7 -8 -57 -8 -112 l-1 -101 -62 -45 c-72 -52 -88 -84 -54 -111 24 -20 45 -16 78 14 40 36 44 18 41 -201 -3 -206 -3 -207 24 -264 154 -328 635 -278 707 74 62 299 -308 527 -571 353 -62 -41 -68 -36 -68 55 l0 79 73 54 c125 92 179 127 197 127 17 0 225 -144 378 -262 72 -55 72 -55 102 -30 36 29 20 60 -55 112 -75 51 -80 64 -71 160 7 78 -3 93 -56 88 -32 -3 -33 -5 -36 -51 -4 -67 -18 -67 -106 -3 -142 106 -180 105 -328 -10 -91 -70 -98 -70 -98 4 0 32 -5 63 -12 70 -15 15 -65 16 -74 0z m528 -501 c153 -70 148 -188 -9 -247 -270 -101 -587 94 -371 228 93 58 277 67 380 19z m93 -283 c-13 -35 -25 -49 -51 -60 -47 -20 -177 -17 -244 6 l-55 18 84 1 c100 1 181 22 236 60 50 35 52 33 30 -25z m-379 -68 c72 -34 125 -47 204 -49 78 -2 79 -16 2 -38 -138 -39 -283 17 -343 133 -34 66 -23 73 33 24 29 -25 76 -57 104 -70z"
                />
            </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}
