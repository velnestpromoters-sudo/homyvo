"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';
import { useAuthStore } from '@/store/authStore';

export default function Step5() {
  const router = useRouter();
  const formState = usePropertyFormStore();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsSubmitting(true);

    try {
       const formData = new FormData();
       formData.append('title', formState.title);
       formData.append('rent', formState.rent);
       formData.append('deposit', formState.deposit);
       formData.append('bhkType', formState.bhkType);
       formData.append('tenantNotes', formState.tenantNotes || '');
       formData.append('moveInReady', formState.moveInReady.toString());
       
       // Core Phase 4 Tracking
       formData.append('amenities', JSON.stringify(formState.amenities));
       formData.append('furnishing', formState.furnishing);
       formData.append('availability', formState.availability);
       if (formState.availableFrom) formData.append('availableFrom', formState.availableFrom);
       
       // PG Updates
       formData.append('propertyType', formState.propertyType);
       if (formState.propertyType === 'pg') {
          formData.append('pgDetails', JSON.stringify(formState.pgDetails));
       }
       
       // Encode objects into flat strings for FormData translation
       formData.append('location', JSON.stringify(formState.location));
       formData.append('preferences', JSON.stringify(formState.preferences));
       
       formState.images.forEach((img) => {
           formData.append('images', img);
       });

       // Extract persisted token actively from Zustand Store, not raw native localStorage
       const token = useAuthStore.getState().token;
       const res = await fetch(`/api/properties/create`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` },
           body: formData // Auto multipart-formdata
       });
       
       const data = await res.json();
       if (data.success) {
           const propertyId = data.data._id;
           
           // RAZORPAY ₹199 FLOW
           const orderRes = await fetch('/api/payment/create-listing', { method: 'POST' });
           const orderData = await orderRes.json();
           
           const options = {
             key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_id',
             amount: orderData.amount,
             currency: 'INR',
             name: 'Homyvo Property Listing',
             description: 'One-time ₹199 publishing fee',
             order_id: orderData.id,
             handler: async function (response: any) {
               const verifyRes = await fetch('/api/payment/verify-listing', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    propertyId
                 })
               });
               
               const verifyData = await verifyRes.json();
               
               if (verifyData.success) {
                 formState.resetForm();
                 alert("Property published and activated successfully!");
                 router.push('/owner/dashboard');
               } else {
                 alert("Payment Verification Failed in Backend! " + (verifyData.message || "Invalid signature."));
                 setIsSubmitting(false);
               }
             },
             prefill: {
               name: 'Owner',
               contact: '9999999999'
             },
             theme: { color: '#801786' }
           };
           
           const rzp = new (window as any).Razorpay(options);
           rzp.on('payment.failed', function (response: any){
              alert("Payment Failed! Property saved but inactive. " + response.error.description);
              router.push('/owner/dashboard');
           });
           rzp.open();

       } else {
           alert("Failed to create property. " + (data.error || data.message || "Unknown error"));
       }
    } catch (err) {
       console.error("Submission error", err);
       alert("Network error. Please try again.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Verify & Publish</h2>
       <p className="text-sm text-gray-500 mb-6">Review terms and publish your home.</p>

       <div className="bg-white border rounded-xl p-5 shadow-sm text-sm space-y-4 mb-6">
           <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">Title</span>
              <span className="font-bold text-gray-900 max-w-[60%] text-right truncate">{formState.title}</span>
           </div>
           <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">Rent / Deposit</span>
              <span className="font-bold text-gray-900">₹{formState.rent} / ₹{formState.deposit}</span>
           </div>
           <div className="flex justify-between border-b pb-3">
              <span className="text-gray-500">City Location</span>
              <span className="font-bold text-gray-900">{formState.location.area}, {formState.location.city}</span>
           </div>
           <div className="flex justify-between">
              <span className="text-gray-500">Media</span>
              <span className="font-bold text-[#801786]">{formState.images.length} files attached</span>
           </div>
       </div>

       <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
             <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
             <ul className="text-xs text-gray-600 list-disc pl-4 space-y-2 mb-4">
                 <li>Owner must provide legally real properties only. Zero fake listings allowed.</li>
                 <li>All property availability must be heavily updated to ensure tenant clarity.</li>
                 <li>Homyvo Platform is explicitly not responsible for external offline owner-tenant disputes.</li>
                 <li>Deposits must be returned fairly adhering to standard eviction laws.</li>
             </ul>
             <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input 
                   type="checkbox" 
                   required
                   checked={agreed}
                   onChange={(e) => setAgreed(e.target.checked)}
                   className="mt-1 w-4 h-4 text-[#801786] bg-white border-gray-300 rounded focus:ring-[#801786]"
                />
                <span className="text-sm font-bold text-gray-800">I agree to the Provider Terms & Conditions</span>
             </label>
          </div>

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 mt-auto pt-6">
             <button 
                type="submit" 
                disabled={!agreed || isSubmitting}
                className="w-full bg-[#801786] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#a61c92] transition-colors disabled:opacity-50 flex justify-center items-center"
             >
                {isSubmitting ? (
                   <span className="flex items-center gap-2">
                       <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Submitting...
                   </span>
                ) : "Confirm & Submit Listing"}
             </button>
          </div>
       </form>
    </div>
  );
}
