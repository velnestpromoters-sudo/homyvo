import React, { useState } from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useAuthStore } from '@/store/authStore';
import { Lock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AuthStepSetPassword() {
  const { email, otp, password, isExistingUser, setField, prevStep, nextStep, closeModal, reset } = useAuthModalStore();
  const login = useAuthStore((state) => state.login);
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');

    // If they are an existing ghost user (had no password), finalize their login right here!
    // We already have their email, otp, and now password. No need for Step 4/5.
    if (isExistingUser) {
      setLoading(true);
      try {
        const response = await api.post('/auth/verify-otp', { email, otp, password });
        const { token, data } = response.data;
        login(data, token);
        setLoading(false);
        reset();
        closeModal();
      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data?.message || 'Failed to secure account. Try again.');
      }
    } else {
      // New User! They still need to input Details and Role. Just move to the next step.
      nextStep();
    }
  };

  return (
    <div className="w-full flex flex-col pt-4 relative">
      <button onClick={() => setField('step', 2)} className="absolute -top-4 -left-2 p-2 text-white/50 hover:text-white transition-colors" disabled={loading}>
         <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 mx-auto">
         <Lock className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">Secure Your Den</h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed text-center">
        Set a permanent password so you never need an OTP again.
      </p>

      <div className="relative mb-4 flex flex-col gap-3">
        <input 
          type="password"
          value={password || ''}
          onChange={(e) => { setField('password', e.target.value); setError(''); }}
          placeholder="New Password"
          className="w-full bg-black/40 border border-white/20 text-white font-bold text-lg px-5 py-4 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
          autoFocus
        />
        <input 
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
          placeholder="Confirm Password"
          className="w-full bg-black/40 border border-white/20 text-white font-bold text-lg px-5 py-4 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors"
        />
        {error && <p className="text-red-400 text-xs font-bold mt-2 text-center animate-in fade-in">{error}</p>}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || !password || !confirmPassword}
        className="w-full bg-[#FF6A3D] hover:bg-[#ff5522] text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,61,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Password & Continue <ArrowRight className="w-5 h-5" /></>}
      </button>
    </div>
  );
}
