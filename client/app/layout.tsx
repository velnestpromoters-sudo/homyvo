import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import AuthBottomSheet from '@/components/auth/AuthBottomSheet';
import Script from 'next/script';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Homyvo – Verified Homes & PG Rentals in Tamil Nadu",
  description: "Find verified PG, apartments, and rental homes in Tamil Nadu. Homyvo connects tenants with trusted property owners.",
  keywords: ["Homyvo", "PG in Coimbatore", "rent house Tamil Nadu", "bachelor rooms", "verified homes India"],
  metadataBase: new URL("https://www.homyvo.com"),
  openGraph: {
    title: "Homyvo – Verified Homes & PG Rentals in Tamil Nadu",
    description: "Find verified PG, apartments, and rental homes in Tamil Nadu. Homyvo connects tenants with trusted property owners.",
    url: "https://www.homyvo.com",
    siteName: "Homyvo",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image"
  },
  robots: {
    index: true,
    follow: true
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Homyvo",
      "url": "https://www.homyvo.com",
      "logo": "https://www.homyvo.com/logo.svg",
      "sameAs": []
    },
    {
      "@type": "WebSite",
      "name": "Homyvo",
      "url": "https://www.homyvo.com"
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className + " min-h-screen bg-slate-50 font-sans antialiased relative overflow-x-hidden"}>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <AuthBottomSheet />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
