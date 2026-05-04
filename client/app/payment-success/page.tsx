"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Processing Payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const type = params.get("type");
      const propertyId = params.get("propertyId");
      
      // Instamojo appends these automatically
      const payment_id = params.get("payment_id");
      const payment_status = params.get("payment_status");

      if (payment_status && payment_status.toLowerCase() !== "credit") {
         setStatus("Payment Failed or Pending.");
         return;
      }

      if (!type || !propertyId) {
          setStatus("Invalid Payment Session.");
          return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/payment/verify", {
          method: "POST",
          body: JSON.stringify({ type, propertyId }),
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        
        if (data.success) {
           setStatus("Payment Successful!");
           setTimeout(() => {
              if (type === "listing") {
                  router.push("/owner/dashboard");
              } else {
                  router.push(`/property/${propertyId}`);
              }
           }, 2000);
        } else {
           setStatus("Payment Verification Failed.");
        }
      } catch (err) {
        setStatus("Network Error during verification.");
      }
    };

    verifyPayment();
  }, [params, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center flex flex-col items-center gap-4">
        {status === "Processing Payment..." ? (
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
        ) : status === "Payment Successful!" ? (
            <CheckCircle className="w-16 h-16 text-emerald-500" />
        ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-bold text-2xl">!</div>
        )}
        <h2 className="text-xl font-bold text-slate-800">{status}</h2>
        <p className="text-slate-500 text-sm">Please do not close this window.</p>
      </div>
    </div>
  );
}
