'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollProgress() {
  const ringRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const size = 56;
  const center = size / 2;
  const radius = 24;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const pct = scrollTop / docHeight;
    const offset = circumference - pct * circumference;

    if (ringRef.current) {
      ringRef.current.setAttribute('stroke-dashoffset', String(offset));
    }
    if (barRef.current) {
      barRef.current.style.height = `${pct * 100}%`;
    }
  }, [circumference]);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      setVisible(window.scrollY > 150);
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateProgress]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <div className="fixed right-0 top-0 h-full z-[60] flex flex-col items-center pointer-events-none hidden md:flex">
        <div className="flex-1 bg-[var(--border-light)] rounded-full w-[3px] relative overflow-hidden opacity-40">
          <div
            ref={barRef}
            className="absolute top-0 left-0 w-full rounded-full"
            style={{
              height: '0%',
              background: 'linear-gradient(to bottom, #0EA5E9, #10B981)',
            }}
          />
        </div>
      </div>

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 z-[60] flex items-center justify-center transition-opacity duration-200 cursor-pointer hover:scale-110 md:bottom-8 md:right-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          pointerEvents: visible ? 'auto' : 'none',
          width: size,
          height: size,
        }}
      >
        <svg width={size} height={size} className="absolute top-0 left-0">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            ref={ringRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#scrollProgressGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${center} ${center})`}
          />
          <defs>
            <linearGradient id="scrollProgressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center shadow-lg relative z-10">
          <ArrowUp size={18} className="text-[#0EA5E9]" />
        </div>
      </button>
    </>
  );
}
