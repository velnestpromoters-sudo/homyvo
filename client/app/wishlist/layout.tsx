import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Properties | Homyvo',
  description: 'View your saved PG, apartments, and rental homes in Tamil Nadu on your Homyvo wishlist.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
