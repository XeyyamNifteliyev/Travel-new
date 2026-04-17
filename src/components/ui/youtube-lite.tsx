'use client';

import { useState } from 'react';
import Image from 'next/image';

interface YouTubeLiteProps {
  videoId: string;
  title?: string;
  className?: string;
}

export default function YouTubeLite({ videoId, title, className }: YouTubeLiteProps) {
  const [loaded, setLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  if (thumbError) {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative aspect-video bg-gradient-to-br from-red-900 to-red-700 rounded-xl overflow-hidden flex flex-col items-center justify-center group ${className || ''}`}
      >
        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {title && (
          <p className="text-white text-sm font-medium mt-3 px-4 text-center line-clamp-2">{title}</p>
        )}
        <span className="text-red-300 text-xs mt-1">YouTube</span>
      </a>
    );
  }

  return (
    <div
      className={`relative aspect-video bg-black rounded-xl overflow-hidden cursor-pointer group ${className || ''}`}
      onClick={() => setLoaded(true)}
    >
      {!loaded ? (
        <>
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title || 'Video'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => setThumbError(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80">
              <p className="text-white text-sm font-medium line-clamp-1">{title}</p>
            </div>
          )}
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
