import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find PG & Rental Homes in Tamil Nadu | Homyvo',
  description: 'Discover student-friendly apartments, family homes, and verified PG rentals across Tamil Nadu on Homyvo.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
