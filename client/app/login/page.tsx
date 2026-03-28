"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);
  
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { mobile, role });
      if (res.data.success) {
        loginAction(res.data.data, res.data.token);
        if (role === 'tenant') router.push('/tenant/home');
        else router.push('/owner/dashboard');
      }
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 items-center justify-center relative">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="bnest" className="w-16 h-16 drop-shadow-sm" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Enter your mobile number to continue</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number</label>
            <input 
              type="tel" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#FF6A3D] focus:ring-2 ring-orange-100 transition-all font-semibold"
              placeholder="Enter 10 digit number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Role</label>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${role === 'tenant' ? 'bg-white shadow text-[#FF6A3D]' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setRole('tenant')}
              >
                Tenant
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${role === 'owner' ? 'bg-white shadow text-[#FF6A3D]' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setRole('owner')}
              >
                Owner
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#FF6A3D] text-white font-bold py-4 rounded-full mt-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>

          <button 
            type="button" 
            onClick={() => router.push('/home')}
            className="text-slate-500 font-semibold text-sm hover:text-slate-800 transition-colors"
          >
            Skip for now (Guest Mode)
          </button>
        </form>
      </div>
    </div>
  );
}
