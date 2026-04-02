import React, { useState } from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AuthStepEmail() {
  const { email, setField, nextStep } = useAuthModalStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOTP = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { email });
      setField('isExistingUser', response.data.isExistingUser || false);
      setField('hasPassword', response.data.hasPassword || false);
      setLoading(false);
      
      if (response.data.hasPassword) {
         setField('step', 6);
      } else {
         setField('step', 2);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send OTP. Check backend connection.');
    }
  };

  return (
    <div className="w-full flex flex-col pt-4">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 mx-auto">
         <Mail className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center">What's your email?</h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed text-center">
        We'll fire a 6-digit verification code to securely bootstrap your session.
      </p>

      <div className="relative mb-4">
        <input 
          type="email"
          value={email}
          onChange={(e) => { setField('email', e.target.value); setError(''); }}
          placeholder="name@example.com"
          className="w-full bg-black/40 border border-white/20 text-white font-bold text-lg px-5 py-4 rounded-xl focus:outline-none focus:border-[#FF6A3D] transition-colors text-center"
          autoFocus
        />
        {error && <p className="text-red-400 text-xs font-bold mt-2 text-center animate-in fade-in">{error}</p>}
      </div>

      <button 
        onClick={handleSendOTP}
        disabled={loading || !email}
        className="w-full bg-[#FF6A3D] hover:bg-[#ff5522] text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(255,106,61,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Authentication Code <ArrowRight className="w-5 h-5" /></>}
      </button>
    </div>
  );
}
