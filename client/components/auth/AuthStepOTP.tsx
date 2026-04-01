import React, { useState } from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function AuthStepOTP() {
  const { email, otp, setField, nextStep, prevStep } = useAuthModalStore();
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits');
      return;
    }
    
    setVerifying(true);
    setError('');
    
    try {
      // In this architecture, we do not verify immediately at step 2 because the prompt mandated POST /auth/login (which is now /verify-otp) happens AFTER name/role collection.
      // Wait, if verification happens at the end, Step 2 is merely local state capture.
      // Let's just navigate to next step. Validation happens on definitive submit!
      
      setVerifying(false);
      nextStep();
    } catch (err: any) {
      setVerifying(false);
      setError('Invalid code');
    }
  };

  return (
    <div className="w-full flex flex-col pt-4 relative">
      <button onClick={prevStep} className="absolute -top-4 -left-2 p-2 text-white/50 hover:text-white transition-colors">
         <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 mx-auto">
         <KeyRound className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">Verify Access Code</h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed text-center">
        Enter the 6-digit code sent to <span className="text-white font-bold">{email}</span>
      </p>

      <div className="relative mb-4">
        <input 
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setField('otp', val);
            setError('');
          }}
          placeholder="000000"
          className="w-full bg-black/40 border border-white/20 text-white font-black text-4xl tracking-[1em] text-center pl-[1em] py-5 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
          autoFocus
        />
        {error && <p className="text-red-400 text-xs font-bold mt-2 text-center animate-in fade-in">{error}</p>}
      </div>

      <button 
        onClick={handleVerify}
        disabled={otp.length !== 6 || verifying}
        className="w-full bg-[#FF6A3D] hover:bg-[#ff5522] text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,61,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-4"
      >
        {verifying ? '...' : <>Confirm Code <CheckCircle2 className="w-5 h-5" /></>}
      </button>
    </div>
  );
}
