import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  let properties: { _id: string, updatedAt?: string }[] = [];
  try {
    const res = await fetch(`${backendUrl}/properties`);
    const data = await res.json();
    if (data.success && data.data) {
       properties = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch properties for sitemap", error);
  }

  const propertyUrls = properties.map((prop: any) => ({
    url: `https://www.homyvo.com/property/${prop._id}`,
    lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Extract unique cities dynamically from database properties
  const uniqueCities = new Set<string>();
  properties.forEach((prop: any) => {
    const city = prop.location?.city;
    if (city && typeof city === 'string' && city.trim()) {
      uniqueCities.add(city.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  });

  const cityUrls: MetadataRoute.Sitemap = [];
  uniqueCities.forEach(citySlug => {
    // Generate SEO landing pages for each city and category combination
    ['in', 'pg-in', 'commercial-in', 'student-in', 'family-in', 'homes-in'].forEach(prefix => {
      const slug = prefix === 'in' ? `in-${citySlug}` : `${prefix}-${citySlug}`;
      cityUrls.push({
        url: `https://www.homyvo.com/rentals/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    });
  });

  const categoryUrls: MetadataRoute.Sitemap = [
    {
      url: 'https://www.homyvo.com/rentals/homes',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.homyvo.com/rentals/pg',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.homyvo.com/rentals/commercial',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.homyvo.com/rentals/student',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.homyvo.com/rentals/family',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  return [
    {
      url: 'https://www.homyvo.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://www.homyvo.com/search',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.homyvo.com/location',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...categoryUrls,
    ...cityUrls,
    ...propertyUrls,
  ];
}
