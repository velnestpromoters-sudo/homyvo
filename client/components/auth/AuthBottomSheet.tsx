"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthModalStore } from '@/store/authModalStore';
import { X } from 'lucide-react';
import AuthStepEmail from './AuthStepEmail';
import AuthStepOTP from './AuthStepOTP';
import AuthStepSetPassword from './AuthStepSetPassword';
import AuthStepDetails from './AuthStepDetails';
import AuthStepRole from './AuthStepRole';
import AuthStepLogin from './AuthStepLogin';

export default function AuthBottomSheet() {
  const { isOpen, step, closeModal, reset } = useAuthModalStore();

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => reset(), 300);
    }
  }, [isOpen, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-900 border-t border-white/10 rounded-t-[40px] p-6 pb-[env(safe-area-inset-bottom,48px)] shadow-2xl flex flex-col items-center min-h-[50vh] max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: "0 -20px 40px -10px rgba(0,0,0,0.5)" }}
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mb-4 shrink-0" />

            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && <AuthStepEmail />}
                  {step === 2 && <AuthStepOTP />}
                  {step === 3 && <AuthStepSetPassword />}
                  {step === 4 && <AuthStepDetails />}
                  {step === 5 && <AuthStepRole />}
                  {step === 6 && <AuthStepLogin />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
