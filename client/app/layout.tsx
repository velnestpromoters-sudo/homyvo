import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import AuthBottomSheet from '@/components/auth/AuthBottomSheet';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'bnest | Verified Homes. Trusted Living.',
  description: 'Clean, mobile-first rental platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className + " min-h-screen bg-slate-50 font-sans antialiased relative overflow-x-hidden"}>
        {children}
        <AuthBottomSheet />
      </body>
    </html>
  )
}
