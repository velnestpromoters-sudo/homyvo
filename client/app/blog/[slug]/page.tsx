"use client";

import api from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Clock, User, Calendar, Tag, AlertCircle, Share2, CheckCircle } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../page';

export default function BlogArticle() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch article dynamically from database on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/blogs/${slug}`);
        if (res.data.success) {
          setPost(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch blog dynamically, falling back to local static lookup:", err);
        const local = BLOG_POSTS.find(p => p.slug === slug);
        if (local) {
          setPost(local);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Calculate read/scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#801786] border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-bold">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Article Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The blog post you are looking for does not exist or has been relocated.</p>
          <button 
            onClick={() => router.push('/blog')}
            className="mt-6 px-6 py-2.5 bg-[#801786] hover:bg-[#ec38b7] text-white font-bold rounded-xl transition-all"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  // Related posts (excluding current post)
  const relatedPosts = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 2);

  // Structured Data Schema markup for SEO Google indexing
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": "2026-06-27T08:00:00+05:30",
    "dateModified": "2026-06-27T08:00:00+05:30",
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Homyvo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.homyvo.com/logo.svg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.homyvo.com/blog/${post.slug}`
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1f2937] font-sans pb-20 relative">
      
      {/* JSON-LD Schema injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading Progress Indicator */}
      <div 
        style={{ width: `${scrollProgress}%` }}
        className="fixed top-0 left-0 h-1 bg-[#801786] transition-all z-50 duration-75"
      />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e5e7eb] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/blog')} 
            className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-[#801786] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            All Blogs
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition active:scale-95 text-xs font-bold text-slate-700"
          >
            {shareSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ARTICLE COVER AREA */}
      <section className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Category & Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold mb-4">
          <span className="bg-purple-50 text-[#801786] border border-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Article Headline */}
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author & Date Card */}
        <div className="flex items-center gap-3 pb-8 border-b border-slate-100 mb-8">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#801786] font-black text-sm border border-purple-200">
            {post.author.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {post.author}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Published on {post.date}
            </div>
          </div>
        </div>

        {/* ----------------- DYNAMIC ARTICLE BODY CONTENT ----------------- */}
        <article className="prose prose-slate max-w-none text-slate-700 font-medium text-base leading-relaxed space-y-6">
          {slug === 'rental-agreement-tamil-nadu' && (
            <>
              <p className="text-lg font-semibold text-slate-800 leading-normal">
                Renting a residential property in cities like Chennai, Coimbatore, or Madurai requires navigating both standard industry practices and state-level laws.
              </p>
              
              <h2 className="text-xl font-black text-slate-900 pt-4">1. The 11-Month Custom Explained</h2>
              <p>
                In Tamil Nadu, the vast majority of residential rental agreements are drawn up for exactly <strong>11 months</strong>. This is not arbitrary; it has significant legal benefits for property owners:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Bypassing Mandatory Registration:</strong> Under the Indian Registration Act of 1908, any lease agreement exceeding 12 months must be registered at the Sub-Registrar's Office. This involves pay-outs for stamp duties and registration fees. The 11-month limit avoids these extra upfront costs.</li>
                <li><strong>Tenant Eviction Flexibility:</strong> Short-term agreements protect landlords against tenants overstaying, making it easier to renew or terminate agreements without long-term legal tenancy claims.</li>
              </ul>

              <h2 className="text-xl font-black text-slate-900 pt-4">2. The TNRRDLA (2019 Tenancy Act)</h2>
              <p>
                In 2019, the state government introduced the <strong>Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act (TNRRDLA)</strong>. This act aimed to digitize and standardize rentals:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>It makes it mandatory for <em>all</em> rental agreements to be written down and registered on the state's official tenancy portal (tenancy.tn.gov.in) to create a Tenancy Number.</li>
                <li>Verbal agreements are no longer legally enforceable in landlord-tenant disputes.</li>
              </ul>

              <h2 className="text-xl font-black text-slate-900 pt-4">3. Security Deposit Caps</h2>
              <p>
                Historically, landlords in Chennai and Coimbatore demanded up to <strong>10 months' rent</strong> as a security deposit. However:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Under the TNRRDLA rules, the security deposit cap is set to a maximum of <strong>three months' rent</strong> for residential properties.</li>
                <li>Despite the law, market practice in high-demand areas still fluctuates between 5 to 8 months. Renters are encouraged to negotiate and refer to the Act.</li>
              </ul>

              <h2 className="text-xl font-black text-slate-900 pt-4">4. Tenant and Landlord Responsibilities</h2>
              <p>
                The agreement must clearly demarcate who pays for what:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Maintenance:</strong> Minor repairs (leaky taps, electrical switch replacement) are borne by the tenant. Major structural repairs (caving ceilings, damp walls, external painting) are the landlord's responsibility.</li>
                <li><strong>Direct Booking Benefit:</strong> Renting direct-from-owner through Homyvo skips broker intervention completely. This means you avoid paying the standard "one month brokerage fee" and get directly in touch with landlords to draft custom, friendly terms.</li>
              </ul>
            </>
          )}

          {slug === 'real-estate-seo-keywords-intent' && (
            <>
              <p className="text-lg font-semibold text-slate-800 leading-normal">
                To capture high-quality organic traffic, property platforms and agents must match search engine algorithms. This is accomplished through SEO Blogs, strategic Keywords, and Search Intent.
              </p>

              <h2 className="text-xl font-black text-slate-900 pt-4">1. What is an SEO Blog?</h2>
              <p>
                An <strong>SEO Blog</strong> is a dedicated article section of a website structured to answer queries that users ask Google. Since search engines rank pages that have the highest quality information, writing detailed, well-designed blogs earns your domain organic rankings, resulting in free clicks and direct leads.
              </p>

              <h2 className="text-xl font-black text-slate-900 pt-4">2. The Role of Target Keywords</h2>
              <p>
                <strong>Keywords</strong> are the search terms typed into Google by users. In real estate, keywords must be carefully researched. We categorize keywords into:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Short-Tail Keywords:</strong> Broad terms like <em>"Chennai rentals"</em>. High search volume, but extremely high competition.</li>
                <li><strong>Long-Tail Keywords:</strong> Niche, specific terms like <em>"broker free PG for girls in Saravanampatti"</em>. Lower search volume, but highly targeted with higher conversion rates.</li>
              </ul>

              <h2 className="text-xl font-black text-slate-900 pt-4">3. Understanding Keyword Search Intent</h2>
              <p>
                Google evaluates search engine optimization based on how well your page satisfies the user’s **Search Intent** (their underlying goal). The four intents are:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 my-6">
                <div>
                  <h4 className="font-black text-slate-800 text-sm">A. Informational (Seeking Answers)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    The user wants guides, tips, or legal rules. E.g., <em>"tenancy registration process Tamil Nadu"</em>.
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">B. Navigational (Seeking a Specific Brand)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    The user wants to open your website. E.g., <em>"Homyvo home search page"</em>.
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">C. Commercial Investigation (Comparing Options)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    The user is comparing before buying. E.g., <em>"best rental apps Coimbatore vs Chennai"</em>.
                  </p>
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">D. Transactional (Ready to Commit)</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    The user is looking to do a transaction now. E.g., <em>"rent 2bhk home Peelamedu"</em> or <em>"post property rental listing Chennai"</em>.
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 pt-4">4. Building the Bridge on Homyvo</h2>
              <p>
                By mapping out blog content to informational keywords and linking them directly to our transactional pages (e.g. city rentals search), we funnel cold Google traffic into highly engaged property seekers. This is the cornerstone of premium digital marketing.
              </p>
            </>
          )}

          {slug === 'broker-free-rentals-coimbatore' && (
            <>
              <p className="text-lg font-semibold text-slate-800 leading-normal">
                Coimbatore is growing rapidly as an IT and education hub. However, traditional rental markets are plagued by broker commission charges. Here is how to navigate Coimbatore broker-free.
              </p>

              <h2 className="text-xl font-black text-slate-900 pt-4">1. Localities in Focus</h2>
              <p>
                Where you choose to live in Coimbatore determines your rental rates and access:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Peelamedu:</strong> The student hub. Proximity to major colleges (PSG, GRD) makes it the prime target for shared rooms and student PGs.</li>
                <li><strong>Saravanampatti:</strong> Coimbatore's IT Corridor. Home to major tech parks (CHIL SEZ) housing Cognizant, Bosch, and others. Perfect for young IT professionals seeking apartments.</li>
                <li><strong>Gandhipuram & RS Puram:</strong> Commercial centers. Active markets with family apartments and commercial offices, with slightly higher rental ranges.</li>
              </ul>

              <h2 className="text-xl font-black text-slate-900 pt-4">2. The Brokerage Commission Trap</h2>
              <p>
                Local brokers in Coimbatore traditionally charge <strong>one to two months' rent</strong> as their fee just for sharing an owner's contact number. On a monthly rent of ₹15,000, this is a waste of ₹30,000 upfront. By searching on Homyvo, tenants directly communicate with verified owners, saving this commission completely.
              </p>

              <h2 className="text-xl font-black text-slate-900 pt-4">3. Tips for Coimbatore Renters</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Water Availability:</strong> Coimbatore is famous for Siruvani water. Verify if the property has Siruvani connection, borewell supply, or relies on water tankers.</li>
                <li><strong>PG Amenities:</strong> When renting a PG room, check if food, Wi-Fi, and laundry services are bundled in the base charge or cost extra.</li>
                <li><strong>Agreement Terms:</strong> Coimbatore landlords typically expect a 5-6 month security deposit. Always get this in writing using an official 11-month contract.</li>
              </ul>
            </>
          )}
          {!['rental-agreement-tamil-nadu', 'real-estate-seo-keywords-intent', 'broker-free-rentals-coimbatore'].includes(slug) && (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
        </article>

        {/* ----------------- RELATED POSTS FOOTER ----------------- */}
        <div className="mt-16 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((related) => (
              <div 
                key={related.slug}
                onClick={() => router.push(`/blog/${related.slug}`)}
                className="group cursor-pointer bg-slate-50 border border-slate-200/60 rounded-2xl p-5 hover:bg-white hover:border-[#801786]/30 hover:shadow-lg transition-all duration-300"
              >
                <span className="text-[9px] text-[#801786] font-extrabold uppercase tracking-wider block mb-2">{related.category}</span>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#801786] transition-colors line-clamp-2">
                  {related.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1">{related.readTime}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
