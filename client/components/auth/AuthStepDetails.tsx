import React from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { UserCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AuthStepDetails() {
  const { name, setField, nextStep, prevStep } = useAuthModalStore();

  const handleNext = () => {
    if (name.trim().length > 1) {
      nextStep();
    }
  };

  return (
    <div className="w-full flex flex-col pt-4 relative">
      <button onClick={prevStep} className="absolute -top-4 -left-2 p-2 text-white/50 hover:text-white transition-colors">
         <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 mx-auto">
         <UserCircle2 className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">Who's logging in?</h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed text-center">
        Just your full name to personalize your Bnest experience.
      </p>

      <div className="relative mb-6">
        <label className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2 block ml-1">Full Legal Name</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g. John Doe"
          className="w-full bg-black/40 border border-white/20 text-white font-bold text-lg px-5 py-4 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
          autoFocus
        />
      </div>

      <button 
        onClick={handleNext}
        disabled={name.trim().length < 2}
        className="w-full bg-[#FF6A3D] hover:bg-[#ff5522] text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,61,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
      >
        Continue <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
