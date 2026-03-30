"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyFormStore } from '@/store/usePropertyFormStore';

export default function Step4() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, setImages } = usePropertyFormStore();
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validImages = selected.filter(f => f.type.startsWith('image/'));
      
      const newTotal = [...images, ...validImages];
      
      if (newTotal.length > 5) {
         setErrorMsg("Maximum 5 images allowed.");
         setImages(newTotal.slice(0, 5));
      } else {
         setErrorMsg("");
         setImages(newTotal);
      }
    }
  };

  const removeImage = (index: number) => {
     setImages(images.filter((_, i) => i !== index));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
        setErrorMsg("Please upload at least 1 image to continue.");
        return;
    }
    router.push('/owner/add-property/step-5');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <h2 className="text-2xl font-black text-gray-900 mb-1">Visuals</h2>
       <p className="text-sm text-gray-500 mb-6">Upload striking photos of your space.</p>

       <form onSubmit={handleNext} className="flex flex-col gap-5">
          
          <div 
             className="w-full h-44 border-2 border-dashed border-[#FF5A1F] bg-orange-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-orange-100"
             onClick={() => fileInputRef.current?.click()}
          >
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-[#FF5A1F]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             </div>
             <p className="text-sm font-bold text-[#FF5A1F]">Tap to Select Media</p>
             <p className="text-xs text-gray-500 mt-1">JPEG/PNG — Max 5 files</p>
             
             <input 
                 type="file" 
                 ref={fileInputRef}
                 multiple 
                 accept="image/*"
                 onChange={handleFileChange}
                 className="hidden"
             />
          </div>

          {errorMsg && <p className="text-red-500 text-xs font-bold w-full text-center">{errorMsg}</p>}

          {/* Media Sandbox Previews */}
          {images.length > 0 && (
             <div className="mt-2">
                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Selected Media ({images.length}/5)</p>
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 snap-x">
                   {images.map((img, idx) => (
                       <div key={idx} className="relative w-28 h-28 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden shadow-sm snap-start border">
                          <img src={URL.createObjectURL(img)} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                          <button 
                             type="button" 
                             onClick={() => removeImage(idx)}
                             className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur text-red-500 rounded-full flex items-center justify-center text-xs shadow"
                          >
                             ✕
                          </button>
                       </div>
                   ))}
                </div>
             </div>
          )}

          <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t z-10 md:static md:bg-transparent md:border-0 md:p-0 mt-auto pt-6">
             <button type="submit" className="w-full bg-[#FF5A1F] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#E04812] transition-colors">
                Final Step →
             </button>
          </div>
       </form>
    </div>
  );
}
