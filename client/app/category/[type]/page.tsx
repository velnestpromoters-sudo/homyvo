"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft as ArrowLeftLucide, Search as SearchLucide, SlidersHorizontal, Home, GraduationCap } from 'lucide-react';
import { PropertyCard } from '@/components/property/PropertyCard';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string; // 'student' or 'family'

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localFilters, setLocalFilters] = useState({ type: 'all', sort: 'none' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategoryProperties = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/properties`);
        const data = await res.json();
        if (data.success && data.data) {
           const fetched = data.data;
           const filtered = fetched.filter((p: any) => {
              const isPg = p.propertyType === 'pg';
              if (type === 'student') {
                 return p.preferences?.bachelorAllowed || isPg;
              } else {
                 return !(p.preferences?.bachelorAllowed || isPg);
              }
           });
           setProperties(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch category properties:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProperties();
  }, [type]);

  const filteredResults = React.useMemo(() => {
      let res = [...properties];
      if (localFilters.type === 'pg') res = res.filter(r => r.propertyType === 'pg');
      if (localFilters.type === 'apartment') res = res.filter(r => r.propertyType === 'apartment');
      
      if (localFilters.sort === 'price_low') res.sort((a,b) => a.rent - b.rent);
      if (localFilters.sort === 'price_high') res.sort((a,b) => b.rent - a.rent);
      return res;
  }, [properties, localFilters]);

  const isStudent = type === 'student';

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50">
      {/* Header */}
      <header className="px-4 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => router.back()} 
             className="p-2 mr-[-4px] rounded-full hover:bg-slate-100 transition-colors"
           >
             <ArrowLeftLucide className="w-6 h-6 text-slate-700" />
           </button>
           <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${isStudent ? 'bg-purple-50' : 'bg-indigo-50'}`}>
                 {isStudent ? (
                    <GraduationCap className="w-5 h-5 text-[#801786]" />
                 ) : (
                    <Home className="w-5 h-5 text-indigo-600" />
                 )}
              </div>
              <div>
                 <h1 className="text-lg font-black text-slate-900 leading-none">
                    {isStudent ? 'Student & Bachelor' : 'Family Residences'}
                 </h1>
                 <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    {properties.length} Premium {isStudent ? 'Stays' : 'Homes'}
                 </p>
              </div>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto p-4 md:p-6">
        
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#801786] rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-semibold mt-4">Curating the best options...</p>
           </div>
        ) : (
           <div className="space-y-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between px-1 mb-2">
                 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {filteredResults.length} Results Found
                 </h2>
                 <div className="relative">
                    <button 
                       onClick={() => setShowFilters(!showFilters)}
                       className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${showFilters ? 'text-white bg-[#801786]' : 'text-[#801786] bg-[#801786]/10 hover:bg-[#801786]/20'}`}
                    >
                       <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                    </button>
                    {showFilters && (
                       <div className="absolute right-0 top-[120%] mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
                          <div className="mb-3">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Property Type</p>
                             <div className="flex flex-wrap gap-1.5">
                               {['all', 'pg', 'apartment'].map(t => (
                                  <button 
                                     key={t}
                                     onClick={() => setLocalFilters(prev => ({...prev, type: t}))}
                                     className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${localFilters.type === t ? 'bg-[#801786] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                     {t}
                                  </button>
                               ))}
                             </div>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sort by Rent</p>
                             <div className="flex flex-col gap-1">
                               {[{val: 'none', label: 'Recommended'}, {val: 'price_low', label: 'Price: Low to High'}, {val: 'price_high', label: 'Price: High to Low'}].map(s => (
                                  <button 
                                     key={s.val}
                                     onClick={() => setLocalFilters(prev => ({...prev, sort: s.val}))}
                                     className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${localFilters.sort === s.val ? 'bg-[#801786]/10 text-[#801786]' : 'text-slate-600 hover:bg-slate-50'}`}
                                  >
                                     {s.label}
                                  </button>
                               ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {filteredResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredResults.map((item) => (
                       <PropertyCard 
                          key={item._id}
                          id={item._id}
                          title={item.title}
                          bhkType={item.bhkType}
                          propertyType={item.propertyType}
                          image={item.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                          rent={item.rent}
                          location={`${item.location?.area || 'Area'}, ${item.location?.city || 'City'}`}
                          matchScore={item.matchScore > 0 ? item.matchScore : undefined}
                          moveInStatus={item.moveInReady ? 'Move-in Ready' : undefined}
                       />
                    ))}
                 </div>
              ) : (
                 <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center mt-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                       <SearchLucide className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 font-extrabold text-lg mb-1">No matches found</h3>
                    <p className="text-slate-500 text-sm max-w-[250px] mx-auto leading-relaxed">
                       We couldn't find any {isStudent ? 'student' : 'family'} properties matching your criteria.
                    </p>
                 </div>
              )}
           </div>
        )}
      </main>
    </div>
  );
}
