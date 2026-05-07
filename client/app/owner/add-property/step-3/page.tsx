"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step3() {
  const router = useRouter();
  const { propertyType, pgDetails, preferences, contactNumbers, updateField, updatePreference, updatePgDetails, updateContactNumbers, amenities, furnishing, availability, availableFrom } = usePropertyFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/owner/add-property/step-4');
  };

  const handleSharingToggle = (num: number) => {
     const current = [...pgDetails.sharingTypes];
     if (current.includes(num)) {
        updatePgDetails('sharingTypes', current.filter(n => n !== num));
        updatePgDetails('rooms', pgDetails.rooms.filter(r => r.sharing !== num));
     } else {
        updatePgDetails('sharingTypes', [...current, num]);
        updatePgDetails('rooms', [...pgDetails.rooms, { sharing: num, totalBeds: '', availableBeds: '' }]);
     }
  };

  const updateRoomState = (sharingNum: number, field: 'totalBeds' | 'availableBeds', value: string) => {
     const newRooms = pgDetails.rooms.map(r => {
        if (r.sharing === sharingNum) return { ...r, [field]: value };
        return r;
     });
     updatePgDetails('rooms', newRooms);
  };

  const handleAmenityToggle = (amenity: string) => {
      const isSelected = amenities.includes(amenity);
      if (isSelected) {
          updateField('amenities', amenities.filter(a => a !== amenity));
      } else {
          updateField('amenities', [...amenities, amenity]);
      }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Details & Preferences</h2>
       <p className="text-sm text-gray-500 mb-8">Configure your property features and tenant rules.</p>

       <form onSubmit={handleNext} className="flex flex-col gap-6">

          {/* AMENITIES */}
          <div className="bg-white p-5 border-2 rounded-xl flex flex-col shadow-sm gap-3">
             <label className="block text-sm font-bold text-gray-800">Amenities Provided</label>
             <div className="grid grid-cols-2 gap-3">
                {['WiFi', 'Parking', 'AC', 'Attached Bathroom', 'Power Backup', 'Washing Machine', 'Fridge', 'TV'].map(amenity => (
                   <label key={amenity} className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100 transition-colors hover:border-slate-300">
                      <input 
                         type="checkbox" 
                         className="accent-[#801786] w-4 h-4 cursor-pointer"
                         checked={amenities.includes(amenity.toLowerCase())}
                         onChange={() => handleAmenityToggle(amenity.toLowerCase())}
                      />
                      <span className="font-semibold text-sm text-gray-700">{amenity}</span>
                   </label>
                ))}
             </div>
          </div>

          {/* FURNISHING */}
          <div className="bg-white p-5 border-2 rounded-xl flex flex-col shadow-sm gap-3">
             <label className="block text-sm font-bold text-gray-800">Furnishing Status *</label>
             <div className="flex gap-3">
                {['full', 'semi', 'none'].map(status => (
                   <button
                      key={status} type="button"
                      onClick={() => updateField('furnishing', status)}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-colors ${furnishing === status ? 'border-[#801786] bg-[#801786] text-white shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:bg-slate-50'}`}
                   >
                      {status === 'none' ? 'Unfurnished' : `${status} Furnished`}
                   </button>
                ))}
             </div>
          </div>

          {/* AVAILABILITY */}
          <div className="bg-white p-5 border-2 rounded-xl flex flex-col shadow-sm gap-3">
             <label className="block text-sm font-bold text-gray-800">Availability *</label>
             <div className="flex gap-3">
                {[{id: 'immediate', label: 'Immediate'}, {id: 'next_month', label: 'Next Month'}, {id: 'specific_date', label: 'Select Date'}].map(opt => (
                   <button
                      key={opt.id} type="button"
                      onClick={() => {
                         updateField('availability', opt.id);
                         if (opt.id === 'immediate') updateField('moveInReady', true);
                         else updateField('moveInReady', false);
                      }}
                      className={`flex-1 py-3 px-2 text-center rounded-xl font-bold text-xs uppercase tracking-wider border transition-colors ${availability === opt.id ? 'border-[#801786] bg-[#801786] text-white shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:bg-slate-50'}`}
                   >
                      {opt.label}
                   </button>
                ))}
             </div>
             {availability === 'specific_date' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                   <label className="block text-xs font-bold text-gray-500 mb-1">Available From</label>
                   <input 
                      type="date"
                      required
                      value={availableFrom}
                      onChange={(e) => updateField('availableFrom', e.target.value)}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#801786] outline-none"
                   />
                </div>
             )}
          </div>

          {/* CONTACT NUMBERS */}
          <div className="bg-white p-5 border-2 rounded-xl flex flex-col shadow-sm gap-4">
             <label className="block text-sm font-bold text-gray-800">Contact Details for this Property *</label>
             <div className="flex flex-col gap-3">
                <div>
                   <span className="text-xs font-bold text-gray-500 block mb-1">Primary Mobile Number *</span>
                   <input 
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9876543210"
                      value={contactNumbers.primary}
                      onChange={(e) => updateContactNumbers('primary', e.target.value)}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#801786] outline-none"
                   />
                </div>
                <div>
                   <span className="text-xs font-bold text-gray-500 block mb-1">Alternate Mobile Number (Optional)</span>
                   <input 
                      type="tel"
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9123456780"
                      value={contactNumbers.alternate}
                      onChange={(e) => updateContactNumbers('alternate', e.target.value)}
                      className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#801786] outline-none"
                   />
                </div>
             </div>
          </div>

          {/* PG DETAILS */}
          {propertyType === 'pg' && (
             <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 flex flex-col gap-5 mt-2">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">PG Target Audience *</label>
                   <div className="grid grid-cols-3 gap-2">
                      {['boys', 'girls', 'co-living'].map(g => (
                         <button 
                            key={g} type="button"
                            onClick={() => updatePgDetails('gender', g)}
                            className={`py-3 rounded-xl font-bold text-sm capitalize border-2 transition-colors ${pgDetails.gender === g ? 'border-[#801786] bg-[#801786] text-white' : 'border-gray-200 bg-white text-gray-500'}`}
                         >
                            {g}
                         </button>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Total Rooms in PG *</label>
                   <input 
                      type="number" required
                      value={pgDetails.totalRooms}
                      onChange={e => updatePgDetails('totalRooms', e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full border-2 border-white p-4 rounded-xl focus:border-[#801786] outline-none"
                   />
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Sharing Types Available *</label>
                   <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6].map(num => (
                         <label key={num} className={`p-3 border-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${pgDetails.sharingTypes.includes(num) ? 'border-[#801786] bg-white text-[#801786]' : 'border-white bg-white text-gray-500 hover:border-gray-200'}`}>
                            <input 
                               type="checkbox" 
                               className="accent-[#801786] w-4 h-4 cursor-pointer"
                               checked={pgDetails.sharingTypes.includes(num)}
                               onChange={() => handleSharingToggle(num)}
                            />
                            <span className="font-bold text-sm tracking-wide">{num} Sharing</span>
                         </label>
                      ))}
                   </div>
                </div>

                {pgDetails.sharingTypes.length > 0 && (
                   <div className="mt-2 flex flex-col gap-3">
                      <label className="block text-sm font-bold text-gray-700">Bed Inventory Config *</label>
                      {pgDetails.sharingTypes.sort().map(num => {
                         const room = pgDetails.rooms.find(r => r.sharing === num) || { totalBeds: '', availableBeds: '' };
                         return (
                            <div key={num} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                               <div className="font-black text-[#801786] mb-3">{num} Sharing Rooms</div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <span className="text-xs font-bold text-gray-500 block mb-1">Total Beds</span>
                                     <input type="number" required value={room.totalBeds} onChange={e => updateRoomState(num, 'totalBeds', e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-[#801786]" placeholder="e.g. 20" />
                                  </div>
                                  <div>
                                     <span className="text-xs font-bold text-gray-500 block mb-1">Available Beds</span>
                                     <input type="number" required value={room.availableBeds} onChange={e => updateRoomState(num, 'availableBeds', e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:border-[#801786]" placeholder="e.g. 5" />
                                  </div>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                )}
             </div>
          )}

          {/* APARTMENT DETAILS */}
          {propertyType === 'apartment' && (
             <>
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801786]"></div>
                   </label>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Max Occupants *</label>
                   <select 
                      value={preferences.maxOccupants}
                      onChange={(e) => updatePreference('maxOccupants', e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-[#801786] focus:ring-0 outline-none bg-white appearance-none"
                   >
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5+">5+ People</option>
                   </select>
                </div>
             </>
          )}

          <div className="bg-white p-5 border-2 rounded-xl flex flex-col shadow-sm gap-2 mb-[80px]">
             <label className="block text-sm font-bold text-gray-800">Special Notes for Tenants (Optional)</label>
             <p className="text-xs text-gray-500 mb-1">E.g., "Veg only", "Gate closes at 10 PM", "Quiet hours after 11 PM"</p>
             <textarea 
                rows={3}
                value={usePropertyFormStore(state => state.tenantNotes)}
                onChange={(e) => updateField('tenantNotes', e.target.value)}
                placeholder="Write any special instructions here..."
                className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#801786] focus:ring-1 focus:ring-[#801786] outline-none bg-slate-50 transition-colors"
                style={{ resize: 'none' }}
             />
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 md:mt-4">
             <button type="submit" className="w-full bg-[#801786] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#a61c92] transition-colors">
                Next Step →
             </button>
          </div>
       </form>
    </div>
  );
}
