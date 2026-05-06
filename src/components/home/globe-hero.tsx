'use client';

import { useEffect, useRef } from 'react';
import { Plane } from 'lucide-react';

const CX = 140, CY = 140, R = 120;

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

function useAnimatedPlanes(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef<number>(0);
  const angle1Ref = useRef(0);
  const angle2Ref = useRef(180);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentEl = el;
    let started = false;

    function start() {
      if (started) return;
      started = true;

      const p1 = currentEl.querySelector('[data-plane="1"]') as HTMLElement;
      const p2 = currentEl.querySelector('[data-plane="2"]') as HTMLElement;

      const cx = 140, cy = 140;
      const r1 = 160, r2 = 180;

      function animate() {
        angle1Ref.current += 0.18;
        angle2Ref.current += 0.12;

        const a1 = (angle1Ref.current * Math.PI) / 180;
        const a2 = (angle2Ref.current * Math.PI) / 180;

        if (p1) {
          const x = cx + r1 * Math.cos(a1);
          const y = cy + r1 * Math.sin(a1);
          p1.style.transform = `translate(${x - 8}px, ${y - 8}px) rotate(${angle1Ref.current + 135}deg)`;
        }

        if (p2) {
          const x = cx + r2 * Math.cos(a2);
          const y = cy + r2 * Math.sin(a2);
          p2.style.transform = `translate(${x - 7}px, ${y - 7}px) rotate(${angle2Ref.current + 135}deg)`;
        }

        frameRef.current = requestAnimationFrame(animate);
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    const observer = new MutationObserver(() => {
      if (!started && currentEl.querySelector('[data-plane="1"]') && currentEl.querySelector('[data-plane="2"]')) {
        start();
        observer.disconnect();
      }
    });

    if (currentEl.querySelector('[data-plane="1"]') && currentEl.querySelector('[data-plane="2"]')) {
      start();
    } else {
      observer.observe(currentEl, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, []);
}

function useVerticalPlanes(containerRef: React.RefObject<HTMLDivElement | null>) {
  const frameRef = useRef<number>(0);
  const angleRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentEl = el;
    let started = false;

    function start() {
      if (started) return;
      started = true;

      const p3 = currentEl.querySelector('[data-plane="3"]') as HTMLElement;
      const p4 = currentEl.querySelector('[data-plane="4"]') as HTMLElement;

      const cx = 140, cy = 140;
      const FADE = 8;

      function updatePlane(el: HTMLElement, offset: number, rx: number, ry: number, size: number) {
        const angle = angleRef.current + offset;
        const rad = (angle * Math.PI) / 180;
        const aNorm = angle % 360;

        const x = cx + rx * Math.sin(rad);
        const y = cy + ry * Math.cos(rad);

        let opacity: number;
        let zIdx: number;
        if (aNorm > 180) {
          opacity = 0.06;
          zIdx = 1;
        } else if (aNorm < FADE) {
          opacity = 0.06 + (aNorm / FADE) * 0.94;
          zIdx = aNorm > FADE / 2 ? 10 : 1;
        } else if (aNorm > 180 - FADE) {
          opacity = 0.06 + ((180 - aNorm) / FADE) * 0.94;
          zIdx = aNorm < 180 - FADE / 2 ? 10 : 1;
        } else {
          opacity = 1;
          zIdx = 10;
        }

        const half = size / 2;
        el.style.transform = `translate(${x - half}px, ${y - half}px) rotate(-45deg)`;
        el.style.opacity = opacity.toString();
        el.style.zIndex = zIdx.toString();
      }

      function animate() {
        angleRef.current += 0.15;

        if (p3) updatePlane(p3, 0, 8, 165, 16);
        if (p4) updatePlane(p4, 180, 12, 185, 14);

        frameRef.current = requestAnimationFrame(animate);
      }

      frameRef.current = requestAnimationFrame(animate);
    }

    const observer = new MutationObserver(() => {
      if (!started && currentEl.querySelector('[data-plane="3"]') && currentEl.querySelector('[data-plane="4"]')) {
        start();
        observer.disconnect();
      }
    });

    if (currentEl.querySelector('[data-plane="3"]') && currentEl.querySelector('[data-plane="4"]')) {
      start();
    } else {
      observer.observe(currentEl, { childList: true, subtree: true });
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, []);
}

export function GlobeHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  useAnimatedPlanes(containerRef);
  useVerticalPlanes(containerRef);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ns = 'http://www.w3.org/2000/svg';
    const gridPaths: SVGPathElement[] = [];
    const gridG = document.createElementNS(ns, 'g');

    for (const m of MERIDIANS) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('class', 'globe-grid');
      gridPaths.push(p);
      gridG.appendChild(p);
    }
    for (const pa of PARALLELS) {
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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="relative" style={{ width: '280px', height: '280px' }}>
        <div className="absolute inset-0 rounded-full globe-glow" />

        <div className="absolute inset-0 rounded-full overflow-hidden globe-sphere" style={{ zIndex: 5 }}>
          <svg ref={svgRef} viewBox="0 0 280 280" className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 rounded-full globe-shine" />
        </div>

        <svg
          className="absolute overflow-hidden"
          style={{ width: '128.57%', height: '128.57%', left: '-14.29%', top: '-14.29%' }}
          viewBox="0 0 360 360"
        >
          <circle cx="180" cy="180" r="160" fill="none" className="globe-orbit" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="180" cy="180" r="180" fill="none" className="globe-orbit-faint" strokeWidth="0.5" strokeDasharray="4 4" />
          <ellipse cx="180" cy="180" rx="8" ry="165" fill="none" className="globe-orbit-vert" strokeWidth="0.4" />
          <ellipse cx="180" cy="180" rx="12" ry="185" fill="none" className="globe-orbit-vert-faint" strokeWidth="0.4" />
        </svg>

        <div data-plane="1" className="absolute top-0 left-0" style={{ width: '16px', height: '16px', zIndex: 10 }}>
          <Plane className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.6))' }} />
        </div>
        <div data-plane="2" className="absolute top-0 left-0" style={{ width: '14px', height: '14px', zIndex: 10 }}>
          <Plane className="w-3.5 h-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.6))' }} />
        </div>
        <div data-plane="3" className="absolute top-0 left-0" style={{ width: '16px', height: '16px', zIndex: 10 }}>
          <Plane className="w-4 h-4 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.5))' }} />
        </div>
        <div data-plane="4" className="absolute top-0 left-0" style={{ width: '14px', height: '14px', zIndex: 10 }}>
          <Plane className="w-3.5 h-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.5))' }} />
        </div>
      </div>

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
        .globe-orbit-faint { stroke: rgba(14,165,233,0.08); }
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
