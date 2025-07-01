'use client';

import React from 'react';
import Map from '../components/map/Map';
import MapHandler from '../components/map/MapHandler';

interface MapContainerProps {
  className?: string;
}

export default function MapContainer({ className = "" }: MapContainerProps) {

  return (
    <div className={`flex-1 bg-white border border-[#e5e5e5] shadow-sm relative ${className}`}>
      <div className="h-96 xl:h-[600px]">
        <Map>
          <MapHandler />
        </Map>
      </div>
    </div>
  );
}