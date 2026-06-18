import React from 'react';
import DistrictClient from './DistrictClient';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lat?: string; lng?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const capitalized = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `Properties in ${capitalized} | Rent Houses & PGs - Homyvo`,
    description: `Find verified PG, apartments, and rental homes in ${capitalized}, India. Direct owner contacts, zero brokerage, verified properties with 30km geofencing.`,
  };
}

export default async function DistrictPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const lat = resolvedSearchParams.lat ? parseFloat(resolvedSearchParams.lat) : null;
  const lng = resolvedSearchParams.lng ? parseFloat(resolvedSearchParams.lng) : null;

  return (
    <DistrictClient slug={slug} initialLat={lat} initialLng={lng} />
  );
}
