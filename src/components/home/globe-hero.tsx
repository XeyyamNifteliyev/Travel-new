'use client';

import { useEffect, useRef } from 'react';
import { Plane } from 'lucide-react';

function useAnimatedPlanes(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef<number>(0);
  const angle1Ref = useRef(0);
  const angle2Ref = useRef(180);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const p1 = el.querySelector('[data-plane="1"]') as HTMLElement;
    const p2 = el.querySelector('[data-plane="2"]') as HTMLElement;

    const cx = 140;
    const cy = 140;
    const orbit1R = 160;
    const orbit2R = 180;

    function animate() {
      angle1Ref.current += 0.18;
      angle2Ref.current += 0.12;

      const a1 = (angle1Ref.current * Math.PI) / 180;
      const a2 = (angle2Ref.current * Math.PI) / 180;

      if (p1) {
        const x = cx + orbit1R * Math.cos(a1);
        const y = cy + orbit1R * Math.sin(a1);
        const deg = angle1Ref.current + 135;
        p1.style.transform = `translate(${x - 8}px, ${y - 8}px) rotate(${deg}deg)`;
      }

      if (p2) {
        const x = cx + orbit2R * Math.cos(a2);
        const y = cy + orbit2R * Math.sin(a2);
        const deg = angle2Ref.current + 135;
        p2.style.transform = `translate(${x - 7}px, ${y - 7}px) rotate(${deg}deg)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [containerRef]);
}

export function GlobeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimatedPlanes(containerRef);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={containerRef} className="relative" style={{ width: '280px', height: '280px' }}>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
            transform: 'scale(1.3)',
            animation: 'glowPulse 4s ease-in-out infinite'
          }}
        />

        {/* Globe */}
        <div className="absolute inset-0 rounded-full overflow-hidden globe-sphere">
          <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full">
            {/* Grid lines */}
            <ellipse cx="140" cy="140" rx="120" ry="40" className="globe-grid" />
            <ellipse cx="140" cy="140" rx="120" ry="80" className="globe-grid" />
            <ellipse cx="140" cy="140" rx="40" ry="120" className="globe-grid" />
            <ellipse cx="140" cy="140" rx="80" ry="120" className="globe-grid" />
            <line x1="20" y1="140" x2="260" y2="140" className="globe-grid" />
            <line x1="140" y1="20" x2="140" y2="260" className="globe-grid" />

            {/* North America */}
            <path d="M45 55 L55 45 L70 42 L82 48 L88 58 L92 68 L88 78 L82 85 L75 88 L68 92 L60 95 L55 90 L48 85 L42 78 L40 70 L42 62 Z" className="globe-continent" />
            {/* South America */}
            <path d="M80 108 L88 102 L95 108 L100 120 L102 135 L98 150 L92 165 L85 175 L78 178 L75 168 L72 155 L70 140 L72 125 L76 115 Z" className="globe-continent" />
            {/* Europe */}
            <path d="M125 52 L132 48 L140 50 L148 48 L152 55 L148 62 L142 65 L135 68 L128 65 L124 60 Z" className="globe-continent" />
            {/* Africa */}
            <path d="M128 78 L138 72 L148 75 L155 85 L158 100 L155 118 L150 135 L142 148 L135 155 L128 148 L122 135 L120 118 L122 100 L125 88 Z" className="globe-continent" />
            {/* Asia */}
            <path d="M155 42 L170 38 L188 40 L205 48 L215 58 L218 72 L212 82 L200 88 L185 92 L172 88 L162 80 L155 70 L152 58 Z" className="globe-continent" />
            {/* SE Asia / Indonesia */}
            <path d="M190 98 L198 95 L208 98 L215 105 L210 112 L200 115 L192 110 L188 105 Z" className="globe-continent" />
            {/* Australia */}
            <path d="M200 138 L212 132 L222 138 L225 150 L220 160 L210 162 L202 155 L198 148 Z" className="globe-continent" />
            {/* Japan */}
            <path d="M208 60 L212 55 L215 62 L212 70 L208 68 Z" className="globe-continent" />
          </svg>

          {/* Shine */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 50%)'
            }}
          />
        </div>

        {/* Orbit rings */}
        <svg
          className="absolute"
          style={{ width: '360px', height: '360px', left: '-40px', top: '-40px' }}
          viewBox="0 0 360 360"
        >
          <circle cx="180" cy="180" r="160" fill="none" stroke="rgba(14,165,233,0.12)" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="180" cy="180" r="180" fill="none" stroke="rgba(14,165,233,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>

        {/* Planes */}
        <div data-plane="1" className="absolute top-0 left-0" style={{ width: '16px', height: '16px', zIndex: 10 }}>
          <Plane className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.6))' }} />
        </div>
        <div data-plane="2" className="absolute top-0 left-0" style={{ width: '14px', height: '14px', zIndex: 10 }}>
          <Plane className="w-3.5 h-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.6))' }} />
        </div>
      </div>

      <style jsx global>{`
        .globe-sphere {
          background: radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f2440 40%, #0a1628 80%, #050d1a 100%);
          box-shadow: inset -20px -10px 40px rgba(0,0,0,0.5), 0 0 60px rgba(14,165,233,0.15), 0 0 120px rgba(14,165,233,0.08);
          animation: globeRotate 120s linear infinite;
        }
        .light .globe-sphere {
          background: radial-gradient(circle at 35% 35%, #1e40af 0%, #1e3a8a 30%, #172554 60%, #0c1a3a 100%);
          box-shadow: inset -15px -8px 30px rgba(0,0,0,0.3), 0 0 40px rgba(30,64,175,0.15), 0 0 80px rgba(30,64,175,0.08);
        }
        .globe-grid {
          fill: none;
          stroke: rgba(96,165,250,0.18);
          stroke-width: 0.5;
        }
        .light .globe-grid {
          stroke: rgba(96,165,250,0.22);
          stroke-width: 0.5;
        }
        .globe-continent {
          fill: rgba(16,185,129,0.4);
        }
        .light .globe-continent {
          fill: rgba(22,101,52,0.3);
        }
        @keyframes globeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1.3); }
          50% { opacity: 0.9; transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}
