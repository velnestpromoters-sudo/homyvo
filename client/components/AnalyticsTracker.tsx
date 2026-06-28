'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const sendTrackingData = (path: string, durationMs: number) => {
      if (durationMs < 1000) return; // Ignore visits less than 1 second
      const seconds = Math.round(durationMs / 1000);

      const payload = JSON.stringify({ pagePath: path, timeSpent: seconds });
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analytics/track-time`;

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(err => console.error('Analytics tracking failed:', err));
      }
    };

    if (lastPathname.current !== pathname) {
      const duration = Date.now() - startTime.current;
      sendTrackingData(lastPathname.current, duration);
      lastPathname.current = pathname;
      startTime.current = Date.now();
    }

    const handleUnload = () => {
      const duration = Date.now() - startTime.current;
      sendTrackingData(lastPathname.current, duration);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [pathname]);

  return null;
}
