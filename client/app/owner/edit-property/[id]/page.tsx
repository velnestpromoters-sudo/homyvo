"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Save, Loader2, MapPin, Navigation, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapInteractive = dynamic(() => import('@/components/map/MapBackground'), { ssr: false });

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
     contactNumbers: { name: '', primary: '', alternate: '' },
     location: {
       address: '',
       area: '',
       city: '',
       googleMapLink: ''
     }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPickerCoords, setMapPickerCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [forceFlyTo, setForceFlyTo] = useState<[number, number] | null>(null);

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
              contactNumbers: p.contactNumbers || { name: '', primary: '', alternate: '' },
              location: p.location || { address: '', area: '', city: '', googleMapLink: '' }
           });

           // Parse initial coordinates for map picker
           let initialCoords = null;
           if (p.location?.coordinates?.coordinates && p.location.coordinates.coordinates.length >= 2) {
             initialCoords = {
               lat: p.location.coordinates.coordinates[1],
               lng: p.location.coordinates.coordinates[0]
             };
           } else if (p.location?.googleMapLink) {
             const link = p.location.googleMapLink;
             const match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
             if (match) initialCoords = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
             const matchQ = link.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
             if (matchQ) initialCoords = { lat: parseFloat(matchQ[1]), lng: parseFloat(matchQ[2]) };
           }

           const isWithinIndia = initialCoords && 
                                 initialCoords.lat >= 8 && initialCoords.lat <= 38 && 
                                 initialCoords.lng >= 68 && initialCoords.lng <= 98;

           setMapPickerCoords(isWithinIndia ? initialCoords : { lat: 22.5937, lng: 78.9629 });
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

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const bdcData = await bdcRes.json();
            const area = bdcData.locality || bdcData.city || '';
            const city = bdcData.city || bdcData.principalSubdivision || '';
            
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                googleMapLink: `https://maps.google.com/?q=${latitude},${longitude}`,
                area: prev.location.area || area,
                city: prev.location.city || city
              }
            }));
            setMapPickerCoords({ lat: latitude, lng: longitude });
            setForceFlyTo([latitude, longitude]);
          } catch (e) {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                googleMapLink: `https://maps.google.com/?q=${latitude},${longitude}`
              }
            }));
          } finally {
            setIsLocating(false);
          }
        },
        (err) => {
          console.error(err);
          alert("Location access denied or failed. Please check browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleOpenMapModal = () => {
     const isDefaultOrOutsideIndia = !mapPickerCoords ||
                                     (mapPickerCoords.lat === 22.5937 && mapPickerCoords.lng === 78.9629) ||
                                     mapPickerCoords.lat < 8 || mapPickerCoords.lat > 38 ||
                                     mapPickerCoords.lng < 68 || mapPickerCoords.lng > 98;
                           
     if (!isDefaultOrOutsideIndia) {
        setForceFlyTo([mapPickerCoords.lat, mapPickerCoords.lng]);
     } else {
        setMapPickerCoords({ lat: 22.5937, lng: 78.9629 });
        setForceFlyTo(null);
     }
     setShowMapModal(true);
  };

  const handleConfirmMapLocation = async () => {
    if (!mapPickerCoords) return;
    const { lat, lng } = mapPickerCoords;
    
    try {
      const bdcRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const bdcData = await bdcRes.json();
      const area = bdcData.locality || bdcData.city || '';
      const city = bdcData.city || bdcData.principalSubdivision || '';
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          googleMapLink: `https://maps.google.com/?q=${lat},${lng}`,
          area: prev.location.area || area,
          city: prev.location.city || city
        }
      }));
    } catch (e) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          googleMapLink: `https://maps.google.com/?q=${lat},${lng}`
        }
      }));
    }
    
    setShowMapModal(false);
  };

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
                   
                   <div className="flex gap-3 mt-2.5">
                      <button 
                         type="button"
                         onClick={handleGetCurrentLocation}
                         disabled={isLocating}
                         className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
                      >
                         <Navigation className="w-3.5 h-3.5" />
                         {isLocating ? 'Locating...' : 'Use Current GPS'}
                      </button>
                      <button 
                         type="button"
                         onClick={handleOpenMapModal}
                         className="flex-1 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                      >
                         <MapPin className="w-3.5 h-3.5" />
                         Pick on Map
                      </button>
                   </div>
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

       {/* MAP PICKER MODAL */}
       {showMapModal && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[70vh]">
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                   <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Select Property Location</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Drag map to position center needle exactly over your property</p>
                   </div>
                   <button 
                      type="button" 
                      onClick={() => setShowMapModal(false)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                {/* Map Container */}
                <div className="flex-1 relative bg-slate-100">
                   <MapInteractive 
                      initialCoordinates={mapPickerCoords}
                      forceLocation={forceFlyTo}
                      onLocationUpdate={(lat, lng) => setMapPickerCoords({ lat, lng })}
                   />
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                   <button 
                      type="button"
                      onClick={() => setShowMapModal(false)}
                      className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-sm rounded-xl transition-colors active:scale-95"
                   >
                      Cancel
                   </button>
                   <button 
                      type="button"
                      onClick={handleConfirmMapLocation}
                      className="flex-1 py-3 bg-[#801786] text-white hover:bg-[#801786]/90 font-bold text-sm rounded-xl shadow-lg shadow-purple-900/10 transition-colors active:scale-95"
                   >
                      Confirm Location
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
