"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Phone, Mail, ShieldCheck, Check, Save, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, token, login, hasHydrated } = useAuthStore();
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [gender, setGender] = useState(user?.gender || '');
  
  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({ listings: 0, views: 0, unlocks: 0 });

  // Sync state once user is rehydrated / loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setGender(user.gender || '');
    }
  }, [user]);

  // Redirect if not logged in or role is not owner
  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.push('/home-list');
      return;
    }
    if (user?.role !== 'owner') {
      router.push('/home-list');
      return;
    }

    // Fetch owner listings & analytics to show nice statistics
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/properties/owner-analytics');
        if (res.data.success) {
          const analyticsData = res.data.data || [];
          const totalListings = analyticsData.length;
          const totalViews = analyticsData.reduce((acc: number, item: any) => acc + (item.views || 0), 0);
          const totalUnlocks = analyticsData.reduce((acc: number, item: any) => acc + (item.unlocks || 0), 0);
          setStats({ listings: totalListings, views: totalViews, unlocks: totalUnlocks });
        }
      } catch (err) {
        console.error("Failed to load owner analytics:", err);
      }
    };
    fetchAnalytics();
  }, [token, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await api.put('/auth/profile', {
        name,
        mobile,
        gender
      });

      if (response.data.success) {
        // Update user state inside Zustand authStore
        const updatedUser = response.data.data;
        if (token) {
          login(updatedUser, token);
        }
        setSuccessMessage('Profile details updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const userAvatar = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Owner')}&background=801786&color=fff&size=150`;

  if (!hasHydrated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#801786] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 font-sans text-gray-900 overflow-x-hidden">
      
      {/* Header Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm px-4 py-4 flex items-center justify-between z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/home-list')} 
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-slate-800">Owner Profile</h1>
        </div>
        <div className="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
           <ShieldCheck className="w-4 h-4 text-indigo-500" />
           <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Verified Owner</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 flex flex-col gap-6 mt-2">
         
         {/* Top Bio Avatar Display Card */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex items-center gap-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <img src={userAvatar} alt="avatar" className="w-20 h-20 rounded-full shadow-md object-cover relative z-10 border-2 border-white" />
            
            <div className="relative z-10 flex-1">
               <h2 className="text-xl font-black text-slate-900 mb-1">{user?.name || "Owner Stay"}</h2>
               <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                     <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email || "No Email"}
                  </span>
                  <span className="flex items-center gap-1.5">
                     <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.mobile || "No Mobile"}
                  </span>
               </div>
            </div>
         </div>

         {/* Property Analytics Mini Dashboard */}
         <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1">
               <span className="text-2xl font-black text-slate-800">{stats.listings}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Listings</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1">
               <span className="text-2xl font-black text-slate-800">{stats.views}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Views</span>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-1">
               <span className="text-2xl font-black text-slate-800">{stats.unlocks}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unlocks</span>
            </div>
         </div>

         {/* Main Editable Profile Form */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-50 pb-2">
             Edit Profile Information
           </h3>

           {successMessage && (
             <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs font-bold flex items-center gap-2 animate-in fade-in">
               <Check className="w-4 h-4 shrink-0 text-emerald-600" />
               {successMessage}
             </div>
           )}

           {errorMessage && (
             <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-bold animate-in fade-in">
               {errorMessage}
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-5">
             {/* Name */}
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name</label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <User className="h-4 w-4 text-slate-400" />
                 </span>
                 <input
                   type="text"
                   required
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#801786]/20 focus:border-[#801786]"
                   placeholder="Your Name"
                 />
               </div>
             </div>

             {/* Mobile Number */}
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Phone className="h-4 w-4 text-slate-400" />
                 </span>
                 <input
                   type="tel"
                   required
                   value={mobile}
                   onChange={(e) => setMobile(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#801786]/20 focus:border-[#801786]"
                   placeholder="e.g. 9988776655"
                 />
               </div>
             </div>

             {/* Gender */}
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gender</label>
               <select
                 value={gender}
                 onChange={(e) => setGender(e.target.value)}
                 className="w-full px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#801786]/20 focus:border-[#801786] bg-white"
               >
                 <option value="">Unspecified</option>
                 <option value="male">Male</option>
                 <option value="female">Female</option>
                 <option value="other">Other</option>
               </select>
             </div>

             {/* Email (Static) */}
             <div>
               <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address (Registered)</label>
               <div className="relative opacity-65">
                 <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Mail className="h-4 w-4 text-slate-400" />
                 </span>
                 <input
                   type="email"
                   disabled
                   value={user?.email || ''}
                   className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 cursor-not-allowed"
                 />
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-col gap-3 pt-4 border-t border-slate-50 mt-6">
               <button
                 type="submit"
                 disabled={isSaving}
                 className="w-full bg-[#801786] hover:bg-[#961c9e] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
               >
                 <Save className="w-4 h-4" />
                 {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
               </button>
               
               <button
                 type="button"
                 onClick={() => router.push('/owner/dashboard')}
                 className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-sm border border-slate-200 transition-all active:scale-98 flex items-center justify-center gap-2"
               >
                 <LayoutDashboard className="w-4 h-4 text-slate-500" />
                 Go to Owner Listings Dashboard
               </button>
             </div>
           </form>
         </div>
      </div>
    </div>
  );
}
