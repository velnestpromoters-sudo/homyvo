"use client";
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { ArrowLeft, MapPin, CheckCircle, ShieldCheck, Lock } from 'lucide-react';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params as any) as { id: string };
  const id = unwrappedParams.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const role = user?.role;
  const [property, setProperty] = useState<any>(null);
  const [access, setAccess] = useState<'limited' | 'full'>('limited');
  const [loading, setLoading] = useState(true);
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const simulatePayment = () => {
      setIsProcessingPayment(true);
      setTimeout(() => {
          setIsProcessingPayment(false);
          setPaymentUnlocked(true);
      }, 1500);
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

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <div className="relative h-64 w-full bg-slate-200">
        <img src={property.images[0]} alt="Prop" className="w-full h-full object-cover" />
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-black/40 rounded-full text-white backdrop-blur-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
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
            <p className="text-2xl font-black text-[#FF6A3D]">₹{property.rent?.toLocaleString()}</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200"></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit</p>
            <p className="text-xl font-bold text-slate-800">₹{property.deposit?.toLocaleString()}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="mt-8 bg-orange-50/50 border border-orange-100 rounded-3xl p-6 text-center shadow-inner">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-50">
                <ShieldCheck className="w-8 h-8 text-[#FF6A3D]" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">Login to View Full Details</h3>
             <p className="text-slate-500 text-sm mb-6 leading-relaxed">
               Securely access the owner's direct contact, exact location, video tours, and schedule a visit instantly.
             </p>
             <button 
               onClick={() => router.push('/login')} 
               className="w-full py-4 bg-[#FF6A3D] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
             >
               Login to View Details
             </button>
          </div>
        ) : !paymentUnlocked && role === 'tenant' ? (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                 <Lock className="w-5 h-5 text-slate-400" /> Premium Access
             </h3>
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h4 className="text-white font-black text-xl mb-2">Unlock Owner Contact</h4>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Pay a one-time fee to permanently unlock direct calling functionality and exact property coordinates for this listing.
                </p>
                
                <button 
                  onClick={simulatePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-gradient-to-r from-[#FF6A3D] to-[#ff4a11] text-white font-bold rounded-xl shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-75 disabled:active:scale-100"
                >
                  {isProcessingPayment ? (
                     <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing Gateway...</>
                  ) : (
                     <>Pay ₹199 via UPI / Card</>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-1.5 opacity-60">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold uppercase tracking-widest">Secure Encrypted Payment</span>
                </div>
             </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-2 fade-in">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Contact Unlocked
            </h3>
             <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Owner Credentials</p>
                <p className="font-black text-slate-800 text-xl mb-1">{property.ownerId?.name || 'Verified Owner'}</p>
                <p className="font-semibold text-[#FF6A3D] text-lg tracking-wide mb-5">
                   {property.ownerId?.mobile || '+91 98XXX XXXXX'}
                </p>
                
                <div className="flex gap-3">
                  <button onClick={() => window.open(`tel:${property.ownerId?.mobile}`, '_self')} className="flex-1 py-3 border-2 border-[#FF6A3D] bg-orange-50 text-[#FF6A3D] font-black rounded-xl text-sm shadow-sm active:scale-95 transition-all">
                    Call Now
                  </button>
                  <button className="flex-1 py-3 bg-[#FF6A3D] text-white font-black rounded-xl text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                    Request Visit
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
