"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, Share2, MapPin, Bed, Bath, TriangleRight, Key, ShieldCheck, CheckCircle2, ChevronRight, PlayCircle, Eye, Lock } from 'lucide-react';
import { useAuthModalStore } from '@/store/authModalStore';
import { useAuthStore } from '@/store/authStore';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params as any) as { id: string };
  const id = unwrappedParams.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;
  const { openModal } = useAuthModalStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [access, setAccess] = useState<'limited' | 'full'>('limited');
  const [loading, setLoading] = useState(true);
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleUnlockPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const orderRes = await fetch('/api/payment/create-access', { method: 'POST' });
      const orderData = await orderRes.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_id',
        amount: orderData.amount,
        currency: 'INR',
        name: 'Homyvo Property Access',
        description: 'Unlock Owner Contact Details',
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              propertyId: id,
              userId: user?._id
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPaymentUnlocked(true);
            setAccess('full');
            // Re-fetch property to get actual completely unredacted contact data!
            const refreshed = await api.get(`/properties/${id}`);
            if (refreshed.data.success) {
               setProperty(refreshed.data.data);
            }
          } else {
             alert('Payment verification failed');
          }
          setIsProcessingPayment(false);
        },
        prefill: {
          name: user?.name || 'Tenant',
          contact: '9999999999'
        },
        theme: { color: '#ec38b7' }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
         alert("Payment Failed! " + response.error.description);
         setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization error");
      setIsProcessingPayment(false);
    }
  };

  // We fall back to mock data if no db is linked just for demo
  const fallbackMock = {
    title: 'Modern 2BHK in Indiranagar',
    location: { area: 'Indiranagar', city: 'Bangalore' },
    rent: 25000, deposit: 100000, images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    matchScore: 95, moveInReady: true, isVerified: true,
    ownerId: { name: 'Rahul R', mobile: '+91 9876543210' }
  };

  useEffect(() => {
    // In actual implementation this fetches from backend
    // Since we just updated it, backend handles guest vs authenticated beautifully
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        if(res.data.success) {
           setProperty(res.data.data);
           setAccess(res.data.access);
        }
      } catch (e) {
        console.warn('API connection failed, using visual mock data instead.');
        // Fallback for visual testing
        setProperty(fallbackMock);
        setAccess(isAuthenticated && role === 'tenant' ? 'full' : 'limited');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, isAuthenticated, role]);

  if (loading) return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center">
       <div className="w-12 h-12 border-4 border-[#ec38b7] border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-slate-400 font-medium animate-pulse">Loading property details...</p>
    </div>
  );
  if (!property) return <div className="h-screen flex items-center justify-center">Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <div className="relative h-64 w-full bg-slate-200">
        <img src={property.images[0]} alt="Prop" className="w-full h-full object-cover" />
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-black/40 rounded-full text-white backdrop-blur-md z-10 transition-colors hover:bg-black/60">
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Tenant Notes Glassmorphic Overlay */}
        {property.tenantNotes && (
           <div className="absolute top-4 left-16 right-4 z-10 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-2xl">
                 <p className="text-white text-[13px] font-bold leading-snug drop-shadow-md">
                    <span className="text-[#ec38b7] font-black mr-1.5 uppercase tracking-wider text-[10px]">Owner Note:</span>
                    {property.tenantNotes}
                 </p>
              </div>
           </div>
        )}
      </div>

      <div className="p-5 flex-1 mt-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{property.title || 'Premium Apartment'}</h1>
            <div className="flex items-center gap-1 text-slate-500 font-medium text-sm">
               <MapPin className="w-4 h-4" /> {property.location?.area}, {property.location?.city}
            </div>
          </div>
          {property.isVerified && (
             <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-blue-100 uppercase tracking-wider">
               <ShieldCheck className="w-3.5 h-3.5" /> Verified
             </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Rent</p>
            <p className="text-2xl font-black text-[#ec38b7]">₹{property.rent?.toLocaleString()}</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200"></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit</p>
            <p className="text-xl font-bold text-slate-800">₹{property.deposit?.toLocaleString()}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mt-8 bg-purple-50/50 border border-purple-100 rounded-3xl p-6 text-center shadow-inner">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-50">
                <ShieldCheck className="w-8 h-8 text-[#ec38b7]" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">Login to View Full Details</h3>
             <p className="text-slate-500 text-sm mb-6 leading-relaxed">
               Securely access the owner's direct contact, exact location, video tours, and schedule a visit instantly.
             </p>
             <button 
               onClick={openModal} 
               className="w-full py-4 bg-[#ec38b7] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
             >
               Login to View Details
             </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-2 fade-in">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Contact
            </h3>
            
            {/* Master Protected Block */}
            <div className="relative overflow-hidden rounded-3xl -mx-1 p-1">
              <div className={access === 'limited' && !paymentUnlocked ? "blur-[6px] pointer-events-none select-none transition-all duration-500 space-y-4" : "transition-all duration-500 space-y-4"}>
                
                {/* Core Property Details Extracted */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-2 gap-y-4 gap-x-2">
                   <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">BHK Type</p>
                      <p className="font-bold text-slate-800 text-sm">{property.bhkType || 'BHK Unavailable'}</p>
                   </div>
                   <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bachelors</p>
                      <p className="font-bold text-slate-800 text-sm">{property.preferences?.bachelorAllowed ? 'Allowed' : 'Not Allowed'}</p>
                   </div>
                   <div className="col-span-2 mt-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Exact Address</p>
                      <p className="font-bold text-slate-800 text-sm">{property.location?.address || 'Address hidden by owner'}</p>
                   </div>
                   {property.location?.googleMapLink && (
                     <div className="col-span-2 mt-1">
                        <a href={property.location.googleMapLink} target="_blank" rel="noreferrer" className="text-[#ec38b7] text-sm font-bold flex items-center gap-1 hover:underline">
                           <MapPin className="w-4 h-4" /> Open in Google Maps
                        </a>
                     </div>
                   )}
                </div>

                {/* Owner Details Protected Box */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Owner Credentials</p>
                  <p className="font-black text-slate-800 text-xl mb-1">{property.ownerId?.name || 'Verified Owner'}</p>
                  <p className="font-semibold text-[#ec38b7] text-lg tracking-wide mb-5">
                     {property.ownerId?.mobile || '+91 98XXX XXXXX'}
                  </p>
                  
                  <div className="flex gap-3">
                    <button onClick={() => window.open(`tel:${property.ownerId?.mobile}`, '_self')} className="flex-1 py-3 border-2 border-[#ec38b7] bg-purple-50 text-[#ec38b7] font-black rounded-xl text-sm shadow-sm active:scale-95 transition-all">
                      Call Now
                    </button>
                    <button className="flex-1 py-3 bg-[#ec38b7] text-white font-black rounded-xl text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                      Request Visit
                    </button>
                  </div>
                </div>
              </div>

              {access === 'limited' && !paymentUnlocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
                    <div className="bg-white px-6 py-5 rounded-2xl shadow-xl border border-purple-100 flex flex-col items-center text-center max-w-[280px]">
                      <Lock className="w-8 h-8 text-[#801786] mb-2" />
                      <p className="font-black text-slate-900 mb-1 text-base">Details Hidden</p>
                      <p className="text-xs text-slate-500 mb-4 px-2 tracking-tight">Pay to instantly unlock the exact address, maps, and direct phone number.</p>
                      <button 
                         onClick={handleUnlockPayment}
                         disabled={isProcessingPayment} 
                         className="px-8 py-3 bg-[#801786] text-white font-black tracking-wide rounded-xl text-sm shadow-lg active:scale-95 transition-all w-full flex justify-center items-center gap-2"
                      >
                         {isProcessingPayment ? "Processing..." : "Unlock for ₹99"}
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
