"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, MapPin, Search, Compass } from 'lucide-react';
import { useLocationStore } from '@/store/locationStore';
import { PropertyCard } from '@/components/property/PropertyCard';
import { getCurrentPrecisePosition } from '@/utils/geolocation';
import { motion, AnimatePresence } from 'framer-motion';

interface RentalsClientProps {
  initialProperties: any[];
  category: string;
  cityRaw: string | null;
  cityName: string | null;
}

export default function RentalsClient({
  initialProperties,
  category,
  cityRaw,
  cityName,
}: RentalsClientProps) {
  const router = useRouter();
  const { coordinates, setLocation } = useLocationStore();
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [localFilters, setLocalFilters] = useState({ type: 'all', sort: 'none' });
  const [showFilters, setShowFilters] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Sync state if initialProperties updates (due to Next.js data revalidation)
  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  const getDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleEnableLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      getCurrentPrecisePosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            let detected = null;
            try {
              const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              const bdcData = await bdcRes.json();
              detected = bdcData.locality || bdcData.city || bdcData.principalSubdivision;
            } catch (e) {}
            setLocation(detected || 'Detected Area', { lat: latitude, lng: longitude });
          } catch (e) {
            setLocation('Detected Area', { lat: latitude, lng: longitude });
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error(err);
          alert("Location permission denied or failed. Please enable location in your browser settings.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const filteredResults = React.useMemo(() => {
    let res = [...properties];

    // Local Type Filter
    if (localFilters.type === 'pg') res = res.filter(r => r.propertyType === 'pg');
    if (localFilters.type === 'apartment') res = res.filter(r => r.propertyType === 'apartment');
    if (localFilters.type === 'commercial') res = res.filter(r => r.propertyType === 'commercial');

    // Local Sort Filter
    if (localFilters.sort === 'price_low') {
      res.sort((a, b) => a.rent - b.rent);
    } else if (localFilters.sort === 'price_high') {
      res.sort((a, b) => b.rent - a.rent);
    } else if (localFilters.sort === 'nearest' && coordinates) {
      res.sort((a, b) => {
        const aLat = a.location?.coordinates?.coordinates?.[1];
        const aLng = a.location?.coordinates?.coordinates?.[0];
        const bLat = b.location?.coordinates?.coordinates?.[1];
        const bLng = b.location?.coordinates?.coordinates?.[0];
        const distA = getDistance(coordinates.lat, coordinates.lng, aLat, aLng);
        const distB = getDistance(coordinates.lat, coordinates.lng, bLat, bLng);
        return distA - distB;
      });
    }

    return res;
  }, [properties, localFilters, coordinates]);

  const categoryLabel = category === 'pg' 
    ? 'PG Stays & Hostels' 
    : category === 'commercial' 
      ? 'Commercial Spaces' 
      : category === 'student' 
        ? 'Student & Bachelor Stays' 
        : category === 'family' 
          ? 'Family Stays' 
          : 'Verified Rentals';

  const headingText = cityName ? `${categoryLabel} in ${cityName}` : categoryLabel;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 pb-20">
      {/* Dynamic SEO Title Tag & Page Header */}
      <header className="px-4 py-4 border-b border-slate-200 sticky top-0 bg-white z-20 shadow-sm flex items-center justify-between gap-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>

        <div 
          onClick={() => router.push('/search')}
          className="flex-1 max-w-md mx-auto flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-full border border-slate-200 cursor-pointer active:scale-95 transition-transform"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Search houses, hostels, PGs...</span>
        </div>

        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-full border transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-[#801786]' : 'bg-white border-slate-200 text-slate-700'}`}
          type="button"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="p-4 max-w-3xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Dynamic Page Header & Description */}
        <div className="flex flex-col gap-1.5 mt-2">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{headingText}</h1>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {cityName 
              ? `Browse top-rated, zero-brokerage ${categoryLabel.toLowerCase()} available for immediate booking in the ${cityName} area.`
              : `Browse premium, zero-brokerage verified listings of ${categoryLabel.toLowerCase()} across Tamil Nadu.`
            }
          </p>
        </div>

        {/* Location Detection Banner (If no location was specified) */}
        {!cityRaw && !coordinates && (
          <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <Compass className="w-5 h-5 text-purple-200 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Find properties nearest to you</h3>
                <p className="text-[10px] text-purple-200/90 font-medium mt-0.5">Enable GPS to sort and show matching PGs or houses in your vicinity.</p>
              </div>
            </div>
            <button
              onClick={handleEnableLocation}
              disabled={isLocating}
              className="px-4 py-2 bg-white text-purple-900 font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-75"
              type="button"
            >
              {isLocating ? 'Locating...' : 'Enable Location'}
            </button>
          </div>
        )}

        {/* Filters Panel Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 overflow-hidden flex flex-col gap-4 shadow-sm"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Filter Property Type</label>
                <div className="flex gap-2">
                  {['all', 'pg', 'apartment', 'commercial'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLocalFilters(prev => ({ ...prev, type: t }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${localFilters.type === t ? 'bg-[#801786] border-[#801786] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {t === 'all' ? 'All' : t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sort Results</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLocalFilters(prev => ({ ...prev, sort: 'none' }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${localFilters.sort === 'none' ? 'bg-[#801786] border-[#801786] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalFilters(prev => ({ ...prev, sort: 'price_low' }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${localFilters.sort === 'price_low' ? 'bg-[#801786] border-[#801786] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalFilters(prev => ({ ...prev, sort: 'price_high' }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${localFilters.sort === 'price_high' ? 'bg-[#801786] border-[#801786] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Price: High to Low
                  </button>
                  {coordinates && (
                    <button
                      type="button"
                      onClick={() => setLocalFilters(prev => ({ ...prev, sort: 'nearest' }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${localFilters.sort === 'nearest' ? 'bg-[#801786] border-[#801786] text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      Nearest to Me
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties Listings */}
        <div className="flex-1 flex flex-col gap-4">
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredResults.map((prop) => (
                <PropertyCard 
                  key={prop._id}
                  id={prop._id}
                  title={prop.title}
                  bhkType={prop.bhkType}
                  propertyType={prop.propertyType}
                  image={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                  rent={prop.rent}
                  location={`${prop.location?.area || 'Area'}, ${prop.location?.city || 'City'}`}
                  matchScore={prop.matchScore > 0 ? prop.matchScore : undefined}
                  moveInStatus={prop.moveInReady ? 'Move-in Ready' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl text-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#111827]">No Stays Available</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">We couldn't find any listings matching your category or city filters right now.</p>
              </div>
              <button
                onClick={() => router.push('/search')}
                className="px-4 py-2 bg-[#801786] hover:bg-[#a61c92] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors active:scale-95 mt-2"
                type="button"
              >
                Browse All Properties
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
