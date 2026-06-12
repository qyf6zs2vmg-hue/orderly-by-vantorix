import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';

// Fix for default marker icon in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerMapProps {
  onLocationSelected: (lat: number, lng: number, address: string) => void;
}

export default function LocationPickerMap({ onLocationSelected }: LocationPickerMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<L.Map>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addr);
      onLocationSelected(lat, lng, addr);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      const addrFallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addrFallback);
      onLocationSelected(lat, lng, addrFallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationFound = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    mapRef.current?.setView([lat, lng], 16);
    reverseGeocode(lat, lng);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationFound(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation denied or failed', err);
          // Default location: center of Moscow or similar. Let's use a default (55.7558, 37.6173) or just show map starting at [0,0] with low zoom
          setPosition([55.7558, 37.6173]);
        }
      );
    } else {
      setPosition([55.7558, 37.6173]);
    }
  }, []);

  function MapEvents() {
    useMapEvents({
      click(e) {
        handleLocationFound(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const findMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationFound(pos.coords.latitude, pos.coords.longitude);
        }
      );
    }
  };

  if (!position) {
     return <div className="h-64 w-full bg-surface-alt animate-pulse rounded-xl flex items-center justify-center text-text-muted">Загрузка карты...</div>;
  }

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-border-color shadow-sm">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        {position && <Marker position={position} />}
      </MapContainer>
      <button 
        type="button"
        onClick={findMe}
        className="absolute bottom-4 right-4 z-[400] bg-surface p-2 rounded-full shadow-lg border border-border-color text-text-main hover:bg-surface-alt transition-colors"
        title="Мое местоположение"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
      {address && (
        <div className="absolute top-2 left-2 right-2 z-[400] bg-surface/90 backdrop-blur text-text-main text-[12px] font-medium p-2 rounded-lg border border-border-color shadow-sm line-clamp-2">
          {isLoading ? 'Определение адреса...' : address}
        </div>
      )}
    </div>
  );
}
