import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface OrderLocationMapProps {
  lat: number;
  lng: number;
  address?: string;
}

export default function OrderLocationMap({ lat, lng, address }: OrderLocationMapProps) {
  const position: [number, number] = [lat, lng];

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border-color shadow-sm mt-3">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
      </MapContainer>
      <div className="absolute top-2 left-2 right-2 z-[400] flex justify-between items-start gap-2 pointer-events-none">
        {address ? (
          <div className="bg-surface/90 backdrop-blur text-text-main text-[11px] font-medium p-2 rounded-lg border border-border-color shadow-sm line-clamp-2 pointer-events-auto">
            {address}
          </div>
        ) : <div />}
        <a 
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto shrink-0 bg-text-main text-bg-base px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-md hover:bg-text-main/90 transition-colors"
        >
          Google Maps
        </a>
      </div>
    </div>
  );
}
