'use client';

import { useState, useEffect } from 'react';

export default function UiBackground({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-slate-50 overflow-hidden">
      
      {/* 1. FIXED GRID PATTERN */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. MOUSE SPOTLIGHT (The "Hover" Effect) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(
              600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(37, 99, 235, 0.15), 
              transparent 40%
            )
          `,
        }}
      />

      {/* 3. ANIMATED FLOATING BLOBS (Yellow & Blue) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Yellow Blob (Top Left) */}
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-3xl animate-blob mix-blend-multiply filter" />
        
        {/* Blue Blob (Bottom Right) */}
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter" />
        
        {/* Secondary Yellow Blob (Bottom Left) */}
        <div className="absolute -bottom-[20%] left-[20%] w-[500px] h-[500px] bg-amber-300/20 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-multiply filter" />
      </div>

      {/* 4. CONTENT WRAPPER */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}