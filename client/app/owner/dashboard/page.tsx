"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore(state => state.logout);
  const [properties, setProperties] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [availabilityModalData, setAvailabilityModalData] = useState<any>(null);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Basic auth wrap
    if (!isAuthenticated) {
      router.push('/home');
      return;
    }
    
    // Fetch owner's properties logic would go here
    const fetchProps = async () => {
      try {
         const token = useAuthStore.getState().token;
         const res = await fetch(`/api/properties`, {
             headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await res.json();
         // Filter to only this owner's if the backend doesn't automatically
         if (data.success) {
            setProperties(data.data.filter((p: any) => p.ownerId === user?._id || p.ownerId?._id === user?._id));
         }
      } catch (err) { console.error(err); }
    };
    fetchProps();
  }, [isAuthenticated, router, user]);

  const handleLogout = () => {
      logout();
      router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-6 shadow-sm border-b sticky top-0 z-20 flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-black text-gray-900">Owner Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Owner'}</p>
         </div>
         
         <div className="relative">
            <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="p-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm focus:outline-none"
            >
               <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
               <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-4 z-50">
                  <button 
                     onClick={() => router.push('/home')}
                     className="w-full text-left px-5 py-3 hover:bg-purple-50 text-slate-700 font-bold text-sm transition-colors flex items-center gap-3"
                  >
                     <svg className="w-4 h-4 text-[#801786]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                     Back to Home Search
                  </button>
                  <button 
                     onClick={() => router.push('/owner/add-property/step-1')}
                     className="w-full text-left px-5 py-3 hover:bg-purple-50 text-[#801786] font-black text-sm transition-colors flex items-center gap-3"
                  >
                     <svg className="w-4 h-4 text-[#801786]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                     Add New Property
                  </button>
                  <div className="h-px bg-slate-100 mx-4 my-1" />
                  <button 
                     onClick={handleLogout}
                     className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-500 font-bold text-sm transition-colors flex items-center gap-3"
                  >
                     <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                     Log Out
                  </button>
               </div>
            )}
            
            {/* Click away layer to close menu */}
            {isMenuOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
            )}
         </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-8 flex items-center justify-between">
            <div>
               <p className="text-gray-500 font-medium">Total Active Listings</p>
               <h2 className="text-4xl font-black text-gray-900 mt-1">{properties.length}</h2>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-[#801786]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">My Listings</h3>
        
        {properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
             <button 
                onClick={() => router.push('/owner/add-property/step-1')}
                className="text-[#801786] font-bold hover:underline"
             >
               Create your first listing →
             </button>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
             {properties.map((prop: any) => (
                <div 
                   key={prop._id} 
                   onClick={() => setSelectedProperty(prop)}
                   className="relative rounded-2xl overflow-hidden flex flex-col justify-end min-w-[200px] h-[340px] snap-center shrink-0 shadow-lg border border-gray-200/50 transition-transform hover:-translate-y-1 cursor-pointer hover:shadow-xl group"
                >
                   
                   {/* Full Background Image */}
                   <div className="absolute inset-0 bg-gray-900 border border-black/10 transition-transform duration-500 group-hover:scale-105">
                      {prop.images && prop.images[0] ? (
                         <img src={prop.images[0]} alt="Property" className="w-full h-full object-cover" />
                      ) : (
                         <div className="flex items-center justify-center w-full h-full text-white/30 text-xs font-bold">No Image</div>
                      )}
                   </div>

                   {/* Dark Gradient Overlay for text readability (Reel style) */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

                   {/* Top Left Menu Trigger */}
                   <button 
                      onClick={(e) => {
                         e.stopPropagation(); // Prevent launching the photo reel
                         setAvailabilityModalData(prop);
                      }}
                      className="absolute top-3 left-3 z-20 p-1.5 bg-black/40 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white hover:bg-black/60 transition-colors"
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                   </button>

                   {/* Floating Top Right Tag */}
                   <div className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-green-500/30 backdrop-blur-md text-green-300 text-[10px] uppercase tracking-wider font-black rounded-full shadow-lg border border-green-500/40">
                      Active
                   </div>

                   {/* Bottom Overlaid Text Block */}
                   <div className="relative z-10 p-4 flex flex-col pb-5">
                      <p className="text-white text-xl font-black drop-shadow-md tracking-tight">₹{prop.rent.toLocaleString()}<span className="text-xs text-white/80 font-medium ml-0.5">/mo</span></p>
                      <h4 className="font-bold text-white text-[15px] line-clamp-1 mt-1 drop-shadow-md">{prop.title}</h4>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                         <svg className="w-3.5 h-3.5 text-[#ec38b7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         <p className="text-xs text-white/90 line-clamp-1 font-medium drop-shadow-md">{prop.location?.area || 'Area not specified'}</p>
                      </div>
                   </div>

                </div>
             ))}
          </div>
        )}
      </div>

      {/* QUICK AVAILABILITY EDITOR MODAL */}
      {availabilityModalData && (
         <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative animate-in slide-in-from-bottom-8">
               <div className="bg-gray-50 border-b p-5 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 text-lg">Update Availability</h3>
                  <button onClick={() => setAvailabilityModalData(null)} className="p-1 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
               </div>
               
               <form 
                  className="p-5 flex flex-col gap-5"
                  onSubmit={async (e) => {
                     e.preventDefault();
                     try {
                        setIsUpdatingAvailability(true);
                        const token = useAuthStore.getState().token;
                        
                        let payload: any = {};
                        if (availabilityModalData.propertyType === 'pg') {
                           // Extract dynamic values directly off the form elements
                           const formEl = e.currentTarget;
                           const inputs = Array.from(formEl.querySelectorAll('.bed-input')) as HTMLInputElement[];
                           const mappedRooms = inputs.map(input => ({
                               sharing: Number(input.dataset.sharing),
                               availableBeds: Number(input.value)
                           }));
                           payload.rooms = mappedRooms;
                        } else {
                           // Apartment Booleans
                           const moveInReadyCheckbox = e.currentTarget.querySelector('input[name="moveInReady"]') as HTMLInputElement;
                           const bachelorAllowedCheckbox = e.currentTarget.querySelector('input[name="bachelorAllowed"]') as HTMLInputElement;
                           if (moveInReadyCheckbox) payload.moveInReady = moveInReadyCheckbox.checked;
                           if (bachelorAllowedCheckbox) payload.bachelorAllowed = bachelorAllowedCheckbox.checked;
                        }

                        // Attach Tenant Notes safely
                        const notesArea = e.currentTarget.querySelector('textarea') as HTMLTextAreaElement;
                        payload.tenantNotes = notesArea.value;

                        const res = await fetch(`/api/properties/${availabilityModalData._id}/availability`, {
                           method: 'PUT',
                           headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                           },
                           body: JSON.stringify(payload)
                        });

                        const data = await res.json();
                        if (data.success) {
                           // Target the specific property locally so we don't have to re-fetch EVERYTHING
                           setProperties((prevStatus: any) => prevStatus.map((p: any) => p._id === availabilityModalData._id ? data.data : p));
                           setAvailabilityModalData(null);
                        } else {
                           console.error(data.message);
                           alert("Failed to update details");
                        }
                     } catch(err) {
                        console.error(err);
                     } finally {
                        setIsUpdatingAvailability(false);
                     }
                  }}
               >
                  <p className="text-sm font-bold text-[#801786]">{availabilityModalData.title}</p>
                  
                  {availabilityModalData.propertyType === 'pg' ? (
                     <div className="flex flex-col gap-3">
                        {availabilityModalData.pgDetails?.rooms?.map((room: any) => (
                           <div key={room.sharing} className="flex justify-between items-center p-3 border rounded-xl bg-slate-50">
                              <div>
                                 <p className="font-bold text-gray-800 tracking-tight">{room.sharing} Sharing Room</p>
                                 <p className="text-xs text-gray-500 font-medium">{room.totalBeds} total beds config</p>
                              </div>
                              <input 
                                 type="number" 
                                 data-sharing={room.sharing}
                                 defaultValue={room.availableBeds} 
                                 max={room.totalBeds}
                                 min={0}
                                 required
                                 className="bed-input w-16 p-2 text-center border-2 border-gray-200 rounded-lg font-bold text-[#ec38b7] outline-none focus:border-[#ec38b7]"
                              />
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-4 border rounded-xl bg-slate-50">
                           <div>
                              <p className="font-bold text-gray-800">Move-in Ready?</p>
                              <p className="text-xs text-slate-500">Available to occupy.</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 name="moveInReady"
                                 defaultChecked={availabilityModalData.moveInReady}
                                 className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801786]"></div>
                           </label>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 border rounded-xl bg-slate-50">
                           <div>
                              <p className="font-bold text-gray-800">Allow Bachelors?</p>
                              <p className="text-xs text-slate-500">Enable for student visibility.</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                 type="checkbox" 
                                 name="bachelorAllowed"
                                 defaultChecked={availabilityModalData.preferences?.bachelorAllowed}
                                 className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#801786]"></div>
                           </label>
                        </div>
                     </div>
                  )}

                  <div className="flex flex-col gap-1.5 mt-2">
                     <p className="font-bold text-gray-800 text-sm">Notes for Tenants</p>
                     <textarea 
                        rows={3} 
                        defaultValue={availabilityModalData.tenantNotes}
                        className="w-full border p-3 rounded-xl bg-white focus:outline-none focus:border-[#801786] text-sm text-gray-700" 
                        placeholder="e.g. Vegetarian only, quiet hours..." 
                        style={{ resize: 'none' }}
                     />
                  </div>

                  <div className="flex gap-3 mt-2">
                     <button 
                        disabled={isDeleting || isUpdatingAvailability}
                        type="button" 
                        onClick={async () => {
                           if (!window.confirm("Are you sure you want to completely delete this property? This cannot be undone.")) return;
                           try {
                              setIsDeleting(true);
                              const token = useAuthStore.getState().token;
                              const res = await fetch(`/api/properties/${availabilityModalData._id}`, {
                                 method: 'DELETE',
                                 headers: { 'Authorization': `Bearer ${token}` }
                              });
                              const data = await res.json();
                              if (data.success) {
                                 setProperties(prev => prev.filter((p: any) => p._id !== availabilityModalData._id));
                                 setAvailabilityModalData(null);
                              } else {
                                 alert(data.message || "Failed to delete");
                              }
                           } catch(err) {
                              console.error(err);
                           } finally {
                              setIsDeleting(false);
                           }
                        }}
                        className="w-1/3 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl transition-all shadow-sm border border-red-100 active:scale-95 disabled:opacity-50"
                     >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                     </button>
                     <button 
                        disabled={isUpdatingAvailability || isDeleting}
                        type="submit" 
                        className="w-2/3 bg-[#801786] hover:bg-[#a420ac] text-white font-black py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                     >
                        {isUpdatingAvailability ? 'Saving...' : 'Save Updates'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Full-Screen Vertical Swiping Photo Reel Modal */}
      {selectedProperty && (
         <div className="fixed inset-0 z-[100] bg-black animate-in fade-in zoom-in-95 duration-200">
            {/* Overlay Header */}
            <div className="p-5 px-6 flex flex-row justify-between items-start bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-50 pointer-events-none">
               <div className="pointer-events-auto">
                  <h3 className="text-white font-black text-2xl drop-shadow-lg">{selectedProperty.title}</h3>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-1.5 mt-0.5 drop-shadow-md">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                     Swipe down ({selectedProperty.images?.length || 0} Photos)
                  </p>
               </div>
               <button 
                  onClick={() => setSelectedProperty(null)}
                  className="pointer-events-auto p-2.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-xl border border-white/20 active:scale-95 shadow-2xl"
               >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            {/* Vertical Snapping Container */}
            <div 
               className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth"
               style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
               <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
               {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  selectedProperty.images.map((img: string, idx: number) => (
                     <div key={idx} className="w-full h-full snap-start snap-always flex items-center justify-center relative bg-black no-scrollbar shrink-0">
                        <img 
                           src={img} 
                           alt={`Property Image ${idx + 1}`} 
                           className="w-full h-full object-contain pointer-events-none" 
                        />
                        {/* Interactive Counter Overlay */}
                        <div className="absolute bottom-12 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-black border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20">
                           {idx + 1} / {selectedProperty.images.length}
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="w-full h-[100dvh] snap-start flex items-center justify-center text-white/50 font-medium">
                     No images uploaded for this property.
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
