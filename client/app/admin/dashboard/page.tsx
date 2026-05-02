"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Image from 'next/image';
import { Users, Home, Key, TrendingUp, TrendingDown, LogOut, Loader2, ShieldCheck, UserCircle2 } from 'lucide-react';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
}

interface AdminStats {
  owners: AdminUser[];
  tenants: AdminUser[];
  properties: {
    total: number;
    active: number;
  };
  unlocks: number;
  growth: {
    percentage: number;
    trend: 'up' | 'down';
    recentSignups: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalData, setModalData] = useState<{title: string, users: AdminUser[]} | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch admin statistics');
        if (err.response?.status === 401 || err.response?.status === 403) {
           logout();
           router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user, router, logout]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center font-sans">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm animate-pulse">Syncing platform metrics...</p>
         </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center font-sans p-4">
         <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md w-full text-center">
            <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Access Revoked</h3>
            <p className="text-red-400 text-sm mb-6">{error || 'Session expired or unauthorized.'}</p>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors text-sm font-medium">
               Return to Login
            </button>
         </div>
      </div>
    );
  }

  const cards = [
    { 
      title: 'Total Users', 
      value: stats.owners.length + stats.tenants.length, 
      icon: <Users className="w-6 h-6" />, 
      color: 'from-purple-500 to-indigo-500', 
      shadow: 'shadow-purple-500/20',
      onClick: () => setModalData({ title: 'All Platform Users', users: [...stats.owners, ...stats.tenants] })
    },
    { 
      title: 'Total Owners', 
      value: stats.owners.length, 
      icon: <UserCircle2 className="w-6 h-6" />, 
      color: 'from-blue-500 to-indigo-500', 
      shadow: 'shadow-blue-500/20',
      onClick: () => setModalData({ title: 'Platform Owners', users: stats.owners })
    },
    { 
      title: 'Total Tenants', 
      value: stats.tenants.length, 
      icon: <Users className="w-6 h-6" />, 
      color: 'from-fuchsia-500 to-pink-500', 
      shadow: 'shadow-fuchsia-500/20',
      onClick: () => setModalData({ title: 'Platform Tenants', users: stats.tenants })
    },
    { 
      title: 'Active Properties', 
      value: stats.properties.active, 
      icon: <Home className="w-6 h-6" />, 
      color: 'from-emerald-400 to-teal-500', 
      shadow: 'shadow-emerald-500/20',
      onClick: null
    },
    { 
      title: 'Total Unlocks', 
      value: stats.unlocks, 
      icon: <Key className="w-6 h-6" />, 
      color: 'from-amber-400 to-orange-500', 
      shadow: 'shadow-orange-500/20',
      onClick: null
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] font-sans text-slate-200">
      
      {/* Top Navbar */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Homyvo" width={48} height={48} className="object-contain drop-shadow-lg" />
              <span className="text-white font-bold text-lg tracking-tight">Homyvo Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Terminate Session</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
          <p className="text-slate-400">Live metrics and growth vectors from the Homyvo engine.</p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={card.onClick || undefined}
              className={`bg-slate-900/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden group ${card.onClick ? 'cursor-pointer hover:bg-slate-900/60 transition-colors' : ''}`}
            >
              {/* Glow Effect */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-400 font-medium text-sm">{card.title}</div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                  {card.icon}
                </div>
              </div>
              
              <div className="text-4xl font-bold text-white tracking-tight">
                 {card.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Growth Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden"
        >
           <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div>
                 <h2 className="text-2xl font-bold text-white mb-2">App Usage Growth</h2>
                 <p className="text-slate-400 text-sm max-w-md">
                   Comparing new user registrations from the last 30 days against the preceding 30-day period.
                 </p>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 flex flex-col items-center min-w-[160px]">
                    <span className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">New Signups</span>
                    <span className="text-3xl font-bold text-white">+{stats.growth.recentSignups}</span>
                 </div>
                 
                 <div className={`p-6 rounded-2xl border flex flex-col items-center min-w-[160px] ${
                   stats.growth.trend === 'up' 
                     ? 'bg-emerald-500/10 border-emerald-500/20' 
                     : 'bg-red-500/10 border-red-500/20'
                 }`}>
                    <span className={`text-xs uppercase tracking-wider mb-2 font-semibold ${
                      stats.growth.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>30-Day Trend</span>
                    
                    <div className={`flex items-center gap-2 text-3xl font-bold ${
                      stats.growth.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                       {stats.growth.trend === 'up' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                       {stats.growth.percentage}%
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
        
        {/* User Modal Viewer */}
        {modalData && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
              >
                 <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{modalData.title}</h2>
                    <button onClick={() => setModalData(null)} className="text-slate-400 hover:text-white transition-colors">
                       ✕
                    </button>
                 </div>
                 <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {modalData.users.length === 0 ? (
                       <p className="text-slate-500 text-center py-10">No users found.</p>
                    ) : (
                       <div className="space-y-3">
                          {modalData.users.map((u, idx) => (
                             <div key={u._id || idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                   <div className="text-white font-medium">{u.name || 'Unnamed User'}</div>
                                   <div className="text-slate-400 text-xs">{u.email || 'No email provided'}</div>
                                </div>
                                <div className="text-right">
                                   <div className="text-indigo-400 text-sm font-medium">{u.mobile || 'No Phone'}</div>
                                   <div className="text-slate-500 text-[10px] mt-1 uppercase tracking-wider">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>
        )}

      </main>
    </div>
  );
}
