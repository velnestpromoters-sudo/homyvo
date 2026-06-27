"use client";

import api from '@/lib/api';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, BookOpen, Clock, User, Tag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BlogPost {
  _id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Renting Guides' | 'SEO & Marketing' | 'Tenant Rights';
  date: string;
  readTime: string;
  author: string;
  imageColor: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'rental-agreement-tamil-nadu',
    title: 'Rental Agreement Rules & Tenant Rights in Tamil Nadu',
    excerpt: 'Understand the 11-month rental agreement tradition, security deposit caps, rent control acts, and key legal rights for tenants in Chennai, Coimbatore, and across Tamil Nadu.',
    category: 'Tenant Rights',
    date: 'June 27, 2026',
    readTime: '5 min read',
    author: 'Sathya (Digital Marketing)',
    imageColor: 'from-[#801786] to-[#ec38b7]'
  },
  {
    slug: 'real-estate-seo-keywords-intent',
    title: 'Real Estate SEO: Keywords & Search Intent Demystified',
    excerpt: 'Learn how SEO blogs, target keywords, and user search intents (informational, navigational, commercial, transactional) drive organic search traffic and high-value visibility to property platforms.',
    category: 'SEO & Marketing',
    date: 'June 26, 2026',
    readTime: '6 min read',
    author: 'Sudharsan (Full Stack Dev)',
    imageColor: 'from-[#2563eb] to-[#3b82f6]'
  },
  {
    slug: 'broker-free-rentals-coimbatore',
    title: 'Broker-Free Rentals in Coimbatore: PGs & Apartments Guide',
    excerpt: 'Discover the top localities in Coimbatore like Saravanampatti and Peelamedu, avoid heavy broker commissions, and find budget-friendly verified PGs and apartments on Homyvo.',
    category: 'Renting Guides',
    date: 'June 25, 2026',
    readTime: '4 min read',
    author: 'Deepak (Project Manager)',
    imageColor: 'from-[#059669] to-[#10b981]'
  }
];

export default function BlogHome() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const uniqueCats = new Set<string>(['All', 'Renting Guides', 'SEO & Marketing', 'Tenant Rights']);
    blogs.forEach(post => {
      if (post.category && post.category.trim()) {
        uniqueCats.add(post.category.trim());
      }
    });
    return Array.from(uniqueCats);
  }, [blogs]);

  // Fetch blogs dynamically on mount
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const res = await api.get('/blogs');
        if (res.data.success && res.data.data.length > 0) {
          setBlogs(res.data.data);
        } else {
          setBlogs(BLOG_POSTS);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic blogs, falling back to static seeds:", err);
        setBlogs(BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  // Filter posts based on search query and category tab
  const filteredPosts = useMemo(() => {
    return blogs.filter(post => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogs, searchQuery, activeCategory]);

  const featuredPost = blogs[0] || BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1f2937] font-sans pb-16">
      
      {/* 1. HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e5e7eb] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/home-list')} 
            className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-[#801786] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#801786]" />
            <span className="font-black text-base tracking-tight text-slate-800">Homyvo Blogs</span>
          </div>
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* 2. HERO / FEATURED AREA */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Homyvo Insights
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium mt-2 max-w-xl mx-auto">
            Expert renting tips, tenant regulations in Tamil Nadu, and property marketing insights to simplify your home search.
          </p>
        </div>

        {/* Featured Spotlight Card */}
        {searchQuery === '' && activeCategory === 'All' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.push(`/blog/${featuredPost.slug}`)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row mb-12"
          >
            {/* Spotlight Image Placeholder */}
            <div className={`md:w-1/2 min-h-[220px] bg-gradient-to-br ${featuredPost.imageColor} flex flex-col justify-between p-8 text-white relative`}>
              <div className="flex justify-between items-center">
                <span className="bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/10">
                  Featured
                </span>
                <span className="flex items-center gap-1 text-xs font-bold opacity-90">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readTime}
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-2xl font-black leading-tight group-hover:underline">
                  {featuredPost.title}
                </h3>
                <p className="text-xs font-semibold opacity-80 mt-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  By {featuredPost.author}
                </p>
              </div>
            </div>

            {/* Spotlight Excerpt */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <span className="text-[#801786] text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-3">
                  <Tag className="w-3.5 h-3.5" />
                  {featuredPost.category}
                </span>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#801786] transition-colors line-clamp-2">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-3 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>
              <div className="mt-6 flex items-center text-[#801786] font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                Read Article
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* 3. FILTERS & SEARCH CONTAINER */}
      <section className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-[#e5e7eb] shadow-sm">
          
          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 shrink-0 ${
                  activeCategory === cat 
                    ? 'bg-[#801786] text-white shadow-md shadow-purple-900/10' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 flex items-center bg-slate-50 border border-[#e5e7eb] rounded-xl focus-within:border-[#801786] focus-within:bg-white transition-all">
            <div className="pl-3.5 pr-2 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords, titles..." 
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 py-3 placeholder:font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 4. POSTS GRID */}
      <section className="max-w-4xl mx-auto px-4">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                onClick={() => router.push(`/blog/${post.slug}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                {/* Thumbnail card */}
                <div className={`h-40 bg-gradient-to-br ${post.imageColor} p-6 text-white flex flex-col justify-between`}>
                  <span className="bg-white/20 backdrop-blur-md self-start text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                    {post.category}
                  </span>
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-80">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.author.split(' ')[0]}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Excerpt card */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1.5">{post.date}</span>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-[#801786] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2.5 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#801786] group-hover:text-[#ec38b7] transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#e5e7eb] px-4 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No articles found</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Try resetting the search filters or type another keyword.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-4 px-5 py-2 bg-[#801786] hover:bg-[#ec38b7] text-white text-xs font-bold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

    </div>
  );
}
