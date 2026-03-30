"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step3() {
  const router = useRouter();
  const { preferences, moveInReady, updateField, updatePreference } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-4');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Preferences</h2>
       <p className="text-sm text-gray-500 mb-8">What are your rules for tenants?</p>

       <form onSubmit={handleNext} className="flex flex-col gap-6">
          <div className="bg-white p-5 border-2 rounded-xl flex justify-between items-center shadow-sm">
             <div>
                <p className="font-bold text-gray-800">Bachelors Allowed?</p>
                <p className="text-xs text-gray-500 mt-1">Accept singles, students, bachelors.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={preferences.bachelorAllowed}
                   onChange={(e) => updatePreference('bachelorAllowed', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5A1F]"></div>
             </label>
          </div>

          <div className="bg-white p-5 border-2 rounded-xl flex justify-between items-center shadow-sm">
             <div>
                <p className="font-bold text-gray-800">Move-in Ready?</p>
                <p className="text-xs text-gray-500 mt-1">Available to occupy immediately.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={moveInReady}
                   onChange={(e) => updateField('moveInReady', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5A1F]"></div>
             </label>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Max Occupants *</label>
             <select 
                value={preferences.maxOccupants}
                onChange={(e) => updatePreference('maxOccupants', e.target.value)}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none bg-white appearance-none"
             >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5+">5+ People</option>
             </select>
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
