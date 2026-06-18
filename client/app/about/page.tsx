"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AtSign, Phone, Mail, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Senthil",
    role: "Product manager & Founder of homyvo",
    initials: "S"
  },
  {
    name: "Deepak",
    role: "Project Manager & Business Analyst",
    initials: "D"
  },
  {
    name: "Mahesh",
    role: "UI/UX Designer",
    initials: "M"
  },
  {
    name: "Sudharsan",
    role: "Full Stack Developer",
    initials: "S"
  },
  {
    name: "Sathya",
    role: "Digital Marketing",
    initials: "S"
  },
  {
    name: "Sanjeevi",
    role: "CFO",
    initials: "S"
  }
];

interface TeamMemberBoxProps {
  member: TeamMember;
  scrollYProgress: any;
  range: [number, number];
  heightClass: string;
  gradientFrom: string;
  gradientTo: string;
}

function TeamMemberBox({ member, scrollYProgress, range, heightClass, gradientFrom, gradientTo }: TeamMemberBoxProps) {
  const cardOpacity = useTransform(
    scrollYProgress,
    [range[0] - 0.02, range[0], range[1], range[1] + 0.02],
    [0.15, 1, 1, 0.5]
  );

  const borderOpacity = useTransform(
    scrollYProgress,
    [range[0] - 0.01, range[0], range[1], range[1] + 0.01],
    [0.1, 0.8, 0.8, 0.3]
  );
  
  const cardScale = useTransform(
    scrollYProgress,
    [range[0] - 0.02, range[0], range[1]],
    [0.96, 1.04, 1.0]
  );

  const boxScrollProgress = useTransform(
    scrollYProgress,
    [range[0], range[1]],
    [0, 1]
  );

  const avatarScale = useTransform(
    scrollYProgress,
    [range[0] - 0.01, range[0]],
    [0.8, 1.1]
  );

  const nameWords = member.name.split(" ");
  const roleWords = member.role.split(" ");
  const totalWords = nameWords.length + roleWords.length;

  return (
    <motion.div
      style={{
        opacity: cardOpacity,
        scale: cardScale,
        boxShadow: useTransform(scrollYProgress, [range[0] - 0.01, range[0], range[1]], ["0 0 0 rgba(0,0,0,0)", "0 0 35px rgba(200, 78, 254, 0.25)", "0 0 10px rgba(123, 138, 243, 0.05)"]),
        borderColor: useTransform(scrollYProgress, [range[0] - 0.01, range[0], range[1]], ["rgba(255, 255, 255, 0.1)", "rgba(200, 78, 254, 0.8)", "rgba(123, 138, 243, 0.5)"]),
        borderWidth: "1px",
      }}
      className={`w-full ${heightClass} bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-3xl backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300`}
    >
      {/* Glow shadow inside active card */}
      <motion.div
        style={{
          opacity: useTransform(scrollYProgress, [range[0] - 0.01, range[0], range[1]], [0, 0.2, 0.05])
        }}
        className="absolute inset-0 bg-[#C84EFE] blur-[30px] rounded-3xl -z-20 pointer-events-none"
      />

      {/* Initials Avatar */}
      <motion.div
        style={{ scale: avatarScale }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7B8AF3]/90 to-[#C84EFE]/90 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-[0_0_20px_rgba(200,78,254,0.4)]"
      >
        {member.initials}
      </motion.div>

      {/* Name word-by-word */}
      <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-100 tracking-tight mb-2 flex flex-wrap justify-center">
        {nameWords.map((word, idx) => {
          const start = idx / totalWords;
          const end = (idx + 0.85) / totalWords;
          const wordOpacity = useTransform(boxScrollProgress, [start, end], [0.15, 1]);
          return (
            <motion.span key={idx} style={{ opacity: wordOpacity }} className="mr-1.5 inline-block">
              {word}
            </motion.span>
          );
        })}
      </div>

      {/* Role word-by-word */}
      <div className="text-xs md:text-sm font-semibold text-slate-400 leading-relaxed uppercase tracking-wider flex flex-wrap justify-center">
        {roleWords.map((word, idx) => {
          const actualIdx = nameWords.length + idx;
          const start = actualIdx / totalWords;
          const end = (actualIdx + 0.85) / totalWords;
          const wordOpacity = useTransform(boxScrollProgress, [start, end], [0.15, 1]);
          return (
            <motion.span key={idx} style={{ opacity: wordOpacity }} className="mr-1 inline-block">
              {word}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}

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
  // SECTION 5: EXPERIENCE (0.75 - 0.95)
  // ==============================
  const expOpacity = useTransform(scrollYProgress, [0.73, 0.78, 0.94, 0.98], [0, 1, 1, 0]);
  const expReelY = useTransform(scrollYProgress, [0.75, 0.96], ["25vh", "-45vh"]);
  const expBlur = useTransform(scrollYProgress, [0.93, 0.97], ["blur(0px)", "blur(10px)"]);

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
           <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#7B8AF3] to-[#C84EFE] mb-4 drop-shadow-[0_0_40px_rgba(200,78,254,0.3)]">
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
           
            {/* Abstract Parallax Background Reels showcasing the Homyvo Team */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center gap-4 select-none overflow-hidden">
               {/* Left Column: Member 1 (Top Left) & Member 2 (Bottom Left) */}
               <motion.div style={{ y: expReelY }} className="w-48 md:w-64 space-y-4">
                  <TeamMemberBox
                    member={TEAM_MEMBERS[0]}
                    scrollYProgress={scrollYProgress}
                    range={[0.75, 0.78]}
                    heightClass="h-80"
                    gradientFrom="from-blue-500/20"
                    gradientTo="to-purple-500/20"
                  />
                  <TeamMemberBox
                    member={TEAM_MEMBERS[1]}
                    scrollYProgress={scrollYProgress}
                    range={[0.78, 0.81]}
                    heightClass="h-80"
                    gradientFrom="from-blue-500/20"
                    gradientTo="to-purple-500/20"
                  />
               </motion.div>

               {/* Middle Column: Member 3 (Top Middle) & Member 4 (Bottom Middle) */}
               <motion.div style={{ y: useTransform(scrollYProgress, [0.75, 0.95], ["-20vh", "30vh"]) }} className="w-48 md:w-64 space-y-4 hidden md:block">
                  <TeamMemberBox
                    member={TEAM_MEMBERS[2]}
                    scrollYProgress={scrollYProgress}
                    range={[0.81, 0.84]}
                    heightClass="h-96"
                    gradientFrom="from-purple-500/20"
                    gradientTo="to-emerald-500/20"
                  />
                  <TeamMemberBox
                    member={TEAM_MEMBERS[3]}
                    scrollYProgress={scrollYProgress}
                    range={[0.84, 0.87]}
                    heightClass="h-96"
                    gradientFrom="from-purple-500/20"
                    gradientTo="to-emerald-500/20"
                  />
               </motion.div>

               {/* Right Column: Member 5 (Top Right) & Member 6 (Bottom Right) */}
               <motion.div style={{ y: expReelY }} className="w-48 md:w-64 space-y-4">
                  <TeamMemberBox
                    member={TEAM_MEMBERS[4]}
                    scrollYProgress={scrollYProgress}
                    range={[0.87, 0.90]}
                    heightClass="h-64"
                    gradientFrom="from-blue-500/20"
                    gradientTo="to-purple-500/20"
                  />
                  <TeamMemberBox
                    member={TEAM_MEMBERS[5]}
                    scrollYProgress={scrollYProgress}
                    range={[0.90, 0.93]}
                    heightClass="h-64"
                    gradientFrom="from-blue-500/20"
                    gradientTo="to-purple-500/20"
                  />
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
                 <a 
                    href="https://www.instagram.com/homyvoindia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-3 text-[#D1D5DB] hover:text-white transition-colors w-full bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 active:scale-95"
                 >
                    <svg
                       xmlns="http://www.w3.org/2000/svg"
                       width="20"
                       height="20"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       className="w-5 h-5 text-pink-400"
                    >
                       <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                       <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                       <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="font-semibold tracking-wide">@homyvoindia</span>
                 </a>
                 <a href="tel:+916369269611" className="flex items-center gap-3 text-[#D1D5DB] hover:text-white transition-colors w-full bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 active:scale-95">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold tracking-wide">+91 63692 69611</span>
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
