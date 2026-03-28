"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SplashPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // 3.2s gives time for the 3s animation to finish before snapping to the next screen
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/home');
      } else {
        const role = user?.role;
        if (role === 'tenant') {
          router.push('/tenant/home');
        } else if (role === 'owner') {
          router.push('/owner/dashboard');
        } else {
          router.push('/home');
        }
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated, user]);

  return (
    <>
      <style>{`
        .splash-screen {
            width: 100%;
            height: 100vh;
            position: relative;
            background: #FFF;
            animation: bg-transition 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            overflow: hidden;
        }

        .splash-logo-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px;
            height: 140px;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .splash-logo-svg {
            width: 100px;
            height: 100px;
            opacity: 0.2;
            color: #FF6A3D;
            animation: logo-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .splash-dot {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 24px;
            background: #FF6A3D;
            border-radius: 50%;
            z-index: 20;
            animation: dot-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .splash-pulse-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            width: 140px;
            height: 140px;
            background: #FF6A3D;
            border-radius: 50%;
            z-index: 5;
            filter: blur(10px);
            opacity: 0;
            animation: pulse-anim 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes bg-transition {
            0%, 60% { background: #FFF; }
            77%, 100% { background: #FF6A3D; }
        }

        @keyframes dot-anim {
            0%, 10% { top: -50px; opacity: 1; transform: translateX(-50%) scale(1); }
            27% { top: calc(50% - 90px); opacity: 1; transform: translateX(-50%) scale(1); }
            35% { top: 50%; opacity: 0; transform: translateX(-50%) scale(0.2); }
            100% { top: 50%; opacity: 0; transform: translateX(-50%) scale(0); }
        }

        @keyframes logo-anim {
            0%, 27% { opacity: 0.2; color: #FF6A3D; transform: scale(1); }
            33% { opacity: 1; color: #FF6A3D; transform: scale(1.08); }
            40% { opacity: 1; color: #FF6A3D; transform: scale(1); }
            60% { opacity: 1; color: #FF6A3D; transform: scale(1); }
            77% { opacity: 1; color: #FFF; transform: scale(1); }
            95%, 100% { opacity: 1; color: #FFF; transform: scale(15) translateY(-28%); }
        }

        @keyframes pulse-anim {
            0%, 40% { transform: translate(-50%, -50%) scale(0); opacity: 0; filter: blur(10px); background: #FF6A3D; }
            41% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; filter: blur(15px); background: #FF6A3D; }
            60% { transform: translate(-50%, -50%) scale(2.5); opacity: 0.5; filter: blur(25px); background: #FF6A3D; }
            77%, 100% { transform: translate(-50%, -50%) scale(25); opacity: 1; filter: blur(0px); background: #FF6A3D; }
        }
      `}</style>
      
      <div className="splash-screen w-full relative">
        <div className="splash-dot"></div>
        <div className="splash-pulse-circle"></div>
        <div className="splash-logo-container">
            <svg className="splash-logo-svg" version="1.0" xmlns="http://www.w3.org/2000/svg" width="140pt" height="140pt" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,140.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
                    <path d="M344 1168 c-4 -7 -8 -57 -8 -112 l-1 -101 -62 -45 c-72 -52 -88 -84 -54 -111 24 -20 45 -16 78 14 40 36 44 18 41 -201 -3 -206 -3 -207 24 -264 154 -328 635 -278 707 74 62 299 -308 527 -571 353 -62 -41 -68 -36 -68 55 l0 79 73 54 c125 92 179 127 197 127 17 0 225 -144 378 -262 72 -55 72 -55 102 -30 36 29 20 60 -55 112 -75 51 -80 64 -71 160 7 78 -3 93 -56 88 -32 -3 -33 -5 -36 -51 -4 -67 -18 -67 -106 -3 -142 106 -180 105 -328 -10 -91 -70 -98 -70 -98 4 0 32 -5 63 -12 70 -15 15 -65 16 -74 0z m528 -501 c153 -70 148 -188 -9 -247 -270 -101 -587 94 -371 228 93 58 277 67 380 19z m93 -283 c-13 -35 -25 -49 -51 -60 -47 -20 -177 -17 -244 6 l-55 18 84 1 c100 1 181 22 236 60 50 35 52 33 30 -25z m-379 -68 c72 -34 125 -47 204 -49 78 -2 79 -16 2 -38 -138 -39 -283 17 -343 133 -34 66 -23 73 33 24 29 -25 76 -57 104 -70z"/>
                </g>
            </svg>
        </div>
      </div>
    </>
  );
}
