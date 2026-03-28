"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/property/PropertyCard';
import api from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get('/properties');
        if(res.data.success) {
           setProperties(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-36">
      
      {/* Top Section */}
      <header className="px-5 py-5 flex justify-between items-center bg-slate-50 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="bnest logo" className="w-8 h-8 drop-shadow-sm" />
          <span className="font-extrabold text-2xl tracking-tighter text-slate-900">bnest</span>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => router.push('/login')} 
          className="font-bold text-sm bg-white text-slate-800 shadow-sm rounded-full px-5 hover:bg-slate-100"
        >
          Login
        </Button>
      </header>

      <main className="flex-1 px-5 mt-2">
        
        {/* Search Section */}
        <div className="mb-8 relative transition-all group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6A3D] transition-colors" />
          </div>
          <input 
            type="text" 
            onFocus={() => router.push('/search')}
            placeholder="Search by area, budget, or need..." 
            className="w-full pl-14 pr-5 py-4 rounded-3xl bg-white border border-slate-200 outline-none text-slate-900 shadow-sm focus:shadow-md focus:border-[#FF6A3D] transition-all text-sm font-semibold placeholder:font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Discovery Section (Main) */}
        <div>
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recommended for you</h2>
          </div>
          <div className="flex flex-col gap-1">
            {loading ? (
              <p className="text-center text-slate-500 my-10 font-medium">Loading verified properties...</p>
            ) : properties.length === 0 ? (
              <p className="text-center text-slate-500 my-10 font-medium">No properties available yet.</p>
            ) : (
              properties.map((prop) => (
                <PropertyCard 
                  key={prop._id} 
                  id={prop._id}
                  image={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
                  rent={prop.rent}
                  location={`${prop.location?.area || 'Area'}, ${prop.location?.city || 'City'}`}
                  matchScore={prop.matchScore}
                  moveInStatus={prop.moveInReady ? 'Move-in Ready' : undefined}
                />
              ))
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
