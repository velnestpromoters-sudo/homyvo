"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, PhoneCall } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SupportBall() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  const handleDragEnd = (event: any, info: any) => {
    // If the user drags a lot, don't trigger a click
    if (Math.abs(info.offset.x) < 5 && Math.abs(info.offset.y) < 5) {
      setIsOpen(!isOpen);
    }
  };

  const supportNumber = "63692 69611";
  
  // Determine text based on role
  // Tenant -> Tenant Support
  // Owner -> Owner & Tenant Support
  // Guest -> Customer Support
  const supportTitle = user?.role === 'owner' 
    ? 'Owner & Tenant Support' 
    : user?.role === 'tenant' 
      ? 'Tenant Support' 
      : 'Customer Support';

  return (
    <>
      <motion.div
        drag
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[90px] right-6 z-[999] w-14 h-14 bg-[#ec38b7] rounded-full shadow-[0_4px_20px_rgba(236,56,183,0.5)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[160px] right-6 z-[998] w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#ec38b7] to-[#801786] p-4 flex justify-between items-center">
              <div>
                <h3 className="font-black text-white">{supportTitle}</h3>
                <p className="text-white/80 text-xs font-medium">We're here to help you.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <a 
                href={`tel:+916369269611`}
                className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">Call Us Now</p>
                  <p className="font-black text-gray-900">+91 {supportNumber}</p>
                </div>
              </a>
              <p className="text-[10px] text-gray-400 text-center font-medium px-2">
                Available Mon-Sat, 9:00 AM - 7:00 PM. Standard call rates may apply.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
