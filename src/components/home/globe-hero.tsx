'use client';

import { useEffect, useRef } from 'react';
import { Plane } from 'lucide-react';

const CX = 140, CY = 140, R = 120;
const PLANE_CX = CX - 100;
const PLANE_CY = CY - 100;

const LAND: number[][][] = [
  [[-168,65],[-155,71],[-140,72],[-125,70],[-110,70],[-95,73],[-80,72],
   [-65,62],[-55,50],[-60,46],[-66,44],[-72,40],[-78,34],[-82,25],
   [-85,28],[-90,30],[-97,26],[-105,20],[-110,25],[-118,34],[-124,42],
   [-126,52],[-122,60],[-130,68],[-150,68],[-168,65]],
  [[-80,10],[-72,12],[-62,10],[-52,3],[-44,-2],[-38,-8],[-35,-15],
   [-38,-22],[-45,-24],[-50,-30],[-55,-36],[-60,-42],[-66,-50],[-70,-54],
   [-74,-48],[-75,-38],[-78,-15],[-80,-2],[-80,10]],
  [[-10,36],[-4,42],[0,44],[5,48],[10,54],[14,56],[18,60],[22,64],
   [28,70],[32,66],[28,58],[24,52],[18,44],[22,40],[26,38],
   [12,38],[5,37],[0,36],[-10,36]],
  [[-17,15],[-17,22],[-13,28],[-5,36],[5,37],[10,37],[15,34],
   [25,32],[33,30],[38,22],[42,12],[48,2],[44,-4],[40,-12],
   [36,-20],[30,-30],[24,-34],[18,-34],[14,-26],[10,-10],
   [6,4],[2,6],[-5,5],[-10,8],[-17,15]],
  [[26,42],[30,45],[35,48],[40,52],[45,56],[50,58],[55,56],[60,55],
   [65,55],[70,52],[75,48],[80,46],[85,48],[90,46],[95,48],[100,52],
   [105,50],[110,48],[115,44],[120,40],[125,38],[128,36],[130,35],
   [135,35],[140,38],[145,46],[150,50],[160,58],[170,62],[180,66],
   [170,70],[150,72],[120,72],[90,70],[60,68],[40,60],[26,42]],
  [[68,24],[72,20],[76,16],[78,8],[80,10],[82,14],[84,20],
   [88,22],[88,24],[85,26],[80,28],[76,28],[72,26],[68,24]],
  [[35,28],[38,24],[40,18],[42,14],[44,14],[48,16],[52,18],
   [56,22],[56,25],[52,24],[48,22],[44,22],[40,26],[35,28]],
  [[115,-35],[118,-34],[122,-34],[128,-32],[132,-30],[135,-25],
   [138,-18],[142,-12],[146,-15],[150,-22],[152,-28],[150,-32],
   [148,-35],[145,-38],[140,-38],[135,-36],[130,-35],[125,-34],
   [120,-34],[115,-35]],
  [[-55,60],[-50,65],[-42,70],[-35,75],[-25,78],[-18,78],
   [-20,72],[-25,68],[-35,64],[-45,62],[-55,60]],
  [[-8,50],[-5,52],[-3,54],[-5,56],[-3,58],[0,58],
   [2,56],[2,52],[0,50],[-4,50],[-8,50]],
  [[-24,64],[-20,65],[-15,66],[-14,65],[-18,63],[-22,63],[-24,64]],
  [[130,31],[132,34],[134,36],[136,38],[140,40],[142,42],
   [144,44],[142,44],[138,40],[136,36],[132,32],[130,31]],
  [[44,-13],[47,-16],[50,-20],[50,-24],[47,-25],[44,-24],[43,-18],[44,-13]],
  [[96,-5],[100,-2],[106,-6],[110,-7],[116,-8],[122,-8],
   [128,-5],[134,-4],[140,-6],[140,-8],[134,-8],[126,-10],
   [116,-10],[108,-8],[100,-6],[96,-5]],
  [[172,-36],[174,-38],[176,-42],[175,-44],[172,-46],
   [170,-44],[168,-42],[170,-40],[172,-36]],
];

const MERIDIANS = [-120, -60, 0, 60, 120];
const PARALLELS = [-60, -30, 0, 30, 60];

function projXY(lon: number, lat: number): [number, number] {
  return [CX + R * lon / 180, CY - R * lat / 90];
}

function landPath(pts: number[][], rot: number): string {
  let d = '';
  for (const off of [-360, 0, 360]) {
    if (pts.length === 0) continue;
    d += `M${projXY(pts[0][0] + off - rot, pts[0][1]).join(' ')} `;
    for (let i = 1; i < pts.length; i++) {
      d += `L${projXY(pts[i][0] + off - rot, pts[i][1]).join(' ')} `;
    }
    d += 'Z ';
  }
  return d;
}

function gridMeridian(lon: number, rot: number): string {
  let d = '';
  for (const off of [-360, 0, 360]) {
    const x = CX + R * (lon + off - rot) / 180;
    d += `M${x.toFixed(1)} ${(CY - R).toFixed(1)} L${x.toFixed(1)} ${(CY + R).toFixed(1)} `;
  }
  return d;
}

function gridParallel(lat: number): string {
  const y = CY - R * lat / 90;
  return `M${(CX - 3 * R).toFixed(1)} ${y.toFixed(1)} L${(CX + 3 * R).toFixed(1)} ${y.toFixed(1)}`;
}

interface PlaneConfig {
  id: number;
  speed: number;
  routeAngle: number;
  startProgress: number;
  routeRadius: number;
  bend: number;
  size: number;
  sizeClass: string;
  glowAlpha: number;
  colorClass: string;
}

const PLANE_CONFIGS: PlaneConfig[] = [
  { id: 1, speed: 0.0012, routeAngle: 0,   startProgress: 0.06, routeRadius: 96,  bend: -12, size: 16, sizeClass: 'w-4 h-4',     glowAlpha: 0.7,  colorClass: 'text-blue-400' },
  { id: 2, speed: 0.0010, routeAngle: 180, startProgress: 0.62, routeRadius: 100, bend: 14,  size: 14, sizeClass: 'w-3.5 h-3.5', glowAlpha: 0.62, colorClass: 'text-blue-300' },
  { id: 3, speed: 0.0013, routeAngle: 90,  startProgress: 0.22, routeRadius: 94,  bend: 9,   size: 16, sizeClass: 'w-4 h-4',     glowAlpha: 0.62, colorClass: 'text-amber-300' },
  { id: 4, speed: 0.0011, routeAngle: 270, startProgress: 0.78, routeRadius: 102, bend: -10, size: 14, sizeClass: 'w-3.5 h-3.5', glowAlpha: 0.55, colorClass: 'text-amber-200' },
  { id: 5, speed: 0.0015, routeAngle: 215, startProgress: 0.38, routeRadius: 92,  bend: 12,  size: 12, sizeClass: 'w-3 h-3',     glowAlpha: 0.5,  colorClass: 'text-sky-300' },
  { id: 6, speed: 0.0009, routeAngle: 45,  startProgress: 0.84, routeRadius: 104, bend: -13, size: 13, sizeClass: 'w-3 h-3',     glowAlpha: 0.48, colorClass: 'text-cyan-300' },
  { id: 7, speed: 0.0014, routeAngle: 315, startProgress: 0.48, routeRadius: 90,  bend: 10,  size: 11, sizeClass: 'w-2.5 h-2.5', glowAlpha: 0.45, colorClass: 'text-blue-200' },
];

function routePoint(cfg: PlaneConfig, progress: number) {
  const routeRad = (cfg.routeAngle * Math.PI) / 180;
  const axisX = Math.cos(routeRad);
  const axisY = Math.sin(routeRad);
  const perpX = -axisY;
  const perpY = axisX;
  const travel = 1 - progress * 2;
  const bend = Math.sin(progress * Math.PI) * cfg.bend;

  return {
    x: PLANE_CX + axisX * cfg.routeRadius * travel + perpX * bend,
    y: PLANE_CY + axisY * cfg.routeRadius * travel + perpY * bend,
  };
}

function useAllPlanes(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef<number>(0);
  const progressRefs = useRef(PLANE_CONFIGS.map(c => c.startProgress));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentEl = el;
    let started = false;

    function start() {
      if (started) return;
      started = true;

      const planes = PLANE_CONFIGS.map(c =>
        currentEl.querySelector(`[data-plane="${c.id}"]`) as HTMLElement | null
      );

      function animate() {
        for (let i = 0; i < PLANE_CONFIGS.length; i++) {
          const cfg = PLANE_CONFIGS[i];
          const plane = planes[i];
          if (!plane) continue;

          progressRefs.current[i] = (progressRefs.current[i] + cfg.speed) % 1;
          const progress = progressRefs.current[i];
          const nextProgress = (progress + 0.004) % 1;
          const current = routePoint(cfg, progress);
          const next = nextProgress > progress ? routePoint(cfg, nextProgress) : routePoint(cfg, progress + 0.004);
          const vx = next.x - current.x;
          const vy = next.y - current.y;

          const rotation = Math.atan2(vy, vx) * 180 / Math.PI + 45;

          const hiddenEdge = progress < 0.08 || progress > 0.92;
          const behindGlobe = progress > 0.5;
          const fadeIn = Math.min(1, progress / 0.08);
          const fadeOut = Math.min(1, (1 - progress) / 0.08);
          const opacity = hiddenEdge ? Math.max(0.2, Math.min(fadeIn, fadeOut)) : behindGlobe ? 0.42 : 1;
          const zIdx = behindGlobe ? 9 : 12;

          const half = cfg.size / 2;
          plane.style.transform = `translate(${current.x - half}px, ${current.y - half}px) rotate(${rotation}deg)`;
          plane.style.opacity = opacity.toString();
          plane.style.zIndex = zIdx.toString();
        }

        frameRef.current = requestAnimationFrame(animate);
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    const allPresent = PLANE_CONFIGS.every(c => el.querySelector(`[data-plane="${c.id}"]`));
    if (allPresent) {
      start();
    } else {
      const observer = new MutationObserver(() => {
        const now = PLANE_CONFIGS.every(c => currentEl.querySelector(`[data-plane="${c.id}"]`));
        if (!started && now) {
          start();
          observer.disconnect();
        }
      });
      observer.observe(el, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);
}

export function GlobeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  useAllPlanes(containerRef);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ns = 'http://www.w3.org/2000/svg';
    const gridPaths: SVGPathElement[] = [];
    const gridG = document.createElementNS(ns, 'g');

    for (let i = 0; i < MERIDIANS.length; i++) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('class', 'globe-grid');
      gridPaths.push(p);
      gridG.appendChild(p);
    }
    for (let i = 0; i < PARALLELS.length; i++) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('class', 'globe-grid');
      gridPaths.push(p);
      gridG.appendChild(p);
    }
    svg.appendChild(gridG);

    const landPaths: SVGPathElement[] = [];
    const landG = document.createElementNS(ns, 'g');
    for (let i = 0; i < LAND.length; i++) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('class', 'globe-continent');
      landPaths.push(p);
      landG.appendChild(p);
    }
    svg.appendChild(landG);

    let rotation = 0;
    let frame: number;

    function animate() {
      rotation += 0.06;
      if (rotation >= 360) rotation -= 360;

      let gi = 0;
      for (const m of MERIDIANS) gridPaths[gi++].setAttribute('d', gridMeridian(m, rotation));
      for (const pa of PARALLELS) gridPaths[gi++].setAttribute('d', gridParallel(pa));
      for (let i = 0; i < LAND.length; i++) landPaths[i].setAttribute('d', landPath(LAND[i], rotation));

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center justify-center" style={{ width: '280px', height: '280px' }}>
      <div className="absolute inset-0 rounded-full globe-glow" />

      <div className="absolute inset-0 rounded-full overflow-hidden globe-sphere" style={{ zIndex: 5 }}>
        <svg ref={svgRef} viewBox="0 0 280 280" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 rounded-full globe-shine" />
      </div>

      <svg
        className="absolute overflow-visible"
        style={{ left: '-14.29%', top: '-14.29%', width: '128.57%', height: '128.57%', zIndex: 3 }}
        viewBox="0 0 360 360"
      >
        <circle cx="180" cy="180" r="160" fill="none" className="globe-orbit" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="180" cy="180" r="180" fill="none" className="globe-orbit-faint" strokeWidth="0.5" strokeDasharray="3 5" />
        <circle cx="180" cy="180" r="140" fill="none" className="globe-orbit-faint" strokeWidth="0.4" strokeDasharray="2 6" />
        <circle cx="180" cy="180" r="170" fill="none" className="globe-orbit-faint" strokeWidth="0.4" strokeDasharray="2 6" />
        <ellipse cx="180" cy="180" rx="18" ry="165" fill="none" className="globe-orbit-vert" strokeWidth="0.4" />
        <ellipse cx="180" cy="180" rx="165" ry="18" fill="none" className="globe-orbit-vert-faint" strokeWidth="0.4" />
        <ellipse cx="180" cy="180" rx="170" ry="22" fill="none" className="globe-orbit-vert" strokeWidth="0.3" strokeDasharray="3 5" transform="rotate(45 180 180)" />
        <ellipse cx="180" cy="180" rx="150" ry="20" fill="none" className="globe-orbit-vert-faint" strokeWidth="0.3" strokeDasharray="3 5" transform="rotate(135 180 180)" />
      </svg>

      {PLANE_CONFIGS.map(config => (
        <div
          key={config.id}
          data-plane={config.id}
          className="absolute"
          style={{ width: `${config.size}px`, height: `${config.size}px`, zIndex: 10 }}
        >
          <Plane
            className={`${config.sizeClass} ${config.colorClass}`}
            style={{ filter: `drop-shadow(0 0 6px rgba(96,165,250,${config.glowAlpha}))` }}
          />
        </div>
      ))}

      <style jsx global>{`
        .globe-glow {
          background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
          transform: scale(1.3);
          animation: glowPulse 4s ease-in-out infinite;
        }
        .globe-shine {
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 50%);
        }
        .globe-orbit { stroke: rgba(14,165,233,0.12); }
        .globe-orbit-faint { stroke: rgba(14,165,233,0.07); }
        .globe-orbit-vert { stroke: rgba(251,191,36,0.1); }
        .globe-orbit-vert-faint { stroke: rgba(251,191,36,0.06); }
        .globe-sphere {
          background: radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f2440 40%, #0a1628 80%, #050d1a 100%);
          box-shadow: inset -20px -10px 40px rgba(0,0,0,0.5), 0 0 60px rgba(14,165,233,0.15), 0 0 120px rgba(14,165,233,0.08);
        }
        .globe-grid {
          fill: none;
          stroke: rgba(96,165,250,0.18);
          stroke-width: 0.5;
        }
        .globe-continent {
          fill: rgba(52,211,153,0.6);
          stroke: rgba(255,255,255,0.12);
          stroke-width: 0.4;
          stroke-linejoin: round;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1.3); }
          50% { opacity: 0.9; transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}
