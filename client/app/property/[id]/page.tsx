import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import PropertyClient from './PropertyClient';

type Props = {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const res = await fetch(`${backendUrl}/properties/${id}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch property", error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const property = await getProperty(id);
  
  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  const isPG = property.propertyType === 'pg';
  const isCommercial = property.propertyType === 'commercial';
  const prefix = isPG ? 'PG/Hostel for Rent' : isCommercial ? 'Commercial Space' : 'Apartment for Rent';
  const title = `${property.title} - ${prefix} in ${property.location?.city} | Homyvo`;
  const description = `Rent ${property.title} located in ${property.location?.area}, ${property.location?.city}. ₹${property.rent}/month. ${property.amenities?.join(', ') || ''}. Direct owner contact.`;
  const mainImage = property.images?.[0] || 'https://www.homyvo.com/icon.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [mainImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const property = await getProperty(id);

  if (!property) {
    return <PropertyClient id={id} initialProperty={null} />;
  }

  // Generate Advanced JSON-LD for Answer Engines (AEO/GEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "RealEstateListing"],
    "name": property.title,
    "image": property.images || [],
    "description": `Rent ${property.title} in ${property.location?.area}, ${property.location?.city}`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": property.rent,
      "availability": "https://schema.org/InStock"
    },
    "spatialCoverage": {
      "@type": "Place",
      "name": property.location?.area,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": property.location?.city,
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyClient id={id} initialProperty={property} />
    </>
  );
}
