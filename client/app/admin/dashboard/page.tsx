"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import Image from 'next/image';
import { Users, Home, Key, TrendingUp, TrendingDown, LogOut, Loader2, ShieldCheck, UserCircle2, Cpu, Zap, Activity, Mail, BookOpen, PlusCircle } from 'lucide-react';

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
  quotas: {
    emailjs: { used: number, limit: number };
    geminiRpd: { used: number, limit: number };
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalData, setModalData] = useState<{ title: string, users: AdminUser[] } | null>(null);

  const [mounted, setMounted] = useState(false);
  
  // Tab controller
  const [activeTab, setActiveTab] = useState<'metrics' | 'blogs'>('metrics');
  
  // Blog publishing states
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [showBlogFormModal, setShowBlogFormModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogError, setBlogError] = useState('');
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [blogForm, setBlogForm] = useState({
     title: '',
     slug: '',
     excerpt: '',
     content: '',
     category: 'Renting Guides',
     author: 'Velnest Admin',
     imageColor: 'from-[#801786] to-[#ec38b7]'
  });

   // MongoDB storage explorer states
   const [dbStats, setDbStats] = useState<any | null>(null);
   const [dbLoading, setDbLoading] = useState(true);
   const [activeCollection, setActiveCollection] = useState<string | null>(null);
   const [collectionDocs, setCollectionDocs] = useState<any[]>([]);
   const [collectionPage, setCollectionPage] = useState(1);
   const [collectionTotal, setCollectionTotal] = useState(0);
   const [collLoading, setCollLoading] = useState(false);
   const [selectedDocJSON, setSelectedDocJSON] = useState<any | null>(null);

   // Cloudinary explorer states
   const [clStats, setClStats] = useState<any | null>(null);
   const [clLoading, setClLoading] = useState(true);
   const [selectedResource, setSelectedResource] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Wait for Zustand to hydrate

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
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user, router, logout, mounted]);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs');
      if (res.data.success) {
        setBlogsList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching blogs in admin:", err);
    }
  };

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>(['Renting Guides', 'SEO & Marketing', 'Tenant Rights']);
    blogsList.forEach(b => {
      if (b.category && b.category.trim()) {
        categoriesSet.add(b.category.trim());
      }
    });
    return Array.from(categoriesSet);
  }, [blogsList]);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalLimit = 512 * 1024 * 1024; // 512 MB
  const spaceCovered = dbStats ? dbStats.storageSize : 0;
  const balanceSpace = dbStats ? Math.max(0, totalLimit - spaceCovered) : 0;
  const usedPct = dbStats ? (spaceCovered / totalLimit) * 100 : 0;

  const clTotalLimit = clStats ? clStats.storageLimit : 0;
  const clSpaceCovered = clStats ? clStats.storageUsed : 0;
  const clBalanceSpace = clStats ? Math.max(0, clTotalLimit - clSpaceCovered) : 0;
  const clUsedPct = clStats && clTotalLimit > 0 ? (clSpaceCovered / clTotalLimit) * 100 : 0;

  const fetchDbStats = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get('/admin/db-stats', { headers });
      if (res.data.success) {
        setDbStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch db stats:", err);
    } finally {
      setDbLoading(false);
    }
  };

  const fetchCollectionData = async (name: string, pageNum: number = 1) => {
    setCollLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`/admin/db-collection/${name}?page=${pageNum}&limit=10`, { headers });
      if (res.data.success) {
        setCollectionDocs(res.data.data.documents);
        setCollectionTotal(res.data.data.total);
        setCollectionPage(pageNum);
        setActiveCollection(name);
      }
    } catch (err) {
      console.error("Failed to fetch collection data:", err);
    } finally {
      setCollLoading(false);
    }
  };

  const fetchClStats = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get('/admin/cloudinary-stats', { headers });
      if (res.data.success) {
        setClStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch Cloudinary stats:", err);
    } finally {
      setClLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin' && activeTab === 'metrics') {
      fetchDbStats();
      fetchClStats();
    }
  }, [token, user, activeTab]);

  useEffect(() => {
    if (token && user?.role === 'admin' && activeTab === 'blogs') {
      fetchBlogs();
    }
  }, [token, user, activeTab]);

  // Handle slug auto-generation from title
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/[\s_-]+/g, '-') // replace spaces/dashes with a single dash
      .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
    
    setBlogForm(prev => ({
      ...prev,
      title: val,
      slug: generatedSlug
    }));
  };

  // Submit Blog Form (Create or Update)
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError('');
    try {
      let res;
      const headers = { Authorization: `Bearer ${token}` };
      const submissionData = { ...blogForm };

      if (showCustomCategoryInput) {
        if (!customCategoryName.trim()) {
          setBlogError('Please enter a custom category name.');
          return;
        }
        submissionData.category = customCategoryName.trim();
      }

      if (editingBlog) {
        res = await api.put(`/blogs/${editingBlog._id}`, submissionData, { headers });
      } else {
        res = await api.post('/blogs', submissionData, { headers });
      }
      
      if (res.data.success) {
        setShowBlogFormModal(false);
        setEditingBlog(null);
        fetchBlogs();
      }
    } catch (err: any) {
      setBlogError(err.response?.data?.message || 'Failed to submit article');
    }
  };

  // Delete Blog Post
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.delete(`/blogs/${id}`, { headers });
      if (res.data.success) {
        fetchBlogs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete article');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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
              <Image src="/logo.svg" alt="Homyvo" width={100} height={100} className="object-contain drop-shadow-md" />
              <span className="text-white font-bold text-lg tracking-tight mr-6">Homyvo Admin</span>
              
              {/* Desktop Tab Selector */}
              <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'metrics' ? 'bg-[#801786] text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Metrics
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('blogs')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'blogs' ? 'bg-[#801786] text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blogs
                </button>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

        {/* Mobile Tab Selector */}
        <div className="flex md:hidden items-center gap-1 bg-white/5 border border-white/5 rounded-2xl p-1 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold text-center transition-all ${
              activeTab === 'metrics' ? 'bg-[#801786] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blogs')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold text-center transition-all ${
              activeTab === 'blogs' ? 'bg-[#801786] text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blogs
          </button>
        </div>

        {activeTab === 'metrics' && (
          <>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              <div className="flex flex-col gap-4">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 flex flex-col items-center min-w-[160px]">
                  <span className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">New Signups</span>
                  <span className="text-3xl font-bold text-white">+{stats.growth.recentSignups}</span>
                </div>

                <div className={`p-6 rounded-2xl border flex flex-col items-center min-w-[160px] ${stats.growth.trend === 'up'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  <span className={`text-xs uppercase tracking-wider mb-2 font-semibold ${stats.growth.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>30-Day Trend</span>

                  <div className={`flex items-center gap-2 text-3xl font-bold ${stats.growth.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                    {stats.growth.trend === 'up' ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                    {stats.growth.percentage}%
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Gemini API Engine Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                     <Cpu className="w-5 h-5 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Gemini AI Limits</h2>
               </div>
               <p className="text-slate-400 text-sm mb-6">
                 Tracker for the Free Tier limits of the Homyvo AI Assistant.
               </p>

               <div className="flex flex-col justify-center gap-4 flex-1">
                  {/* RPM */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <div>
                           <div className="text-white font-bold">Requests Per Minute (RPM)</div>
                           <div className="text-slate-500 text-xs">Limit: 15 / min</div>
                        </div>
                     </div>
                     <div className="text-xl font-black text-white">15<span className="text-slate-500 text-sm ml-1">Max</span></div>
                  </div>
                  {/* RPD */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <div>
                           <div className="text-white font-bold">Requests Per Day (RPD)</div>
                           <div className="text-slate-500 text-xs">Limit: 1,500 / day</div>
                        </div>
                     </div>
                     <div className="text-xl font-black text-white">{1500 - (stats.quotas?.geminiRpd?.used || 0)}<span className="text-slate-500 text-sm ml-1">Left</span></div>
                  </div>
                  {/* TPM */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                        <div>
                           <div className="text-white font-bold">Tokens Per Minute (TPM)</div>
                           <div className="text-slate-500 text-xs">Limit: 1 Million / min</div>
                        </div>
                     </div>
                     <div className="text-xl font-black text-white">1M<span className="text-slate-500 text-sm ml-1">Max</span></div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* EmailJS Limits Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                     <Mail className="w-5 h-5 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">EmailJS Limits</h2>
               </div>
               <p className="text-slate-400 text-sm mb-6">
                 Tracker for the Free Tier limits of transactional emails.
               </p>

               <div className="flex flex-col justify-start gap-4 flex-1">
                  {/* Monthly Emails */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <div>
                           <div className="text-white font-bold">Monthly Quota</div>
                           <div className="text-slate-500 text-xs">Limit: 200 / month</div>
                        </div>
                     </div>
                     <div className="text-xl font-black text-white">{200 - (stats.quotas?.emailjs?.used || 0)}<span className="text-slate-500 text-sm ml-1">Left</span></div>
                  </div>
                  {/* Templates */}
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                        <div>
                           <div className="text-white font-bold">Email Templates</div>
                           <div className="text-slate-500 text-xs">Limit: 2 Templates</div>
                        </div>
                     </div>
                     <div className="text-xl font-black text-white">2<span className="text-slate-500 text-sm ml-1">Max</span></div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* MongoDB Storage Section */}
        {dbStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 mt-6 relative overflow-hidden"
          >
            <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">MongoDB Storage Allocation</h2>
                  <p className="text-slate-400 text-sm">Real-time memory stats, collection allocations, and system index footprint.</p>
                </div>
                <div className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Database: {dbStats.dbName}
                </div>
              </div>

              {/* Progress and allocation breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-950/40 border border-white/5 p-6 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Data Size</span>
                  <span className="text-2xl font-black text-white">{formatBytes(dbStats.dataSize)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Disk Storage Size</span>
                  <span className="text-2xl font-black text-white">{formatBytes(dbStats.storageSize)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Index Footprint</span>
                  <span className="text-2xl font-black text-white">{formatBytes(dbStats.indexSize)}</span>
                </div>
              </div>

              {/* Pie/Donut Storage Balance Chart */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-slate-950/20 border border-white/5 rounded-2xl animate-fade-in">
                 {/* Donut Chart */}
                 <div className="relative w-32 h-32 rounded-full flex items-center justify-center border border-white/5 shadow-inner shrink-0"
                      style={{
                         background: `conic-gradient(#801786 0% ${usedPct.toFixed(4)}%, #ec38b7 ${usedPct.toFixed(4)}% ${(usedPct * 1.5).toFixed(4)}%, #1e293b ${(usedPct * 1.5).toFixed(4)}% 100%)`
                      }}
                 >
                    {/* Donut Center Cutout */}
                    <div className="absolute w-24 h-24 rounded-full bg-[#0f0f13] flex flex-col items-center justify-center shadow-lg border border-white/5">
                       <span className="text-white font-black text-sm">{usedPct.toFixed(3)}%</span>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Used</span>
                    </div>
                 </div>
                 
                 {/* Storage Balance Details */}
                 <div className="flex-1 w-full space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storage Space Balance (Atlas Free Tier)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Space</span>
                          <span className="text-base font-black text-white">512.00 MB</span>
                       </div>
                       <div className="bg-[#801786]/10 p-4 rounded-xl border border-[#801786]/20">
                          <span className="text-[10px] text-[#ec38b7] font-bold uppercase tracking-wider block mb-1">Space Covered</span>
                          <span className="text-base font-black text-white">{formatBytes(spaceCovered)}</span>
                       </div>
                       <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">Balance Space</span>
                          <span className="text-base font-black text-white">{formatBytes(balanceSpace)}</span>
                       </div>
                    </div>
                    
                    {/* Linear representation bar */}
                    <div className="space-y-1.5">
                       <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div style={{ width: `${Math.max(0.5, usedPct)}%` }} className="bg-gradient-to-r from-[#801786] to-[#ec38b7] h-full rounded-full transition-all" />
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>0%</span>
                          <span>Remaining Balance: {(100 - usedPct).toFixed(3)}% Free</span>
                          <span>100%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Stacked Chart representing storage allocation among tables */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Storage Allocation Bar Chart</h3>
                <div className="h-4 w-full bg-slate-950 rounded-full flex overflow-hidden border border-white/5 p-0.5">
                  {dbStats.collections.map((col: any, idx: number) => {
                    const pct = dbStats.dataSize > 0 ? (col.size / dbStats.dataSize) * 100 : 0;
                    if (pct < 1) return null;
                    const colors = [
                      'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 
                      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-fuchsia-500'
                    ];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <div 
                        key={col.name} 
                        style={{ width: `${pct}%` }} 
                        className={`${colorClass} h-full transition-all`}
                        title={`${col.name}: ${pct.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
                {/* Labels legend */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {dbStats.collections.slice(0, 7).map((col: any, idx: number) => {
                    const colors = [
                      'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 
                      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-fuchsia-500'
                    ];
                    const colorClass = colors[idx % colors.length];
                    const pct = dbStats.dataSize > 0 ? (col.size / dbStats.dataSize) * 100 : 0;
                    return (
                      <div key={col.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                        <span className="font-bold text-slate-300">{col.name}</span>
                        <span>({pct.toFixed(1)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collection / Tables List */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Database Collections (Tables)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbStats.collections.map((col: any) => (
                    <div
                      key={col.name}
                      onClick={() => fetchCollectionData(col.name, 1)}
                      className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 hover:border-emerald-500/20 p-5 rounded-2xl cursor-pointer flex items-center justify-between transition group"
                    >
                      <div>
                        <div className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {col.name}
                        </div>
                        <div className="text-slate-400 text-xs mt-1 font-medium">{col.count.toLocaleString()} rows (documents)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300 font-bold text-xs">{formatBytes(col.size)}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5 font-medium">Index: {formatBytes(col.totalIndexSize)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Cloudinary Storage Section */}
        {clStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 mt-6 relative overflow-hidden"
          >
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[200%] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Cloudinary Storage Allocation</h2>
                  <p className="text-slate-400 text-sm">Media assets storage, credit utilization, and real-time image files list.</p>
                </div>
                <div className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Cloud: Active
                </div>
              </div>

              {/* Pie/Donut Storage Balance Chart */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-slate-950/20 border border-white/5 rounded-2xl animate-fade-in">
                 {/* Donut Chart */}
                 <div className="relative w-32 h-32 rounded-full flex items-center justify-center border border-white/5 shadow-inner shrink-0"
                      style={{
                         background: `conic-gradient(#ec4899 0% ${clUsedPct.toFixed(4)}%, #f43f5e ${clUsedPct.toFixed(4)}% ${(clUsedPct * 1.5).toFixed(4)}%, #1e293b ${(clUsedPct * 1.5).toFixed(4)}% 100%)`
                      }}
                 >
                    {/* Donut Center Cutout */}
                    <div className="absolute w-24 h-24 rounded-full bg-[#0f0f13] flex flex-col items-center justify-center shadow-lg border border-white/5">
                       <span className="text-white font-black text-sm">{clUsedPct.toFixed(3)}%</span>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Used</span>
                    </div>
                 </div>
                 
                 {/* Storage Balance Details */}
                 <div className="flex-1 w-full space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storage Space Balance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Limit</span>
                          <span className="text-base font-black text-white">{formatBytes(clTotalLimit)}</span>
                       </div>
                       <div className="bg-pink-500/10 p-4 rounded-xl border border-pink-500/20">
                          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block mb-1">Space Covered</span>
                          <span className="text-base font-black text-white">{formatBytes(clSpaceCovered)}</span>
                       </div>
                       <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">Balance Space</span>
                          <span className="text-base font-black text-white">{formatBytes(clBalanceSpace)}</span>
                       </div>
                    </div>
                    
                    {/* Linear representation bar */}
                    <div className="space-y-1.5">
                       <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div style={{ width: `${Math.max(0.5, clUsedPct)}%` }} className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all" />
                       </div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>0%</span>
                          <span>Remaining Balance: {(100 - clUsedPct).toFixed(3)}% Free</span>
                          <span>100%</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Cloudinary Assets List */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Cloudinary Media Resources (Images)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {clStats.resources.map((res: any) => (
                    <div
                      key={res.public_id}
                      onClick={() => setSelectedResource(res)}
                      className="bg-slate-950/30 hover:bg-slate-950/60 border border-white/5 hover:border-pink-500/20 rounded-2xl cursor-pointer overflow-hidden transition group"
                    >
                      <div className="relative aspect-square w-full bg-slate-950/80 flex items-center justify-center overflow-hidden border-b border-white/5">
                         <img 
                            src={res.secure_url} 
                            alt={res.public_id}
                            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                            loading="lazy"
                         />
                         <div className="absolute top-2 right-2 bg-slate-950/80 border border-white/10 text-[9px] font-bold text-white px-2 py-0.5 rounded-md uppercase">
                            {res.format}
                         </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <div className="text-white font-bold text-xs truncate group-hover:text-pink-400 transition-colors" title={res.public_id}>
                          {res.public_id.split('/').pop()}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>{res.width}x{res.height}</span>
                          <span>{formatBytes(res.bytes)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
        </>
        )}

        {activeTab === 'blogs' && (
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-1">SEO Blog Management</h2>
                    <p className="text-slate-400 text-sm">Create, edit, and delete published articles on Homyvo.</p>
                 </div>
                 <button
                    type="button"
                    onClick={() => {
                       setEditingBlog(null);
                       setBlogForm({
                          title: '',
                          slug: '',
                          excerpt: '',
                          content: '',
                          category: 'Renting Guides',
                          author: 'Velnest Admin',
                          imageColor: 'from-[#801786] to-[#ec38b7]'
                       });
                       setBlogError('');
                       setShowCustomCategoryInput(false);
                       setCustomCategoryName('');
                       setShowBlogFormModal(true);
                    }}
                    className="bg-[#801786] hover:bg-[#a61c92] text-white text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-purple-900/20"
                 >
                    <PlusCircle className="w-4 h-4" />
                    Write Article
                 </button>
              </div>

              {/* Blogs list table */}
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                 {blogsList.length === 0 ? (
                    <div className="text-center py-20">
                       <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                       <h3 className="text-slate-400 font-bold">No articles published yet</h3>
                       <p className="text-slate-500 text-xs mt-1">Click the button above to publish your first article.</p>
                    </div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="border-b border-white/5 bg-slate-950/20 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                <th className="p-5">Title</th>
                                <th className="p-5">Category</th>
                                <th className="p-5">Author</th>
                                <th className="p-5">Date</th>
                                <th className="p-5 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                             {blogsList.map((b) => (
                                <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                                   <td className="p-5 font-bold text-white max-w-xs truncate">{b.title}</td>
                                   <td className="p-5">
                                      <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-300">
                                         {b.category}
                                      </span>
                                   </td>
                                   <td className="p-5 text-slate-300">{b.author}</td>
                                   <td className="p-5 text-slate-400">{b.date}</td>
                                   <td className="p-5 text-right space-x-2 whitespace-nowrap">
                                      <button
                                         type="button"
                                         onClick={() => {
                                            setEditingBlog(b);
                                            setBlogForm({
                                               title: b.title,
                                               slug: b.slug,
                                               excerpt: b.excerpt,
                                               content: b.content,
                                               category: b.category,
                                               author: b.author,
                                               imageColor: b.imageColor || 'from-[#801786] to-[#ec38b7]'
                                            });
                                            setBlogError('');
                                            setShowCustomCategoryInput(false);
                                            setCustomCategoryName('');
                                            setShowBlogFormModal(true);
                                         }}
                                         className="text-indigo-400 hover:text-indigo-300 font-bold text-xs bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition"
                                      >
                                         Edit
                                      </button>
                                      <button
                                         type="button"
                                         onClick={() => handleDeleteBlog(b._id)}
                                         className="text-rose-400 hover:text-rose-300 font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition"
                                      >
                                         Delete
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>
           </div>
        )}

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

        {/* Blog Form Modal (Create or Edit) */}
        {showBlogFormModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f0f13] border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                <h2 className="text-xl font-bold text-white">
                   {editingBlog ? 'Edit Blog Article' : 'Publish New Blog Article'}
                </h2>
                <button 
                  onClick={() => {
                     setShowBlogFormModal(false);
                     setEditingBlog(null);
                  }} 
                  className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBlogSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                
                {blogError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-rose-400 text-xs font-bold leading-relaxed">
                     {blogError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                         Article Title *
                      </label>
                      <input
                         type="text"
                         required
                         value={blogForm.title}
                         onChange={(e) => handleTitleChange(e.target.value)}
                         placeholder="e.g. Tenant Rights in Chennai"
                         className="w-full bg-slate-950/50 border border-white/5 focus:border-[#801786] rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors"
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                         URL Slug *
                      </label>
                      <input
                         type="text"
                         required
                         value={blogForm.slug}
                         onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))}
                         placeholder="e.g. tenant-rights-chennai"
                         className="w-full bg-slate-950/50 border border-white/5 focus:border-[#801786] rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                         Category *
                      </label>
                      <select
                         value={showCustomCategoryInput ? "CUSTOM" : blogForm.category}
                         onChange={(e: any) => {
                            if (e.target.value === "CUSTOM") {
                               setShowCustomCategoryInput(true);
                            } else {
                               setShowCustomCategoryInput(false);
                               setBlogForm(prev => ({ ...prev, category: e.target.value }));
                            }
                         }}
                         className="w-full bg-slate-950/90 border border-white/5 focus:border-[#801786] rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors"
                      >
                         {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                         ))}
                         <option value="CUSTOM">+ Add Custom Category...</option>
                      </select>
                      {showCustomCategoryInput && (
                         <div className="mt-2.5">
                            <input
                               type="text"
                               required
                               value={customCategoryName}
                               onChange={(e) => setCustomCategoryName(e.target.value)}
                               placeholder="Enter custom category name (e.g. Legal Info)"
                               className="w-full bg-slate-950/50 border border-[#801786]/50 focus:border-[#801786] rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                            />
                         </div>
                      )}
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                         Author *
                      </label>
                      <input
                         type="text"
                         required
                         value={blogForm.author}
                         onChange={(e) => setBlogForm(prev => ({ ...prev, author: e.target.value }))}
                         placeholder="Velnest Admin"
                         className="w-full bg-slate-950/50 border border-white/5 focus:border-[#801786] rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Card Theme Gradient *
                   </label>
                   <select
                      value={blogForm.imageColor}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, imageColor: e.target.value }))}
                      className="w-full bg-slate-950/90 border border-white/5 focus:border-[#801786] rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-colors"
                   >
                      <option value="from-[#801786] to-[#ec38b7]">Purple/Pink Gradient (Primary)</option>
                      <option value="from-[#2563eb] to-[#3b82f6]">Blue Gradient (SEO)</option>
                      <option value="from-[#059669] to-[#10b981]">Emerald Green Gradient (Guides)</option>
                   </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Excerpt / Summary (1-2 sentences) *
                   </label>
                   <textarea
                      required
                      rows={2}
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Write a compelling brief summary to attract Google search snippet clicks..."
                      className="w-full bg-slate-950/50 border border-white/5 focus:border-[#801786] rounded-xl p-4 text-sm text-white outline-none transition-colors resize-none"
                   />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Article Content (HTML/Markdown support) *
                   </label>
                   <textarea
                      required
                      rows={6}
                      value={blogForm.content}
                      onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write full article body. Use HTML tags like <h2>, <p>, <ul>, <li> for formatting..."
                      className="w-full bg-slate-950/50 border border-white/5 focus:border-[#801786] rounded-xl p-4 text-sm text-white outline-none transition-colors"
                   />
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                   <button
                      type="button"
                      onClick={() => {
                         setShowBlogFormModal(false);
                         setEditingBlog(null);
                      }}
                      className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-sm rounded-xl transition active:scale-95"
                   >
                      Cancel
                   </button>
                   <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#801786] hover:bg-[#a61c92] text-white font-bold text-sm rounded-xl transition active:scale-95 shadow-md shadow-purple-900/10"
                   >
                      {editingBlog ? 'Save Changes' : 'Publish Article'}
                   </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {/* Database Collection Explorer Modal */}
        {activeCollection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f0f13] border border-white/10 rounded-3xl max-w-5xl w-full flex flex-col shadow-2xl overflow-hidden my-8 max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                <div>
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Collection: {activeCollection}
                   </h2>
                   <p className="text-slate-500 text-xs mt-0.5">Showing latest documents first ({collectionTotal} total records)</p>
                </div>
                <button 
                  onClick={() => {
                     setActiveCollection(null);
                     setCollectionDocs([]);
                  }} 
                  className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
                >
                  ✕
                </button>
              </div>

              {/* Table Data list view */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {collLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-slate-500 text-xs font-medium">Querying documents...</p>
                  </div>
                ) : collectionDocs.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    No documents found in this collection.
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20">
                        <table className="w-full text-left border-collapse text-xs">
                           <thead>
                              <tr className="border-b border-white/5 bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                 <th className="p-4 w-28">ID</th>
                                 {/* Display first 4 keys dynamically based on document data */}
                                 {Object.keys(collectionDocs[0] || {})
                                   .filter(k => k !== '_id' && k !== '__v' && typeof (collectionDocs[0] || {})[k] !== 'object')
                                   .slice(0, 4)
                                   .map(key => (
                                     <th key={key} className="p-4">{key}</th>
                                   ))
                                 }
                                 <th className="p-4 text-right">Details</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-slate-300">
                              {collectionDocs.map((doc) => (
                                 <tr key={doc._id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="p-4 font-mono text-slate-500 font-bold select-all">{doc._id}</td>
                                    {Object.keys(collectionDocs[0] || {})
                                      .filter(k => k !== '_id' && k !== '__v' && typeof (collectionDocs[0] || {})[k] !== 'object')
                                      .slice(0, 4)
                                      .map(key => {
                                        const val = doc[key];
                                        let text = '';
                                        if (val === true) text = 'true';
                                        else if (val === false) text = 'false';
                                        else if (val === null || val === undefined) text = 'null';
                                        else text = String(val);
                                        return (
                                          <td key={key} className="p-4 truncate max-w-[180px] font-medium" title={text}>
                                            {text}
                                          </td>
                                        );
                                      })
                                    }
                                    <td className="p-4 text-right">
                                       <button
                                          type="button"
                                          onClick={() => setSelectedDocJSON(doc)}
                                          className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg transition"
                                       >
                                          View JSON
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Pagination footer */}
                     <div className="flex items-center justify-between pt-4">
                        <span className="text-slate-500 text-xs">
                           Page {collectionPage} of {Math.ceil(collectionTotal / 10)}
                        </span>
                        <div className="flex gap-2">
                           <button
                              disabled={collectionPage === 1 || collLoading}
                              onClick={() => fetchCollectionData(activeCollection, collectionPage - 1)}
                              className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                           >
                              Previous
                           </button>
                           <button
                              disabled={collectionPage >= Math.ceil(collectionTotal / 10) || collLoading}
                              onClick={() => fetchCollectionData(activeCollection, collectionPage + 1)}
                              className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                           >
                              Next
                           </button>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Nested JSON Document Viewer Modal */}
        {selectedDocJSON && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0b0b0e] border border-white/10 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                <h3 className="text-lg font-bold text-white font-mono">Document: {selectedDocJSON._id}</h3>
                <button 
                  onClick={() => setSelectedDocJSON(null)} 
                  className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-950/40 p-4 rounded-b-3xl">
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap select-all leading-relaxed">
                   {JSON.stringify(selectedDocJSON, null, 3)}
                </pre>
              </div>
            </motion.div>
          </div>
        )}

        {/* Cloudinary Resource Detail Modal */}
        {selectedResource && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f0f13] border border-white/10 rounded-3xl max-w-3xl w-full flex flex-col md:flex-row shadow-2xl overflow-hidden my-8 max-h-[90vh]"
            >
              {/* Media Preview Panel */}
              <div className="flex-1 bg-slate-950/50 border-r border-white/5 flex items-center justify-center p-6 min-h-[300px]">
                 <img 
                    src={selectedResource.secure_url} 
                    alt={selectedResource.public_id} 
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-white/10"
                 />
              </div>

              {/* Resource Info Panel */}
              <div className="w-full md:w-[320px] p-6 flex flex-col justify-between">
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                             {selectedResource.format} Image
                          </span>
                          <h3 className="text-base font-bold text-white mt-2 truncate max-w-[200px]" title={selectedResource.public_id}>
                             {selectedResource.public_id.split('/').pop()}
                          </h3>
                       </div>
                       <button 
                          onClick={() => setSelectedResource(null)}
                          className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
                       >
                          ✕
                       </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                       <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Public ID</span>
                          <span className="text-slate-300 font-mono select-all break-all">{selectedResource.public_id}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dimensions</span>
                             <span className="text-slate-300 font-medium">{selectedResource.width} x {selectedResource.height} px</span>
                          </div>
                          <div>
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">File Size</span>
                             <span className="text-slate-300 font-medium">{formatBytes(selectedResource.bytes)}</span>
                          </div>
                       </div>
                       <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Created At</span>
                          <span className="text-slate-300 font-medium">
                             {new Date(selectedResource.created_at).toLocaleString()}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5 space-y-2">
                    <a 
                       href={selectedResource.secure_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full bg-[#801786] hover:bg-[#a61c92] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition duration-200"
                    >
                       Open Original URL
                    </a>
                    <button 
                       onClick={() => {
                          navigator.clipboard.writeText(selectedResource.secure_url);
                       }}
                       className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-3 rounded-xl transition duration-200"
                    >
                       Copy Image Link
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}

      </main>
    </div>
  );
}
