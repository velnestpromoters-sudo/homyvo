import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Reels & Virtual Tours | Homyvo',
  description: 'Experience property viewing like never before with Homyvo reels. Swipe through verified PG and apartment video tours.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
