"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Instagram, Phone, Mail, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Core Scroll Tracker
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ==============================
  // SECTION 1: HERO (0 - 0.2)
  // ==============================
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0vh", "-20vh"]);

  // ==============================
  // SECTION 2: PROBLEM (0.2 - 0.4)
  // ==============================
  const prob1Opacity = useTransform(scrollYProgress, [0.15, 0.22, 0.26, 0.3], [0, 1, 1, 0]);
  const prob1Y = useTransform(scrollYProgress, [0.15, 0.25, 0.3], ["10vh", "0vh", "-10vh"]);

  const prob2Opacity = useTransform(scrollYProgress, [0.25, 0.3, 0.34, 0.38], [0, 1, 1, 0]);
  const prob2Y = useTransform(scrollYProgress, [0.25, 0.34, 0.38], ["10vh", "0vh", "-10vh"]);

  const prob3Opacity = useTransform(scrollYProgress, [0.33, 0.38, 0.45], [0, 1, 0]);
  const prob3Y = useTransform(scrollYProgress, [0.33, 0.45], ["10vh", "-10vh"]);

  // ==============================
  // SECTION 3: SOLUTION (0.4 - 0.6)
  // ==============================
  const solOpacity = useTransform(scrollYProgress, [0.42, 0.48, 0.6], [0, 1, 0]);
  const solY = useTransform(scrollYProgress, [0.42, 0.48], ["20vh", "0vh"]);
  
  const card1Opacity = useTransform(scrollYProgress, [0.46, 0.5], [0, 1]);
  const card1Y = useTransform(scrollYProgress, [0.46, 0.5], [50, 0]);
  
  const card2Opacity = useTransform(scrollYProgress, [0.48, 0.52], [0, 1]);
  const card2Y = useTransform(scrollYProgress, [0.48, 0.52], [50, 0]);
  
  const card3Opacity = useTransform(scrollYProgress, [0.5, 0.54], [0, 1]);
  const card3Y = useTransform(scrollYProgress, [0.5, 0.54], [50, 0]);

  // ==============================
  // SECTION 4: AI ENGINE (0.6 - 0.75)
  // ==============================
  const aiOpacity = useTransform(scrollYProgress, [0.58, 0.62, 0.75, 0.8], [0, 1, 1, 0]);
  const aiBar1Width = useTransform(scrollYProgress, [0.62, 0.68], ["0%", "85%"]);
  const aiBar2Width = useTransform(scrollYProgress, [0.65, 0.72], ["0%", "95%"]);
  const aiBar3Width = useTransform(scrollYProgress, [0.68, 0.75], ["0%", "65%"]);

  // ==============================
  // SECTION 5: EXPERIENCE (0.75 - 0.9)
  // ==============================
  const expOpacity = useTransform(scrollYProgress, [0.73, 0.78, 0.9], [0, 1, 0]);
  const expReelY = useTransform(scrollYProgress, [0.75, 0.95], ["30vh", "-40vh"]);
  const expBlur = useTransform(scrollYProgress, [0.85, 0.95], ["blur(0px)", "blur(10px)"]);

  // ==============================
  // SECTION 6 & 7: CTA + FOOTER (0.9 - 1)
  // ==============================
  const ctaOpacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.88, 0.95], ["10vh", "0vh"]);

  return (
    <div ref={containerRef} className="relative w-full h-[600vh] bg-[#0B0B0F] text-white">
      
      {/* Back Navigation Overlay */}
      <div className="fixed top-6 left-6 z-50">
         <button 
            onClick={() => router.back()} 
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all rounded-full border border-white/10"
         >
           <ChevronLeft className="w-6 h-6 text-white" />
         </button>
      </div>

      {/* Sticky Cinematic Viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">

        {/* 1. HERO INTRO */}
        <motion.div 
           className="absolute flex flex-col items-center justify-center w-full"
           style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
           <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 mb-4 drop-shadow-[0_0_40px_rgba(128,23,134,0.3)]">
              Homyvo
           </h1>
           <p className="text-xl md:text-2xl font-semibold text-slate-300 tracking-tight">
              Find homes. Instantly. Transparently.
           </p>
        </motion.div>


        {/* 2. PROBLEM STATEMENT */}
        <div className="absolute w-full h-full flex flex-col items-center justify-center pointer-events-none">
           <motion.h2 
              className="absolute text-5xl md:text-7xl font-black text-slate-200 tracking-tight text-center"
              style={{ opacity: prob1Opacity, y: prob1Y }}
           >
              Fake listings
           </motion.h2>
           <motion.h2 
              className="absolute text-5xl md:text-7xl font-black text-slate-200 tracking-tight text-center"
              style={{ opacity: prob2Opacity, y: prob2Y }}
           >
              No real availability
           </motion.h2>
           <motion.h2 
              className="absolute text-5xl md:text-7xl font-black text-red-500 tracking-tight text-center drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]"
              style={{ opacity: prob3Opacity, y: prob3Y }}
           >
              No trust
           </motion.h2>
        </div>


        {/* 3. SOLUTION */}
        <motion.div 
           className="absolute w-full h-full flex flex-col items-center justify-center px-4"
           style={{ opacity: solOpacity, y: solY }}
        >
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-16 text-center">
              Homyvo fixes this.
           </h2>
           <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">
              <motion.div style={{ opacity: card1Opacity, y: card1Y }} className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center">
                 <ShieldCheck className="w-12 h-12 text-blue-400 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Verified Listings</h3>
                 <p className="text-sm text-slate-400 font-medium">Zero fake agents. Zero phantom properties.</p>
              </motion.div>
              <motion.div style={{ opacity: card2Opacity, y: card2Y }} className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center">
                 <Clock className="w-12 h-12 text-purple-400 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Real-time Availability</h3>
                 <p className="text-sm text-slate-400 font-medium">If it’s booked, it’s instantly gone.</p>
              </motion.div>
              <motion.div style={{ opacity: card3Opacity, y: card3Y }} className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center">
                 <ShieldCheck className="w-12 h-12 text-emerald-400 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Trust Scores</h3>
                 <p className="text-sm text-slate-400 font-medium">Mathematical transparency building tenant confidence.</p>
              </motion.div>
           </div>
        </motion.div>


        {/* 4. AI ENGINE */}
        <motion.div 
           className="absolute w-full max-w-2xl px-6 flex flex-col items-center justify-center pointer-events-none"
           style={{ opacity: aiOpacity }}
        >
           <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter mb-16 text-center">
              Powered by intelligent matching
           </h2>
           
           <div className="w-full space-y-6">
              <div>
                 <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest px-1">
                    <span>Budget Geometry</span>
                    <span className="text-blue-400">85% Match</span>
                 </div>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-500 rounded-full" style={{ width: aiBar1Width }}></motion.div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest px-1">
                    <span>Layout Dominance</span>
                    <span className="text-purple-400">95% Match</span>
                 </div>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-purple-500 rounded-full" style={{ width: aiBar2Width }}></motion.div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest px-1">
                    <span>Cross-Amenities</span>
                    <span className="text-emerald-400">65% Match</span>
                 </div>
                 <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-500 rounded-full" style={{ width: aiBar3Width }}></motion.div>
                 </div>
              </div>
           </div>
        </motion.div>


        {/* 5. EXPERIENCE */}
        <motion.div 
           className="absolute w-full h-full flex flex-col items-center justify-center pointer-events-none"
           style={{ opacity: expOpacity, filter: expBlur }}
        >
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-12 z-10 drop-shadow-2xl text-center px-4">
              Scroll. Discover. Decide.
           </h2>
           
           {/* Abstract Parallax Background Reels */}
           <div className="absolute inset-0 w-full h-full flex items-center justify-center gap-4 opacity-30 select-none overflow-hidden">
              <motion.div style={{ y: expReelY }} className="w-48 md:w-64 space-y-4">
                 <div className="w-full h-80 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10"></div>
                 <div className="w-full h-80 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10"></div>
              </motion.div>
              <motion.div style={{ y: useTransform(scrollYProgress, [0.75, 0.95], ["-20vh", "30vh"]) }} className="w-48 md:w-64 space-y-4 hidden md:block">
                 <div className="w-full h-96 bg-gradient-to-b from-purple-500/20 to-emerald-500/20 rounded-3xl border border-white/10"></div>
                 <div className="w-full h-96 bg-gradient-to-b from-purple-500/20 to-emerald-500/20 rounded-3xl border border-white/10"></div>
              </motion.div>
              <motion.div style={{ y: expReelY }} className="w-48 md:w-64 space-y-4">
                 <div className="w-full h-64 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10"></div>
                 <div className="w-full h-64 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/10"></div>
              </motion.div>
           </div>
        </motion.div>


        {/* 6 & 7. CTA + FOOTER */}
        <motion.div 
           className="absolute w-full h-full flex flex-col items-center justify-between pointer-events-auto"
           style={{ opacity: ctaOpacity, y: ctaY }}
        >
           <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 text-center px-4">
                 Start your search now
              </h2>
              <button 
                 onClick={() => router.push('/')}
                 className="relative group bg-white text-[#0B0B0F] px-10 py-5 rounded-full font-black text-lg sm:text-xl tracking-tight hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
              >
                 <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-full blur-xl transition-opacity"></span>
                 Explore Homes
              </button>
           </div>

           {/* FOOTER */}
           <div className="w-full min-h-[30vh] bg-black/40 backdrop-blur-2xl border-t border-white/10 flex flex-col items-center justify-center py-10 px-6">
              <h3 className="text-3xl font-black text-white mb-8 tracking-tighter">Connect with Homyvo</h3>
              
              <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm mb-12">
                 <a href="#" className="flex items-center gap-3 text-[#D1D5DB] hover:text-white transition-colors w-full bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 active:scale-95">
                    <Instagram className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold tracking-wide">@homyvo</span>
                 </a>
                 <a href="#" className="flex items-center gap-3 text-[#D1D5DB] hover:text-white transition-colors w-full bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 active:scale-95">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold tracking-wide">+91 XXXXXXXXXX</span>
                 </a>
                 <a href="mailto:velnestpromoters@gmail.com" className="flex items-center gap-3 text-[#D1D5DB] hover:text-white transition-colors w-full bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 active:scale-95">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold tracking-wide line-clamp-1">velnestpromoters@gmail.com</span>
                 </a>
              </div>

              <div className="w-full h-px bg-white/10 max-w-2xl mx-auto mb-6"></div>
              
              <p className="text-sm font-semibold text-[#6B7280] text-center max-w-sm">
                 © 2026 Homyvo. All rights reserved.<br/>Velnest Promoters.
              </p>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
