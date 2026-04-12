'use client';

import { Plane } from 'lucide-react';

const flags = ['🇦🇿', '🇹🇷', '🇵🇰', '🇷🇺', '🇬🇪', '🇦🇪', '🇯🇵', '🇫🇷', '🇮🇹', '🇪🇸', '🇬🇧', '🇺🇸', '🇩🇪', '🇰🇷', '🇮🇷', '🇹🇭', '🇲🇻', '🇮🇩', '🇪🇬', '🇲🇾'];

export function GlobeHero() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Flag Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-6 opacity-[0.06] blur-[1px]">
          {flags.map((flag, i) => (
            <span key={i} className="text-5xl md:text-6xl select-none" style={{
              animation: `flagFloat ${8 + i * 0.5}s ease-in-out infinite`
            }}>
              {flag}
            </span>
          ))}
        </div>
      </div>

      {/* Globe Container */}
      <div className="relative" style={{ width: '280px', height: '280px' }}>
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            transform: 'scale(1.3)',
            animation: 'glowPulse 4s ease-in-out infinite'
          }}
        />

        {/* Globe Sphere */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f2440 40%, #0a1628 80%, #050d1a 100%)',
            boxShadow: 'inset -20px -10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.2), 0 0 120px rgba(59, 130, 246, 0.1)',
            animation: 'globeRotate 60s linear infinite'
          }}
        >
          {/* Continent SVG Overlay */}
          <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full opacity-30">
            <path d="M60 80 Q70 60 90 65 Q100 70 95 85 Q90 95 80 100 Q70 95 65 90 Z" fill="rgba(34, 197, 94, 0.4)" />
            <path d="M85 130 Q95 125 100 140 Q105 160 95 180 Q85 190 80 175 Q75 160 78 145 Z" fill="rgba(34, 197, 94, 0.4)" />
            <path d="M130 70 Q145 65 155 75 Q160 85 150 90 Q140 85 135 80 Z" fill="rgba(34, 197, 94, 0.4)" />
            <path d="M135 100 Q150 95 160 110 Q165 130 155 150 Q145 160 135 145 Q125 130 128 115 Z" fill="rgba(34, 197, 94, 0.4)" />
            <path d="M165 60 Q190 55 210 70 Q220 85 215 100 Q200 110 185 105 Q170 95 165 80 Z" fill="rgba(34, 197, 94, 0.4)" />
            <path d="M200 140 Q215 135 220 145 Q225 155 215 160 Q205 155 200 150 Z" fill="rgba(34, 197, 94, 0.4)" />
            <ellipse cx="140" cy="140" rx="120" ry="40" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.5" />
            <ellipse cx="140" cy="140" rx="120" ry="80" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
            <ellipse cx="140" cy="140" rx="40" ry="120" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.5" />
            <ellipse cx="140" cy="140" rx="80" ry="120" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
            <line x1="20" y1="140" x2="260" y2="140" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.5" />
            <line x1="140" y1="20" x2="140" y2="260" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="0.5" />
          </svg>

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
            }}
          />
        </div>

        {/* Orbit Ring 1 */}
        <div
          className="absolute rounded-full"
          style={{
            width: '320px',
            height: '320px',
            left: '-20px',
            top: '-20px',
            border: '1px dashed rgba(59, 130, 246, 0.15)'
          }}
        />

        {/* Orbit Ring 2 */}
        <div
          className="absolute rounded-full"
          style={{
            width: '360px',
            height: '360px',
            left: '-40px',
            top: '-40px',
            border: '1px dashed rgba(34, 211, 238, 0.12)'
          }}
        />

        {/* Plane 1 - Clockwise orbit */}
        <div
          className="absolute"
          style={{
            width: '320px',
            height: '320px',
            left: '-20px',
            top: '-20px',
            animation: 'orbit1 15s linear infinite'
          }}
        >
          <div
            className="absolute"
            style={{
              left: '0',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'counterRotate1 15s linear infinite'
            }}
          >
            <Plane className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))', transform: 'rotate(-90deg)' }} />
          </div>
        </div>

        {/* Plane 2 - Clockwise orbit (different radius) */}
        <div
          className="absolute"
          style={{
            width: '360px',
            height: '360px',
            left: '-40px',
            top: '-40px',
            animation: 'orbit2 22s linear infinite'
          }}
        >
          <div
            className="absolute"
            style={{
              left: '0',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'counterRotate2 22s linear infinite'
            }}
          >
            <Plane className="w-3.5 h-3.5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))', transform: 'rotate(-90deg)' }} />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes orbit1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterRotate1 {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes counterRotate2 {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes globeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1.3); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes flagFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
