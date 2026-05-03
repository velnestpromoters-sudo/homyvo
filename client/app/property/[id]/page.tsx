"use client";
import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { 
  ArrowLeft, Heart, Share2, Image as ImageIcon, Check, 
  Building, Users, Maximize, CalendarDays, Award, Home, 
  MapPin, Lock, Phone, MessageSquare, X, ChevronRight, Clock 
} from 'lucide-react';
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
  const [showGallery, setShowGallery] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [property, setProperty] = useState<any>(null);
  const [access, setAccess] = useState<'limited' | 'full'>('limited');
  const [loading, setLoading] = useState(true);
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCookieBar, setShowCookieBar] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      setActiveImage(newIndex);
    }
  };

  const handleUnlockPayment = async () => {
    if (!isAuthenticated) {
        openModal();
        return;
    }
    
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
        theme: { color: '#801786' }
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

  const fallbackMock = {
    title: 'Emami Aerocity aero tower',
    propertyType: 'apartment',
    location: { area: 'Kalapatti', city: 'Coimbatore', address: '123 Aerocity Road, Kalapatti' },
    rent: 20000, 
    deposit: 60000, 
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 
      'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    furnishing: 'Furnished',
    amenities: ['Furnished', 'Newly Constructed', 'Close to Hospital', 'Close to Airport'],
    bhkType: '1',
    preferences: { bachelorAllowed: true, familyAllowed: true, genderPreference: 'any' },
    areaSqft: 450,
    propertyAge: '0-1 Year Old',
    availability: 'May 04, 2026',
    floor: 1,
    totalFloors: 3,
    highlights: ['North Facing', 'Close to Market', 'Vaastu Compliant'],
    isVerified: true,
    ownerId: { name: 'Verified Owner', mobile: '+91 98765 43210', whatsapp: true }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        if(res.data.success) {
           setProperty(res.data.data);
           setAccess(res.data.access);
        }
      } catch (e) {
        console.warn('API connection failed, using visual mock data instead.');
        setProperty(fallbackMock);
        setAccess(isAuthenticated && role === 'tenant' ? 'full' : 'limited');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, isAuthenticated, role]);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-[#801786] border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[#999999] text-sm font-medium animate-pulse">Loading property...</p>
    </div>
  );
  if (!property) return <div className="h-screen flex items-center justify-center text-slate-500">Not Found</div>;

  const isPG = property.propertyType === 'pg';
  const propertyTitlePrefix = isPG ? 'PG/Hostel for Rent in' : 'Flat/Apartment for Rent in';
  const bhkOrSharing = isPG ? `${property.pgDetails?.sharingType || 'Multi'} Sharing PG` : `${property.bhkType} BHK`;
  const socialCount = property.contactsYesterday || property.viewCount || 0;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col pb-40 font-sans selection:bg-[#801786]/20">
      
      {/* SECTION 1: IMAGE CAROUSEL (TOP HERO) */}
      <div className="relative w-full h-[35vh] min-h-[260px] bg-black">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
        >
          {property.images?.length ? property.images.map((img: string, i: number) => (
            <div key={i} className="w-full h-full flex-shrink-0 snap-center relative" onClick={() => setShowGallery(true)}>
              <img src={img} alt={`Property view ${i+1}`} className="w-full h-full object-cover" />
            </div>
          )) : (
            <div className="w-full h-full flex-shrink-0 snap-center bg-slate-200 flex items-center justify-center">
               <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}
        </div>

        {/* Top Gradient & Nav Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 pt-5 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-10">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-white active:scale-90 transition-transform">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
                <button className="p-2 text-white active:scale-90 transition-transform"><Heart className="w-6 h-6" /></button>
                <button className="p-2 text-white active:scale-90 transition-transform"><Share2 className="w-6 h-6" /></button>
            </div>
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-[70px] left-4 text-white text-xs font-semibold drop-shadow-md z-10 tracking-wide">
            Updated yesterday by owner
        </div>
        <div className="absolute top-[70px] right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] font-bold flex items-center gap-1.5 z-10 border border-white/10">
            <ImageIcon className="w-3.5 h-3.5" /> {property.images?.length || 0}
        </div>

        {/* Dots Indicator */}
        {property.images?.length > 1 && (
            <div className="absolute bottom-10 left-0 w-full flex justify-center gap-1.5 z-10">
                {property.images.map((_: any, idx: number) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImage ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
                ))}
            </div>
        )}
      </div>

      {/* SECTION 2: PRICE & QUICK SUMMARY CARD */}
      <div className="bg-white rounded-t-[1.5rem] -mt-6 relative z-20 px-5 pt-7 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
         <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-[28px] font-extrabold text-[#111111] tracking-tight">₹ {property.rent?.toLocaleString()}</span>
            <span className="text-sm font-medium text-[#666666]">/month</span>
         </div>
         <div className="flex items-center text-[13px] mb-5">
            <span className="text-[#666666]">₹ {property.deposit?.toLocaleString()} security deposit</span>
         </div>
         <div className="inline-block bg-[#F5F5F7] px-3 py-1.5 rounded text-[11px] font-bold text-[#111111] uppercase tracking-wider">
            {property.furnishing || 'Unfurnished'}
         </div>
      </div>

      {/* SECTION 3: AMENITIES QUICK LIST */}
      <div className="px-5 pb-6 bg-white">
         <div className="flex flex-col gap-3">
            {property.amenities?.slice(0,4).map((a: string, i: number) => (
               <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#16A34A]" strokeWidth={3} />
                  <span className="text-sm font-semibold text-[#111111]">{a}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="h-2 w-full bg-[#F5F5F7]"></div>

      {/* SECTION 4: PROPERTY TITLE & LOCATION */}
      <div className="px-5 py-6 bg-white">
         <p className="text-[13px] text-[#666666] mb-1 font-medium">{propertyTitlePrefix}</p>
         <h1 className="text-[22px] font-extrabold text-[#111111] leading-tight mb-1.5">{property.title}</h1>
         <p className="text-sm text-[#666666] font-medium">{property.location?.area}, {property.location?.city}</p>
      </div>

      {/* SECTION 5: ICON DATA GRID */}
      <div className="px-5 pb-8 bg-white overflow-hidden">
         <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-5 px-5">
             
             {property.floor && (
                 <div className="flex flex-col items-center min-w-[85px] max-w-[90px] text-center gap-2.5">
                     <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        <Building className="w-5 h-5 text-slate-600" />
                     </div>
                     <div>
                        <p className="text-[13px] font-bold text-[#111111]">{property.floor}</p>
                        <p className="text-[11px] text-[#999999] leading-tight mt-0.5">out of {property.totalFloors || '?'} floors</p>
                     </div>
                 </div>
             )}

             <div className="flex flex-col items-center min-w-[85px] max-w-[90px] text-center gap-2.5">
                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Users className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                    <p className="text-[13px] font-bold text-[#111111]">For {property.preferences?.familyAllowed ? 'Family' : 'Bachelors'}</p>
                    <p className="text-[11px] text-[#999999] leading-tight mt-0.5">{property.preferences?.genderPreference === 'any' ? 'Anyone' : property.preferences?.genderPreference}</p>
                 </div>
             </div>

             {property.areaSqft && (
                 <div className="flex flex-col items-center min-w-[85px] max-w-[90px] text-center gap-2.5">
                     <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                        <Maximize className="w-5 h-5 text-orange-600" />
                     </div>
                     <div>
                        <p className="text-[13px] font-bold text-[#111111]">{property.areaSqft} sq.ft.</p>
                        <p className="text-[11px] text-[#999999] leading-tight mt-0.5">Builtup Area</p>
                     </div>
                 </div>
             )}

             <div className="flex flex-col items-center min-w-[85px] max-w-[90px] text-center gap-2.5">
                 <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                    <p className="text-[13px] font-bold text-[#111111]">Available</p>
                    <p className="text-[11px] text-[#999999] leading-tight mt-0.5">from {property.availability || 'Immediate'}</p>
                 </div>
             </div>

             {property.propertyAge && (
                 <div className="flex flex-col items-center min-w-[85px] max-w-[90px] text-center gap-2.5">
                     <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                        <Award className="w-5 h-5 text-amber-600" />
                     </div>
                     <div>
                        <p className="text-[13px] font-bold text-[#111111]">{property.propertyAge}</p>
                        <p className="text-[11px] text-[#999999] leading-tight mt-0.5">Old Property</p>
                     </div>
                 </div>
             )}

         </div>
      </div>

      {/* SECTION 6: KEY HIGHLIGHTS BLOCK */}
      {property.highlights && property.highlights.length > 0 && (
          <div className="p-5 bg-gradient-to-b from-[#FFFDF0] to-white border-t border-[#F5F5F7]">
             <div className="flex items-center gap-3.5 mb-5">
                 <div className="w-11 h-11 relative flex items-center justify-center bg-orange-100/50 rounded-full">
                    <div className="w-8 h-8 border-2 border-orange-400 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-[19px] font-extrabold text-[#111111] tracking-tight">Key Highlights</h2>
                    <p className="text-[13px] text-[#666666]">Why you should choose the property</p>
                 </div>
             </div>
             
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <h3 className="text-[13px] font-bold flex items-center gap-2 mb-3.5 text-[#111111]">
                   <Home className="w-4 h-4 text-[#0066FF]" /> Property Highlights
                </h3>
                <ul className="space-y-2.5">
                   {property.highlights.map((hl: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5">
                         <span className="mt-[5px] text-black text-[10px]">●</span> 
                         <span className="text-[13.5px] text-[#666666] font-medium leading-snug">{hl}</span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
      )}

      <div className="h-2 w-full bg-[#F5F5F7]"></div>

      {/* SECTION 6.5: TENANT NOTES */}
      {property.tenantNotes && (
          <>
             <div className="px-5 py-6 bg-white">
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                    <h3 className="text-[13px] font-bold text-[#111111] mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-blue-600" /> Note from Owner
                    </h3>
                    <p className="text-[13px] text-[#666666] leading-relaxed whitespace-pre-wrap">
                        {property.tenantNotes}
                    </p>
                </div>
             </div>
             <div className="h-2 w-full bg-[#F5F5F7]"></div>
          </>
      )}

      {/* SECTION 7: OWNER DETAILS (CONTROLLED BY PAYWALL) */}
      <div className="p-5 bg-white relative overflow-hidden pb-12">
         <h2 className="text-[19px] font-extrabold text-[#111111] mb-5 tracking-tight">Owner Details</h2>
         
         <div className={access === 'limited' && !paymentUnlocked ? 'blur-[5px] pointer-events-none select-none transition-all duration-500' : 'transition-all duration-500'}>
             <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4">
                 <p className="font-extrabold text-[#111111] text-lg mb-1">{property.ownerId?.name || 'Verified Owner'}</p>
                 <p className="text-sm text-[#666666] mb-4">Owner of {property.title}</p>
                 <p className="font-bold text-[#111111] text-xl tracking-wider mb-2">
                    {property.ownerId?.mobile || '+91 98XXX XXXXX'}
                 </p>
                 <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Mobile Number Verified
                 </p>
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                 <p className="font-bold text-[#111111] mb-2 text-sm flex items-center gap-1.5"><MapPin className="w-4 h-4 text-red-500"/> Exact Location</p>
                 <p className="text-sm text-[#666666] leading-relaxed mb-3">{property.location?.address || 'Complete address hidden until unlocked.'}</p>
                 {property.location?.googleMapLink && access === 'full' && (
                     <a href={property.location.googleMapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0066FF] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                        <MapPin className="w-4 h-4" /> Open in Google Maps
                     </a>
                 )}
             </div>
         </div>

         {/* Lock UI Overlay */}
         {access === 'limited' && !paymentUnlocked && (
             <div className="absolute inset-0 top-12 z-10 flex flex-col items-center justify-center bg-white/30 px-6 text-center">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md mb-3 border border-slate-100">
                     <Lock className="w-6 h-6 text-[#111111]" />
                 </div>
                 <p className="font-extrabold text-[#111111] text-lg mb-1">Unlock owner contact & exact location</p>
                 <p className="text-sm text-[#666666] mb-5 max-w-[250px]">Get direct access to the owner's phone number and the exact property address.</p>
                 <button 
                    onClick={handleUnlockPayment}
                    disabled={isProcessingPayment}
                    className="w-full max-w-[280px] py-3.5 bg-[#801786] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center"
                 >
                    {isProcessingPayment ? 'Processing...' : 'Pay ₹49 to Unlock'}
                 </button>
             </div>
         )}
      </div>

      {/* SECTION 9: SOCIAL PROOF */}
      {socialCount > 0 && (
          <div className="fixed bottom-[88px] left-0 w-full z-40 bg-[#FDE8EF] border-t border-pink-100 py-2.5 px-4 flex items-center gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
             <div className="w-6 h-6 bg-[#C72C9C] rounded-full flex items-center justify-center">
                 <Clock className="w-3.5 h-3.5 text-white" />
             </div>
             <span className="text-[13px] font-medium text-[#111111] tracking-tight">{socialCount} people already contacted yesterday</span>
          </div>
      )}

      {/* SECTION 8: CONTACT ACTION BAR (STICKY BOTTOM) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 shadow-[0_-8px_20px_rgba(0,0,0,0.04)] z-50 px-4 py-3 pb-4">
          <div className="flex gap-2.5 items-center">
              <button 
                onClick={() => { if(access === 'full') window.open(`https://wa.me/${property.ownerId?.mobile}`, '_blank'); else handleUnlockPayment(); }}
                className="flex-[1.2] py-3.5 border-2 border-[#16A34A] text-[#16A34A] rounded-full flex items-center justify-center gap-1.5 font-bold text-[14px] active:scale-95 transition-transform bg-white"
              >
                  <MessageSquare className="w-4 h-4 fill-current" /> WhatsApp
              </button>
              <button 
                onClick={() => { if(access === 'full') window.open(`tel:${property.ownerId?.mobile}`, '_self'); else handleUnlockPayment(); }}
                className="flex-[1.5] py-3.5 bg-[#0066FF] text-white rounded-full font-bold text-[14px] shadow-md active:scale-95 transition-transform"
              >
                  {access === 'full' || paymentUnlocked ? 'View Number' : 'Unlock Contact'}
              </button>
              <button 
                onClick={() => { if(access === 'full') window.open(`tel:${property.ownerId?.mobile}`, '_self'); else handleUnlockPayment(); }}
                className="w-12 h-12 bg-[#0066FF] text-white rounded-full flex items-center justify-center shadow-md shrink-0 active:scale-95 transition-transform"
              >
                  <Phone className="w-5 h-5 fill-current" />
              </button>
          </div>
      </div>

      {/* SECTION 10: COOKIE / CONSENT BAR */}
      {showCookieBar && (
          <div className="fixed bottom-0 left-0 w-full bg-[#F5F5F7] z-[60] px-4 py-3 flex items-center justify-between border-t border-slate-200">
             <p className="text-[11px] text-[#666666] leading-tight flex-1 pr-4">
                This site uses cookies to improve your experience. By browsing, you agree to our <span className="underline cursor-pointer">Privacy Policy</span> & <span className="underline cursor-pointer">Cookie Policy</span>
             </p>
             <button onClick={() => setShowCookieBar(false)} className="px-4 py-2 bg-[#0066FF] text-white text-xs font-bold rounded-full">
                Okay
             </button>
          </div>
      )}

      {/* FULL SCREEN GALLERY MODALS */}
      {showGallery && property.images?.length > 0 && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 flex justify-between items-center sticky top-0 bg-gradient-to-b from-black/90 to-transparent z-10">
                  <span className="text-white font-bold text-sm">{property.images.length} Photos</span>
                  <button onClick={() => setShowGallery(false)} className="p-2 bg-white/10 rounded-full text-white backdrop-blur-md">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 flex flex-col gap-8 items-center">
                  {property.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative w-full" onClick={() => setEnlargedImage(img)}>
                          <img src={img} alt={`Gallery ${idx + 1}`} className="w-full rounded-xl" />
                      </div>
                  ))}
              </div>
          </div>
      )}

      {enlargedImage && (
          <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={() => setEnlargedImage(null)}>
              <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white z-20">
                  <X className="w-6 h-6" />
              </button>
              <div className="flex-1 flex justify-center items-center p-2">
                  <img src={enlargedImage} className="max-w-full max-h-[100dvh] object-contain" />
              </div>
          </div>
      )}

    </div>
  );
}
