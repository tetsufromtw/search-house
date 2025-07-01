'use client';

import React from 'react';
import Map from '../components/map/Map';
import MapHandler from '../components/map/MapHandler';

interface MapContainerProps {
  className?: string;
}

export default function MapContainer({ className = "" }: MapContainerProps) {

  return (
    <div className={`flex-1 bg-white border border-gray-200 shadow-sm relative ${className}`}>
      <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] 2xl:h-[700px]">
        <Map>
          <MapHandler />
        </Map>
      </div>
    </div>
  );
}