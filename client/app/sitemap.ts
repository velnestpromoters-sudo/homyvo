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

  const propertyUrls = properties.map((prop) => ({
    url: `https://www.homyvo.com/property/${prop._id}`,
    lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

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
    ...propertyUrls,
  ];
}
