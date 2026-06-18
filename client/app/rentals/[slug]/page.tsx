import { Metadata } from 'next';
import React from 'react';
import RentalsClient from './RentalsClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parseSlug(slug: string) {
  // Pattern 1: ends with "-in-[city]"
  // e.g. "pg-in-coimbatore", "homes-in-coimbatore", "in-coimbatore"
  const inIndex = slug.indexOf("-in-");
  let categoryRaw = "all";
  let cityRaw: string | null = null;

  if (inIndex !== -1) {
    categoryRaw = slug.substring(0, inIndex);
    cityRaw = slug.substring(inIndex + 4); // skip "-in-"
  } else if (slug.startsWith("in-")) {
    categoryRaw = "all";
    cityRaw = slug.substring(3); // skip "in-"
  } else {
    // Pattern 2: no location specified, just category
    // e.g. "pg", "homes", "commercial", "student", "family"
    categoryRaw = slug;
    cityRaw = null;
  }

  // Sanitize category
  let category: 'pg' | 'commercial' | 'student' | 'family' | 'homes' | 'all' = 'all';
  if (['pg', 'commercial', 'student', 'family', 'homes', 'all'].includes(categoryRaw)) {
    category = categoryRaw as any;
  }

  // Capitalize city helper dynamically
  const formatCityName = (cityStr: string | null) => {
    if (!cityStr) return null;
    return cityStr
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const cityName = formatCityName(cityRaw);

  return { category, cityRaw, cityName };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category, cityName } = parseSlug(slug);
  
  let title = '';
  let description = '';
  
  const categoryLabel = category === 'pg' 
    ? 'PG Stays & Hostels' 
    : category === 'commercial' 
      ? 'Commercial Spaces' 
      : category === 'student' 
        ? 'Student & Bachelor Stays' 
        : category === 'family' 
          ? 'Family Rental Houses' 
          : 'Rental Properties';

  if (cityName) {
    title = `${categoryLabel} in ${cityName} | Verified Stays - Homyvo`;
    description = `Looking for ${categoryLabel.toLowerCase()} in ${cityName}? Browse verified listings with zero brokerage on Homyvo. Find apartments, PGs, and commercial spaces near you.`;
  } else {
    title = `${categoryLabel} | Verified Rental Stays & PGs - Homyvo`;
    description = `Find verified ${categoryLabel.toLowerCase()} with zero brokerage on Homyvo. Browse apartments, PG hostels, and commercial rental spaces.`;
  }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  };
}

export default async function RentalsPage({ params }: PageProps) {
  const { slug } = await params;
  const { category, cityRaw, cityName } = parseSlug(slug);
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let properties: any[] = [];

  try {
    const res = await fetch(`${backendUrl}/properties`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data.success && data.data) {
       const fetched = data.data;
       properties = fetched.filter((p: any) => {
          // City filter (if specified)
          if (cityRaw && p.location?.city?.toLowerCase() !== cityRaw.toLowerCase()) {
             return false;
          }
          
          // Category filter
          const isPg = p.propertyType === 'pg';
          if (category === 'pg') {
             return isPg;
          } else if (category === 'commercial') {
             return p.propertyType === 'commercial';
          } else if (category === 'student') {
             return p.preferences?.bachelorAllowed || isPg;
          } else if (category === 'family') {
             return !(p.preferences?.bachelorAllowed || isPg) && p.propertyType !== 'commercial';
          } else if (category === 'homes') {
             return p.propertyType !== 'commercial';
          }
          return true;
       });
    }
  } catch (error) {
     console.error("Failed to fetch rentals properties on server:", error);
  }

  return (
    <RentalsClient 
      initialProperties={properties}
      category={category}
      cityRaw={cityRaw}
      cityName={cityName}
    />
  );
}
