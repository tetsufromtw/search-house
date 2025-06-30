'use client';

import React from 'react';
import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps';

interface MapProps {
  children?: React.ReactNode;
  defaultZoom?: number;
  defaultCenter?: { lat: number; lng: number };
  className?: string;
  mapId?: string;
}

export default function Map({
  children,
  defaultZoom = 13,
  defaultCenter = { lat: 35.6762, lng: 139.6503 }, // 東京市中心
  className = "w-full h-full",
  mapId = "search-house-map"
}: MapProps) {
  return (
    <APIProvider 
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}
      libraries={['places']}
    >
      <div className={className}>
        <GoogleMap
          defaultZoom={defaultZoom}
          defaultCenter={defaultCenter}
          className="w-full h-full"
          mapId={mapId}
        >
          {children}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}