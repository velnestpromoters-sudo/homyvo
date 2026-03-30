"use client";
import React, { useState } from 'react';

export default function PropertyUploadForm() {
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Enforce max 5 rules
      const selected = Array.from(e.target.files).slice(0, 5);
      setFiles(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('rent', rent);
    
    // Validate and append files
    files.forEach((file) => {
       if (file.type.startsWith('image/')) {
           formData.append('images', file);
       }
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/property/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // do not set Content-Type to multipart/form-data manually with fetch!
      });
      
      const data = await response.json();
      if (data.success) {
          alert("Uploaded successfully to Cloudinary!");
          console.log("Optimized URL mapping:", data.data.images.map((img: string) => img.replace("/upload/", "/upload/q_auto,f_auto/")));
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-lg mx-auto mt-10">
       <h2 className="text-xl font-bold mb-4">Upload Property Images</h2>
       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
             type="text" 
             placeholder="Property Title"
             value={title}
             onChange={e => setTitle(e.target.value)}
             className="border p-2 rounded"
             required
          />
          <input 
             type="number" 
             placeholder="Monthly Rent"
             value={rent}
             onChange={e => setRent(e.target.value)}
             className="border p-2 rounded"
             required
          />
          <input 
             type="file" 
             multiple 
             accept="image/*"
             onChange={handleFileChange}
             className="file:border file:bg-blue-50 file:px-3 file:py-1 file:rounded"
             required
          />
          <span className="text-xs text-gray-500">Max 5 image files allowed</span>
          <button 
             type="submit" 
             disabled={isUploading}
             className="bg-blue-600 text-white font-bold py-2 rounded focus:ring-4 disabled:opacity-50"
          >
             {isUploading ? "Uploading to Cloudinary..." : "Upload & Save"}
          </button>
       </form>
    </div>
  );
}
