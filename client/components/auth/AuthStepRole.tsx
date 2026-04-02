import React, { useState } from 'react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useAuthStore } from '@/store/authStore';
import { Building2, Home, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AuthStepRole() {
  const { email, otp, name, mobile, gender, role, setField, prevStep, closeModal, reset } = useAuthModalStore();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitAuth = async (selectedRole: 'tenant' | 'owner') => {
    setField('role', selectedRole);
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
        name,
        mobile,
        gender,
        role: selectedRole
      });
      
      const { token, data } = response.data;
      login(data, token);
      
      setLoading(false);
      reset();
      closeModal();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Authentication failed. Check your connection.');
    }
  };

  return (
    <div className="w-full flex flex-col pt-4 relative">
      <button onClick={prevStep} className="absolute -top-4 -left-2 p-2 text-white/50 hover:text-white transition-colors" disabled={loading}>
         <ArrowLeft className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-black text-white mb-2 tracking-tight text-center mt-4">Choose your path</h2>
      <p className="text-white/50 text-sm font-medium mb-8 leading-relaxed text-center">
        Are you dynamically hunting for a space or rapidly leasing out?
      </p>

      {error && <p className="text-red-400 text-xs font-bold mb-4 text-center animate-in fade-in bg-red-500/10 py-3 rounded-lg border border-red-500/20">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => submitAuth('tenant')}
          disabled={loading}
          className={`flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all active:scale-95 ${role === 'tenant' ? 'bg-[#FF6A3D]/20 border-[#FF6A3D]' : 'bg-black/40 border-white/10 hover:border-white/30'} ${loading && role !== 'tenant' ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className={`p-4 rounded-full ${role === 'tenant' ? 'bg-[#FF6A3D]' : 'bg-white/10'}`}>
            <Home className={`w-8 h-8 ${role === 'tenant' ? 'text-white' : 'text-white/70'}`} />
          </div>
          <div>
            <span className="font-black text-white block text-lg">Tenant</span>
            <span className="text-xs text-white/50 font-medium">Hunt property</span>
          </div>
          {loading && role === 'tenant' && <Loader2 className="w-5 h-5 text-[#FF6A3D] animate-spin mt-2 block mx-auto" />}
        </button>

        <button 
          onClick={() => submitAuth('owner')}
          disabled={loading}
          className={`flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all active:scale-95 ${role === 'owner' ? 'bg-[#FF6A3D]/20 border-[#FF6A3D]' : 'bg-black/40 border-white/10 hover:border-white/30'} ${loading && role !== 'owner' ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className={`p-4 rounded-full ${role === 'owner' ? 'bg-[#FF6A3D]' : 'bg-white/10'}`}>
            <Building2 className={`w-8 h-8 ${role === 'owner' ? 'text-white' : 'text-white/70'}`} />
          </div>
          <div>
            <span className="font-black text-white block text-lg">Owner</span>
            <span className="text-xs text-white/50 font-medium">List property</span>
          </div>
          {loading && role === 'owner' && <Loader2 className="w-5 h-5 text-[#FF6A3D] animate-spin mt-2 block mx-auto" />}
        </button>
      </div>
    </div>
  );
}
