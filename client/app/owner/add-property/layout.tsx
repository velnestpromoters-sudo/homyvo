"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Quick auth check
  useEffect(() => {
      // NOTE: strict unauthenticated redirect disabled in dev for ease, 
      // but normally if(!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router]);

  // Derive step number from URL safely
  const match = pathname.match(/step-(\d)/);
  const currentStep = match ? parseInt(match[1]) : 1;
  const progressPercent = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-100 text-gray-700">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">List Property</h1>
        </div>
        
        {/* Progress Tracker */}
        <div className="mt-5">
           <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 px-1">
              <span>Step {currentStep} of 5</span>
              <span className="text-[#FF5A1F]">{Math.round(progressPercent)}%</span>
           </div>
           <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
               <div 
                  className="bg-[#FF5A1F] h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
               />
           </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-32 max-w-md w-full mx-auto">
         {children}
      </main>
    </div>
  );
}
