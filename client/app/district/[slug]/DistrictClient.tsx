"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, MapPin, Heart, ChevronDown, Check, X, Building, Home, GraduationCap, DollarSign, Filter, Star, Info } from 'lucide-react';
import api from '@/lib/api';
import { useWishlistStore } from '@/store/wishlistStore';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded Tamil Nadu districts list offline
const TAMIL_NADU_DISTRICTS = [
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047 },
  { name: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
  { name: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
  { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567 },
  { name: "Thanjavur", state: "Tamil Nadu", lat: 10.7870, lng: 79.1378 },
  { name: "Dindigul", state: "Tamil Nadu", lat: 10.3673, lng: 77.9803 },
  { name: "Thoothukudi", state: "Tamil Nadu", lat: 8.7642, lng: 78.1348 },
  { name: "Kanchipuram", state: "Tamil Nadu", lat: 12.8387, lng: 79.7016 },
  { name: "Cuddalore", state: "Tamil Nadu", lat: 11.7480, lng: 79.7714 },
  { name: "Karur", state: "Tamil Nadu", lat: 10.9601, lng: 78.0766 },
  { name: "Krishnagiri", state: "Tamil Nadu", lat: 12.5266, lng: 78.2148 },
  { name: "Namakkal", state: "Tamil Nadu", lat: 11.2189, lng: 78.1673 },
  { name: "Pudukkottai", state: "Tamil Nadu", lat: 10.3797, lng: 78.8208 },
  { name: "Ramanathapuram", state: "Tamil Nadu", lat: 9.3639, lng: 78.8395 },
  { name: "Sivaganga", state: "Tamil Nadu", lat: 9.8433, lng: 78.4809 },
  { name: "Tenkasi", state: "Tamil Nadu", lat: 8.9592, lng: 77.3138 },
  { name: "Theni", state: "Tamil Nadu", lat: 10.0104, lng: 77.4768 },
  { name: "Tiruvallur", state: "Tamil Nadu", lat: 13.1384, lng: 79.9073 },
  { name: "Tiruvannamalai", state: "Tamil Nadu", lat: 12.2253, lng: 79.0747 },
  { name: "Tiruvarur", state: "Tamil Nadu", lat: 10.7722, lng: 79.6361 },
  { name: "The Nilgiris", state: "Tamil Nadu", lat: 11.4102, lng: 76.6950 },
  { name: "Nagapattinam", state: "Tamil Nadu", lat: 10.7672, lng: 79.8444 },
  { name: "Ariyalur", state: "Tamil Nadu", lat: 11.1401, lng: 79.0786 },
  { name: "Dharmapuri", state: "Tamil Nadu", lat: 12.1254, lng: 78.1579 },
  { name: "Kallakurichi", state: "Tamil Nadu", lat: 11.7383, lng: 78.9639 },
  { name: "Mayiladuthurai", state: "Tamil Nadu", lat: 11.1018, lng: 79.6521 },
  { name: "Perambalur", state: "Tamil Nadu", lat: 11.2342, lng: 78.8821 },
  { name: "Ranipet", state: "Tamil Nadu", lat: 12.9272, lng: 79.3328 },
  { name: "Tirupathur", state: "Tamil Nadu", lat: 12.4934, lng: 78.5678 },
  { name: "Virudhunagar", state: "Tamil Nadu", lat: 9.5680, lng: 77.9624 },
  { name: "Chengalpattu", state: "Tamil Nadu", lat: 12.6841, lng: 79.9836 },
  { name: "Viluppuram", state: "Tamil Nadu", lat: 11.9398, lng: 79.4860 },
  { name: "Karaikal", state: "Tamil Nadu", lat: 10.9254, lng: 79.8380 }
];

interface DistrictClientProps {
  slug: string;
  initialLat: number | null;
  initialLng: number | null;
}

export default function DistrictClient({ slug, initialLat, initialLng }: DistrictClientProps) {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlistStore();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locationFullName, setLocationFullName] = useState<string>('');

  // Dropdown States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'students' | 'family' | 'commercial'>('all');
  const [selectedPriceSort, setSelectedPriceSort] = useState<'none' | 'low-to-high' | 'high-to-low'>('none');

  // Sub-Filters - Students
  const [studentPropertyType, setStudentPropertyType] = useState<'all' | 'pg' | 'apartment'>('all');
  const [studentGender, setStudentGender] = useState<'all' | 'boys' | 'girls' | 'coliving'>('all');
  const [bachelorAllowedOnly, setBachelorAllowedOnly] = useState<boolean>(false);

  // Sub-Filters - Family
  const [familyBhks, setFamilyBhks] = useState<string[]>([]);

  // Sub-Filters - Commercial
  const [commercialTypes, setCommercialTypes] = useState<string[]>([]);

  // Format capitalized title
  const formattedDistrictName = useMemo(() => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [slug]);

  // Haversine Distance Calculation (km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 1. Resolve coordinates & load properties
  useEffect(() => {
    const resolveAndLoad = async () => {
      setLoading(true);
      let targetCenter = null;

      // Check if coordinates were passed in query params
      if (initialLat && initialLng) {
        targetCenter = { lat: initialLat, lng: initialLng };
      } else {
        // Fallback to offline Tamil Nadu list lookup
        const localMatch = TAMIL_NADU_DISTRICTS.find(
          d => d.name.toLowerCase() === slug.toLowerCase().replace(/-/g, ' ')
        );
        if (localMatch) {
          targetCenter = { lat: localMatch.lat, lng: localMatch.lng };
          setLocationFullName(`${localMatch.name}, ${localMatch.state}`);
        } else {
          // Dynamic geocoding lookup
          try {
            const query = encodeURIComponent(`${formattedDistrictName}, India`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&countrycodes=in&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
              targetCenter = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
              const state = data[0].address?.state || 'India';
              setLocationFullName(`${formattedDistrictName}, ${state}`);
            }
          } catch (err) {
            console.error("Nominatim Lookup Error:", err);
          }
        }
      }

      if (targetCenter) {
        setCenter(targetCenter);
        if (!locationFullName) {
          // Try to set dynamic full name if not set yet
          const localMatch = TAMIL_NADU_DISTRICTS.find(
            d => d.name.toLowerCase() === slug.toLowerCase().replace(/-/g, ' ')
          );
          setLocationFullName(localMatch ? `${localMatch.name}, ${localMatch.state}` : `${formattedDistrictName}, India`);
        }
      }

      // Fetch all properties from database
      try {
        const res = await api.get('/properties');
        if (res.data.success) {
          setProperties(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };

    resolveAndLoad();
  }, [slug, initialLat, initialLng, formattedDistrictName]);

  // Extract coordinate utility function
  const extractCoords = (link: string) => {
    if (!link) return null;
    const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return [parseFloat(match[2]), parseFloat(match[1])];
    const matchQ = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchQ) return [parseFloat(matchQ[2]), parseFloat(matchQ[1])];
    return null;
  };

  // 2. Geofence properties within 30km around resolved center
  const geofencedProperties = useMemo(() => {
    if (!center) return [];

    return properties
      .map((p: any) => {
        let coords = p.location?.coordinates?.coordinates || extractCoords(p.location?.googleMapLink) || null;
        let distance = null;
        if (Array.isArray(coords) && coords.length === 2) {
          const lng = coords[0];
          const lat = coords[1];
          distance = calculateDistance(center.lat, center.lng, lat, lng);
        }
        return { ...p, distance };
      })
      .filter((p: any) => {
        // Match 30km geofencing radius
        if (p.distance !== null && p.distance <= 30) return true;

        // Resilient fallback: city/area name match in case coordinate attributes are empty
        const cityNormalized = p.location?.city?.toLowerCase().replace(/\s+/g, '-') || '';
        const areaNormalized = p.location?.area?.toLowerCase().replace(/\s+/g, '-') || '';
        return cityNormalized.includes(slug) || areaNormalized.includes(slug);
      });
  }, [properties, center, slug]);

  // 3. Apply active category, sorting, and contextual sub-filters
  const filteredProperties = useMemo(() => {
    let result = [...geofencedProperties];

    // Category Filter & Sub-filters
    if (selectedCategory === 'students') {
      result = result.filter(p => p.propertyType === 'pg' || p.preferences?.bachelorAllowed === true);

      // Property Type: PG vs Apartment
      if (studentPropertyType !== 'all') {
        result = result.filter(p => p.propertyType === studentPropertyType);
      }

      // PG Gender filter
      if (studentGender !== 'all') {
        result = result.filter(p => {
          const gender = p.pgDetails?.gender?.toLowerCase() || '';
          if (studentGender === 'boys') return gender === 'boys' || gender === 'male';
          if (studentGender === 'girls') return gender === 'girls' || gender === 'female';
          if (studentGender === 'coliving') return gender === 'co-living' || gender === 'any' || !gender;
          return true;
        });
      }

      // Bachelor Allowed option
      if (bachelorAllowedOnly) {
        result = result.filter(p => p.preferences?.bachelorAllowed === true);
      }
    } else if (selectedCategory === 'family') {
      // Must not be commercial, pg, or student-bachelor stays
      result = result.filter(
        p => p.propertyType !== 'commercial' && p.propertyType !== 'pg' && p.preferences?.bachelorAllowed !== true
      );

      // Family BHK type sub-filters
      if (familyBhks.length > 0) {
        result = result.filter(p => {
          const bhk = p.bhkType || '';
          return familyBhks.some(selectedBhk => {
            if (selectedBhk === '4 BHK+') {
              const num = parseInt(bhk.replace(/\D/g, ''));
              return num >= 4;
            }
            const normalizedBhk = bhk.replace(/\s+/g, '').toLowerCase();
            const normalizedSelected = selectedBhk.replace(/\s+/g, '').toLowerCase();
            return normalizedBhk.includes(normalizedSelected);
          });
        });
      }
    } else if (selectedCategory === 'commercial') {
      result = result.filter(p => p.propertyType === 'commercial');

      // Commercial space types (stored in bhkType field)
      if (commercialTypes.length > 0) {
        result = result.filter(p => {
          const spaceType = p.bhkType || '';
          return commercialTypes.some(t => spaceType.toLowerCase().includes(t.toLowerCase()));
        });
      }
    }

    // Sorting by price
    if (selectedPriceSort === 'low-to-high') {
      result.sort((a, b) => (a.rent || 0) - (b.rent || 0));
    } else if (selectedPriceSort === 'high-to-low') {
      result.sort((a, b) => (b.rent || 0) - (a.rent || 0));
    }

    return result;
  }, [
    geofencedProperties,
    selectedCategory,
    studentPropertyType,
    studentGender,
    bachelorAllowedOnly,
    familyBhks,
    commercialTypes,
    selectedPriceSort
  ]);

  // Check if any advanced sub-filters are active
  const hasActiveSubFilters = useMemo(() => {
    if (selectedCategory === 'students') {
      return studentPropertyType !== 'all' || studentGender !== 'all' || bachelorAllowedOnly;
    }
    if (selectedCategory === 'family') {
      return familyBhks.length > 0;
    }
    if (selectedCategory === 'commercial') {
      return commercialTypes.length > 0;
    }
    return false;
  }, [selectedCategory, studentPropertyType, studentGender, bachelorAllowedOnly, familyBhks, commercialTypes]);

  // Helper: toggle select item in array
  const toggleSelection = (list: string[], item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleResetFilters = () => {
    setSelectedPriceSort('none');
    setStudentPropertyType('all');
    setStudentGender('all');
    setBachelorAllowedOnly(false);
    setFamilyBhks([]);
    setCommercialTypes([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative pb-10">
      
      {/* Top Header */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.push('/home-list')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Stays in {locationFullName || formattedDistrictName}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#801786]" />
            Geofenced within 30km radius
          </p>
        </div>
      </header>

      {/* DUAL SEGMENTED FILTER BUTTON */}
      <div className="flex justify-center sticky top-[68px] z-30 px-4 my-3">
        <div className="inline-flex items-center bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-full py-1 px-1 divide-x divide-slate-100 max-w-full">
          {/* Left Segment: Category */}
          <button
            onClick={() => setIsCategoryOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-800 hover:text-slate-900 active:scale-95 transition-transform truncate"
          >
            <Filter className="w-3.5 h-3.5 text-[#801786] shrink-0" />
            <span className="truncate">
              Category: {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Right Segment: Price & Details */}
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-800 hover:text-slate-900 active:scale-95 transition-transform truncate"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#801786] shrink-0" />
            <span className="truncate">Price & Details</span>
            {(selectedPriceSort !== 'none' || hasActiveSubFilters) && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#801786] border border-white shrink-0"></span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 px-4 max-w-xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-[#801786] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Scanning properties in {formattedDistrictName}...</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredProperties.length} Properties
              </span>
              {(selectedCategory !== 'all' || selectedPriceSort !== 'none' || hasActiveSubFilters) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    handleResetFilters();
                  }}
                  className="text-xs font-semibold text-[#801786] hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Properties Grid */}
            <div className="space-y-4">
              {filteredProperties.map((p, idx) => {
                const isPg = p.propertyType === 'pg';
                const pgGender = p.pgDetails?.gender ? ` (${p.pgDetails.gender.toUpperCase()})` : '';
                const typeStr = isPg ? `PG${pgGender}` : (p.bhkType || 'Apartment');
                const img = p.images?.[0] || 'https://picsum.photos/id/1018/400/300';
                
                return (
                  <div
                    key={idx}
                    onClick={() => router.push(`/property/${p._id}`)}
                    className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col sm:flex-row h-auto sm:h-[135px]"
                  >
                    {/* Image Area */}
                    <div className="relative w-full sm:w-[150px] aspect-[16/9] sm:aspect-auto sm:h-full bg-slate-100 shrink-0">
                      <img
                        src={img}
                        alt={p.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isSaved = wishlist.some(w => w._id === p._id);
                          if (isSaved) {
                            removeFromWishlist(p._id);
                          } else {
                            addToWishlist({
                              _id: p._id,
                              title: p.title || 'Untitled Stay',
                              price: p.rent,
                              typeStr: typeStr,
                              img: img
                            });
                          }
                        }}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/95 shadow-sm border border-slate-100 flex items-center justify-center hover:bg-white active:scale-90 transition-transform"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            wishlist.some(w => w._id === p._id) ? 'fill-[#ec38b7] text-[#ec38b7]' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Distance Badge */}
                      {p.distance !== null && (
                        <div className="absolute bottom-2 right-2 bg-slate-900/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wider">
                          {p.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-base font-black text-slate-900 leading-tight">
                            ₹{p.rent?.toLocaleString()}{' '}
                            <span className="text-[10px] font-normal text-slate-400">/ month</span>
                          </h3>
                          <span
                            className={`shrink-0 font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm border ${
                              typeStr.includes('BOYS') ? 'bg-blue-600 text-white border-blue-700' :
                              typeStr.includes('GIRLS') ? 'bg-[#ec38b7] text-white border-pink-600' :
                              typeStr.includes('CO-LIVING') ? 'bg-purple-600 text-white border-purple-700' :
                              'bg-slate-700 text-white border-slate-800'
                            }`}
                          >
                            {typeStr}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 truncate">{p.title}</h4>
                        <div className="flex items-center gap-1 mt-1.5 text-slate-500 text-[10px] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {p.location?.area || 'Unknown Area'}, {p.location?.city || formattedDistrictName}
                          </span>
                        </div>
                      </div>

                      {/* Badges footer */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50/50">
                        <div className="flex items-center gap-0.5 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold">
                          Verified
                        </div>
                        {p.preferences?.bachelorAllowed && (
                          <div className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Bachelors Ok
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-8 flex flex-col items-center text-center mt-6">
            <SlidersHorizontal className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="font-extrabold text-slate-800 text-sm mb-1">No Matches Found</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-5">
              We couldn't find properties in this district matching your selected filters. Try clearing or expanding your range.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                handleResetFilters();
              }}
              className="px-5 py-2 bg-[#801786] text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-transform"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* OVERLAY 1: CATEGORY SHEET */}
      <AnimatePresence>
        {isCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md bg-white rounded-t-[24px] shadow-2xl p-6 border-t border-slate-100 flex flex-col z-10"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Select Property Category</h3>
                <button
                  onClick={() => setIsCategoryOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {[
                  { id: 'all', label: 'All Stays', desc: 'Display all properties without target category', icon: Home },
                  { id: 'students', label: 'Students & Bachelors', desc: 'Show PG rooms, shared flats, and hostels', icon: GraduationCap },
                  { id: 'family', label: 'Family Homes', desc: 'Show rental flats, villas, and houses for family', icon: Home },
                  { id: 'commercial', label: 'Commercial Properties', desc: 'Show offices, rental shops, and warehouses', icon: Building }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedCategory === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCategory(item.id as any);
                        setIsCategoryOpen(false);
                        // Open filters directly after category to configure details
                        setIsFiltersOpen(true);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all active:scale-98 ${
                        isSelected
                          ? 'border-[#801786] bg-purple-50/50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#801786] text-white' : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isSelected ? 'text-[#801786]' : 'text-slate-900'}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#801786] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY 2: PRICE & DETAILS FILTERS SHEET */}
      <AnimatePresence>
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFiltersOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md bg-white rounded-t-[24px] shadow-2xl flex flex-col z-10 max-h-[85vh]"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 shrink-0" />
              
              {/* Header */}
              <div className="px-6 py-2 flex items-center justify-between border-b border-slate-50 shrink-0">
                <div>
                  <h3 className="text-base font-black text-slate-900">Configure Filters</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Category: {selectedCategory}
                  </p>
                </div>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                
                {/* 1. Price Sort */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Price Sorting
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Default' },
                      { id: 'low-to-high', label: 'Low → High' },
                      { id: 'high-to-low', label: 'High → Low' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedPriceSort(item.id as any)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                          selectedPriceSort === item.id
                            ? 'border-[#801786] bg-purple-50 text-[#801786]'
                            : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Contextual Sub-filters */}
                {selectedCategory === 'students' && (
                  <div className="space-y-5">
                    {/* Stay Type */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Property Type</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'all', label: 'All Stays' },
                          { id: 'pg', label: 'PG / Hostel' },
                          { id: 'apartment', label: 'Apartment' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setStudentPropertyType(item.id as any)}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                              studentPropertyType === item.id
                                ? 'border-[#801786] bg-purple-50 text-[#801786]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PG Gender */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">PG Gender Preference</h4>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'all', label: 'Any' },
                          { id: 'boys', label: 'Boys' },
                          { id: 'girls', label: 'Girls' },
                          { id: 'coliving', label: 'Co-Living' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setStudentGender(item.id as any)}
                            className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-colors ${
                              studentGender === item.id
                                ? 'border-[#801786] bg-purple-50 text-[#801786]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bachelors Allowed */}
                    <div>
                      <button
                        onClick={() => setBachelorAllowedOnly(!bachelorAllowedOnly)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-colors ${
                          bachelorAllowedOnly
                            ? 'border-[#801786] bg-purple-50/50'
                            : 'border-slate-100 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">Only Bachelors Allowed Stays</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Filter for properties explicitly welcoming bachelors</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            bachelorAllowedOnly
                              ? 'bg-[#801786] border-[#801786] text-white'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          {bachelorAllowedOnly && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {selectedCategory === 'family' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">BHK Selection</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['1 BHK', '2 BHK', '3 BHK', '4 BHK+'].map((bhk) => {
                        const isSelected = familyBhks.includes(bhk);
                        return (
                          <button
                            key={bhk}
                            onClick={() => toggleSelection(familyBhks, bhk, setFamilyBhks)}
                            className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'border-[#801786] bg-purple-50 text-[#801786]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            <span>{bhk}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedCategory === 'commercial' && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Space Type</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {['Office Space', 'Warehouse', 'Rental Shop', 'Commercial Land', 'Other'].map((type) => {
                        const isSelected = commercialTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleSelection(commercialTypes, type, setCommercialTypes)}
                            className={`py-2.5 px-4 text-xs font-bold rounded-xl border flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'border-[#801786] bg-purple-50 text-[#801786]'
                                : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                            }`}
                          >
                            <span>{type}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedCategory === 'all' && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">Advanced Filters Locked</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        To unlock layouts, pg genders, or commercial sub-filters, click the left button "Category" to select a specific type first.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3 shrink-0">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors bg-white text-slate-700 active:scale-98"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="flex-1 py-3 text-xs font-bold bg-[#801786] text-white rounded-xl shadow-md hover:bg-opacity-95 transition-all active:scale-98 text-center"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Scrollbar hide utility stylesheet */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
