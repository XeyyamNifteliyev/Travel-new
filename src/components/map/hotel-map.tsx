'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  price: number;
}

interface HotelMapProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
  onMarkerClick?: (index: number) => void;
}

export default function HotelMap({
  markers,
  center = [40.4, 49.8],
  zoom = 4,
  className = '',
  height = '100%',
  onMarkerClick,
}: HotelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds: [number, number][] = [];

    markers.forEach((marker, index) => {
      const el = document.createElement('div');
      el.className = 'hotel-map-marker';
      el.innerHTML = `<span>${marker.price} AZN</span>`;
      el.style.cssText = 'background:#0ea5e9;color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;box-shadow:0 2px 12px rgba(14,165,233,0.4);border:2px solid rgba(255,255,255,0.3);';

      const icon = L.divIcon({
        html: el.outerHTML,
        className: '',
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const m = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindTooltip(marker.name, {
          direction: 'top',
          offset: [0, -18],
          className: 'hotel-map-tooltip',
        });

      if (onMarkerClick) {
        m.on('click', () => onMarkerClick(index));
      }

      markersRef.current.push(m);
      bounds.push([marker.lat, marker.lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [markers, onMarkerClick]);

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-xl" />
    </div>
  );
}
