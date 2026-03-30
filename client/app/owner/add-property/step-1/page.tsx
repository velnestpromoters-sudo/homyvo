"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step1() {
  const router = useRouter();
  const { title, rent, deposit, bhkType, updateField } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-2');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Basic Details</h2>
       <p className="text-sm text-gray-500 mb-8">Let's start with the core numbers.</p>

       <form onSubmit={handleNext} className="flex flex-col gap-6">
          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Property Title *</label>
             <input 
                type="text" 
                required
                value={title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Modern 2BHK in Downtown"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Rent *</label>
                 <div className="relative">
                    <span className="absolute left-4 top-4 font-bold text-gray-400">₹</span>
                    <input 
                        type="number" 
                        required
                        value={rent}
                        onChange={(e) => updateField('rent', e.target.value)}
                        placeholder="15000"
                        className="w-full border-2 border-gray-200 p-4 pl-8 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
                    />
                 </div>
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Deposit *</label>
                 <div className="relative">
                    <span className="absolute left-4 top-4 font-bold text-gray-400">₹</span>
                    <input 
                        type="number" 
                        required
                        value={deposit}
                        onChange={(e) => updateField('deposit', e.target.value)}
                        placeholder="50000"
                        className="w-full border-2 border-gray-200 p-4 pl-8 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none transition-colors"
                    />
                 </div>
              </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">BHK Type *</label>
             <select 
                required
                value={bhkType}
                onChange={(e) => updateField('bhkType', e.target.value)}
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#FF5A1F] focus:ring-0 outline-none bg-white appearance-none"
             >
                <option value="" disabled>Select Layout</option>
                <option value="1RK">1 RK</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK+">4 BHK+</option>
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
