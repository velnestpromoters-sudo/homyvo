"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CinematicSplash from '@/components/splash/CinematicSplash';

export default function Root() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const handleSplashComplete = () => {
      if (!isAuthenticated) {
        router.push('/home-list');
      } else {
        const role = user?.role;
        if (role === 'tenant') {
           router.push('/home-list');
        } else if (role === 'owner') {
           router.push('/home-list');
        } else {
           router.push('/home-list');
        }
      }
  };

  return <CinematicSplash onComplete={handleSplashComplete} />;
}
