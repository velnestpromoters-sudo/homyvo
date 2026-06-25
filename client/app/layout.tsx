import type { Metadata, Viewport } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import AuthBottomSheet from '@/components/auth/AuthBottomSheet';
import SupportBall from '@/components/common/SupportBall';
import Script from 'next/script';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    template: "%s | Homyvo",
    default: "Homyvo – Verified Homes & PG Rentals in Tamil Nadu"
  },
  description: "Find verified PG, apartments, and rental homes in Tamil Nadu. Homyvo connects tenants with trusted property owners. Direct contacts, no hidden fees.",
  keywords: ["Homyvo", "PG in Coimbatore", "rent house Tamil Nadu", "bachelor rooms", "verified homes India", "apartments for rent", "no broker"],
  metadataBase: new URL("https://www.homyvo.com"),
  openGraph: {
    title: "Homyvo – Verified Homes & PG Rentals",
    description: "Find verified PG, apartments, and rental homes in Tamil Nadu. Direct contacts, no hidden fees.",
    url: "https://www.homyvo.com",
    siteName: "Homyvo",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 600,
        alt: "Homyvo Logo",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Homyvo – Verified Homes & PG Rentals",
    description: "Find verified PG, apartments, and rental homes in Tamil Nadu.",
    images: ["/icon.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.homyvo.com/#organization",
      "name": "Homyvo",
      "url": "https://www.homyvo.com",
      "logo": "https://www.homyvo.com/icon.png",
      "description": "Homyvo is a premier real estate platform connecting tenants with verified property owners for PGs, apartments, and rental homes across Tamil Nadu.",
      "sameAs": [
        "https://www.facebook.com/homyvo",
        "https://twitter.com/homyvo",
        "https://www.instagram.com/homyvo"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.homyvo.com/#website",
      "name": "Homyvo",
      "url": "https://www.homyvo.com",
      "publisher": {
        "@id": "https://www.homyvo.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.homyvo.com/search?queryText={search_term_string}",
        "query-input": "required name=search_term_string"
      }
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
        <SupportBall />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
