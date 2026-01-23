'use client';

import { useEffect, useState } from "react";

export default function Preloader({ onFinish }: { onFinish?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-700 animate-out fade-out">
      
      {/* 1. CENTER LOGO CONTAINER */}
      <div className="relative flex flex-col items-center">
        
        {/* The Logo with Shine Effect */}
        <div className="relative w-32 h-32 overflow-hidden rounded-2xl p-2">
           {/* Logo Image */}
           <img 
             src="/logo.png" 
             alt="Logo" 
             className="w-full h-full object-contain relative z-10 animate-bounce-slight"
           />
           
           {/* Moving Shine Animation */}
           <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] animate-shine z-20" />
        </div>

        {/* Pulsing Shadow */}
        <div className="w-24 h-4 bg-black/10 rounded-[100%] blur-md animate-shadow-pulse mt-4"></div>
        
        {/* Loading Bar */}
        <div className="w-32 h-1 bg-gray-100 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 animate-loading-bar rounded-full"></div>
        </div>

      </div>

      {/* 2. FOOTER TEXT */}
      <div className="absolute bottom-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
          Designed & Developed by
        </p>
        <p className="text-xs font-bold text-gray-800 tracking-wider mt-1">
          Vogue Software Solutions
        </p>
      </div>

    </div>
  );
}