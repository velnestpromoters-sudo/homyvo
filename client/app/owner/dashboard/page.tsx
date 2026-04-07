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

      {/* Image Gallery Modal */}
      {selectedProperty && (
         <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 px-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
               <div>
                  <h3 className="text-white font-black text-xl drop-shadow-md">{selectedProperty.title}</h3>
                  <p className="text-white/70 text-sm font-medium">{selectedProperty.images?.length || 0} Photos</p>
               </div>
               <button 
                  onClick={() => setSelectedProperty(null)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/20 active:scale-95"
               >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            {/* Scrollable Images Container */}
            <div className="flex-1 overflow-y-auto px-4 pt-24 pb-12 flex flex-col gap-6 scroll-smooth">
               {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  selectedProperty.images.map((img: string, idx: number) => (
                     <div key={idx} className="w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl relative">
                        {/* Image Counter Pill */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/10 z-10">
                           {idx + 1} / {selectedProperty.images.length}
                        </div>
                        <img 
                           src={img} 
                           alt={`Property Image ${idx + 1}`} 
                           className="w-full h-auto max-h-[80vh] object-contain bg-black/50" 
                        />
                     </div>
                  ))
               ) : (
                  <div className="flex-1 flex items-center justify-center text-white/50 font-medium">
                     No images uploaded for this property.
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
