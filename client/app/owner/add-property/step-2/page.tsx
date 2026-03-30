"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step2() {
  const router = useRouter();
  const { location, updateLocation } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-3');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Pin the Location</h2>
       <p className="text-sm text-gray-500 mb-8">Where exactly is this property?</p>

       <form onSubmit={handleNext} className="flex flex-col gap-5">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps Link *</label>
             <div className="flex gap-2">
                 <input 
                    type="url" 
                    required
                    value={location.googleMapLink}
                    onChange={(e) => updateLocation('googleMapLink', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    pattern="https?://.*"
                    className="flex-1 w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
                 />
                 <button 
                    type="button" 
                    title="Detect Current Location"
                    onClick={() => {
                        if ("geolocation" in navigator) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    const { latitude, longitude } = position.coords;
                                    const mapURL = `https://maps.google.com/?q=${latitude},${longitude}`;
                                    updateLocation('googleMapLink', mapURL);
                                },
                                (err) => alert("Please allow Location Access in your browser settings to use this feature.")
                            );
                        } else {
                            alert("Geolocation is not supported by your browser.");
                        }
                    }}
                    className="p-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 hover:text-[#FF5A1F] hover:bg-orange-50 transition-colors"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-5 10-5 10s-5-6.483-5-10a5 5 0 0110 0z"></path><circle cx="6" cy="11" r="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle></svg>
                 </button>
             </div>
             <p className="text-xs text-gray-400 mt-2">Mandatory for verification routing. Tap the GPS icon to auto-fill.</p>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
             <textarea 
                required
                rows={3}
                value={location.address}
                onChange={(e) => updateLocation('address', e.target.value)}
                placeholder="House No., Street Name, Landmark"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors resize-none"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Area / Locality *</label>
                 <input 
                    type="text" 
                    required
                    value={location.area}
                    onChange={(e) => updateLocation('area', e.target.value)}
                    placeholder="e.g. Adyar"
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                 <input 
                    type="text" 
                    required
                    value={location.city}
                    onChange={(e) => updateLocation('city', e.target.value)}
                    placeholder="Chennai"
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
                 />
              </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 md:mt-4">
             <button type="submit" className="w-full bg-[#FF5A1F] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#E04812] transition-colors">
                Next Step →
             </button>
          </div>
       </form>
    </div>
  );
}
