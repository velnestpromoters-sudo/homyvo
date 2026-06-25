"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';
import { getCurrentPrecisePosition } from '@/utils/geolocation';

export default function Step2() {
  const router = useRouter();
  const { location, updateLocation } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-3');
  };

  const handleGPSDetect = () => {
    if ("geolocation" in navigator) {
        getCurrentPrecisePosition(
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
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Pin the Location</h2>
       <p className="text-sm text-gray-500 mb-8">Where exactly is this property?</p>

       <form onSubmit={handleNext} className="flex flex-col gap-5 pb-24">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Current Location Link *</label>
             <input 
                type="url" 
                required
                value={location.googleMapLink}
                onChange={(e) => updateLocation('googleMapLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                pattern="https?://.*"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none transition-colors"
             />
             <p className="text-xs text-gray-400 mt-2">Mandatory for verification routing.</p>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
             <textarea 
                required
                rows={3}
                value={location.address}
                onChange={(e) => updateLocation('address', e.target.value)}
                placeholder="House No., Street Name, Landmark"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none transition-colors resize-none"
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
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none transition-colors"
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
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none transition-colors"
                 />
              </div>
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-50 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:static md:shadow-none md:border-0 md:bg-transparent">
             {/* Left Bottom: Next/Confirm */}
             <button type="submit" className="flex-[0.5] flex items-center justify-center gap-2 bg-[#801786] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#a61c92] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Confirm
             </button>
             
             {/* Right Bottom: Track / GPS */}
             <button 
                type="button" 
                onClick={handleGPSDetect}
                className="flex-[0.5] flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-black transition-colors"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-5 10-5 10s-5-6.483-5-10a5 5 0 0110 0z"></path><circle cx="6" cy="11" r="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle></svg>
                Track GPS
             </button>
          </div>
       </form>
    </div>
  );
}
