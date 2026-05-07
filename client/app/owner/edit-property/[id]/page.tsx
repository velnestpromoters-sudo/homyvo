"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const token = useAuthStore(state => state.token);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
     title: '',
     rent: '',
     deposit: '',
     bhkType: '',
     tenantNotes: '',
     furnishing: 'none',
     availability: 'immediate',
     availableFrom: '',
     amenities: [] as string[],
     floor: '',
     totalFloors: '',
     areaSqft: '',
     propertyAge: '',
     highlights: [] as string[],
     contactNumbers: { primary: '', alternate: '' },
     location: {
       address: '',
       area: '',
       city: '',
       googleMapLink: ''
     }
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!token) return router.push('/owner');
      try {
        const res = await fetch(`/api/properties/${propertyId}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
           const p = json.data;
           setFormData({
              title: p.title || '',
              rent: p.rent || '',
              deposit: p.deposit || '',
              bhkType: p.bhkType || '',
              tenantNotes: p.tenantNotes || '',
              furnishing: p.furnishing || 'none',
              availability: p.availability || 'immediate',
              availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().split('T')[0] : '',
              amenities: p.amenities || [],
              floor: p.floor || '',
              totalFloors: p.totalFloors || '',
              areaSqft: p.areaSqft || '',
              propertyAge: p.propertyAge || '',
              highlights: p.highlights || [],
              contactNumbers: p.contactNumbers || { primary: '', alternate: '' },
              location: p.location || { address: '', area: '', city: '', googleMapLink: '' }
           });
        } else {
           alert("Failed to load property.");
           router.back();
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, token, router]);

  const handleAmenityToggle = (amenity: string) => {
      setFormData(prev => {
          const isSelected = prev.amenities.includes(amenity);
          if (isSelected) return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
          return { ...prev, amenities: [...prev.amenities, amenity] };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSaving(true);
     try {
         const res = await fetch(`/api/properties/${propertyId}`, {
             method: 'PATCH',
             headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
             },
             body: JSON.stringify(formData)
         });
         const json = await res.json();
         if (json.success) {
             alert('Property successfully updated!');
             router.push('/owner/dashboard');
         } else {
             alert('Update failed: ' + json.message);
         }
     } catch (err) {
         console.error('Update Request failed', err);
         alert('Network error. Failed to save.');
     } finally {
         setIsSaving(false);
     }
  };

  if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[100dvh]">
             <Loader2 className="w-10 h-10 animate-spin text-[#801786]" />
         </div>
      );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-20">
      <header className="px-5 py-4 bg-white border-b sticky top-0 z-20 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
               <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Edit Attributes</h1>
         </div>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
         <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <label className="block text-sm font-bold text-gray-700 mb-2">Property Title</label>
               <input 
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
               />
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
               <h3 className="font-bold text-gray-800 border-b pb-2">Location Details</h3>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Complete Address</label>
                  <textarea 
                     rows={2} required
                     value={formData.location.address}
                     onChange={e => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Area / Locality</label>
                     <input 
                        type="text" required
                        value={formData.location.area}
                        onChange={e => setFormData({...formData, location: {...formData.location, area: e.target.value}})}
                        className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                     <input 
                        type="text" required
                        value={formData.location.city}
                        onChange={e => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                        className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps Link</label>
                  <input 
                     type="url"
                     value={formData.location.googleMapLink}
                     onChange={e => setFormData({...formData, location: {...formData.location, googleMapLink: e.target.value}})}
                     placeholder="https://maps.google.com/..."
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rent (₹)</label>
                  <input 
                     type="number" required
                     value={formData.rent}
                     onChange={e => setFormData({...formData, rent: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deposit (₹)</label>
                  <input 
                     type="number" required
                     value={formData.deposit}
                     onChange={e => setFormData({...formData, deposit: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Floor Number</label>
                  <input 
                     type="number" 
                     value={formData.floor}
                     onChange={e => setFormData({...formData, floor: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Floors</label>
                  <input 
                     type="number" 
                     value={formData.totalFloors}
                     onChange={e => setFormData({...formData, totalFloors: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Area (Sq.ft)</label>
                  <input 
                     type="number" 
                     value={formData.areaSqft}
                     onChange={e => setFormData({...formData, areaSqft: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Property Age</label>
                  <select 
                     value={formData.propertyAge}
                     onChange={e => setFormData({...formData, propertyAge: e.target.value})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786] bg-white"
                  >
                     <option value="">Select Age</option>
                     <option value="0-1 Year">0-1 Year</option>
                     <option value="1-5 Years">1-5 Years</option>
                     <option value="5-10 Years">5-10 Years</option>
                     <option value="10+ Years">10+ Years</option>
                  </select>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person Name</label>
                  <input 
                     type="text" required
                     value={formData.contactNumbers.name}
                     onChange={e => setFormData({...formData, contactNumbers: {...formData.contactNumbers, name: e.target.value}})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Primary Mobile</label>
                  <input 
                     type="tel" required pattern="[0-9]{10}"
                     value={formData.contactNumbers.primary}
                     onChange={e => setFormData({...formData, contactNumbers: {...formData.contactNumbers, primary: e.target.value}})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alternate Mobile</label>
                  <input 
                     type="tel" pattern="[0-9]{10}"
                     value={formData.contactNumbers.alternate}
                     onChange={e => setFormData({...formData, contactNumbers: {...formData.contactNumbers, alternate: e.target.value}})}
                     className="w-full border p-3 rounded-xl outline-none focus:border-[#801786]"
                  />
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
               <label className="block text-sm font-bold text-gray-800">Amenities Provided</label>
               <div className="grid grid-cols-2 gap-3">
                  {['WiFi', 'Parking', 'AC', 'Attached Bathroom', 'Power Backup', 'Washing Machine', 'Fridge', 'TV'].map(amenity => (
                     <label key={amenity} className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <input 
                           type="checkbox" 
                           className="accent-[#801786] w-4 h-4 cursor-pointer"
                           checked={formData.amenities.includes(amenity.toLowerCase())}
                           onChange={() => handleAmenityToggle(amenity.toLowerCase())}
                        />
                        <span className="font-semibold text-sm text-gray-700">{amenity}</span>
                     </label>
                  ))}
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <label className="block text-sm font-bold text-gray-800 mb-3">Furnishing Status</label>
               <div className="flex gap-3">
                  {['full', 'semi', 'none'].map(status => (
                     <button
                        key={status} type="button"
                        onClick={() => setFormData({...formData, furnishing: status})}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase border transition-colors ${formData.furnishing === status ? 'border-[#801786] bg-[#801786] text-white shadow-md' : 'border-gray-200 bg-white text-gray-500'}`}
                     >
                        {status === 'none' ? 'Unfurnished' : `${status} Furnished`}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3">
               <label className="block text-sm font-bold text-gray-800">Availability *</label>
               <div className="flex gap-3">
                  {[{id: 'immediate', label: 'Immediate'}, {id: 'next_month', label: 'Next Month'}, {id: 'specific_date', label: 'Select Date'}].map(opt => (
                     <button
                        key={opt.id} type="button"
                        onClick={() => setFormData({...formData, availability: opt.id})}
                        className={`flex-1 py-3 px-2 text-center rounded-xl font-bold text-xs uppercase border transition-colors ${formData.availability === opt.id ? 'border-[#801786] bg-[#801786] text-white shadow-md' : 'border-gray-200 bg-white text-gray-500'}`}
                     >
                        {opt.label}
                     </button>
                  ))}
               </div>
               {formData.availability === 'specific_date' && (
                  <div className="mt-3 animate-in fade-in">
                     <label className="block text-xs font-bold text-gray-500 mb-1">Available From</label>
                     <input 
                        type="date" required
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
                        className="w-full border-2 p-3 rounded-xl outline-none"
                     />
                  </div>
               )}
            </div>

             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-gray-800 mb-1">Key Highlights (comma separated)</label>
                <textarea 
                   rows={2}
                   value={formData.highlights.join(', ')}
                   onChange={e => {
                      const val = e.target.value;
                      const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData({...formData, highlights: arr});
                   }}
                   placeholder="e.g. North Facing, Vaastu Compliant, Close to Airport"
                   className="w-full border p-3 rounded-xl focus:border-[#801786] outline-none mb-5"
                   style={{ resize: 'none' }}
                />

               <label className="block text-sm font-bold text-gray-800 mb-1">Special Notes for Tenants</label>
               <textarea 
                  rows={3}
                  value={formData.tenantNotes}
                  onChange={(e) => setFormData({...formData, tenantNotes: e.target.value})}
                  className="w-full border p-3 rounded-xl focus:border-[#801786] outline-none"
                  style={{ resize: 'none' }}
               />
            </div>

            <button type="submit" disabled={isSaving} className="w-full bg-[#801786] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#a61c92] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
               {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
               {isSaving ? 'Updating...' : 'Save Configuration'}
            </button>
         </form>
      </main>
    </div>
  );
}
