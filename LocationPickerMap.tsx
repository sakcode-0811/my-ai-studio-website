import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, AlertCircle } from 'lucide-react';
import { createLocationPickerIcon } from '../utils/leafletHelper.ts';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { lat: number; lng: number; addressSnippet?: string }) => void;
  pickupAddress?: string;
  city?: string;
}

const CITY_PRESETS = [
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 }
];

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
  pickupAddress,
  city
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = latitude || 18.5204;
      const initialLng = longitude || 73.8567;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([initialLat, initialLng], {
        icon: createLocationPickerIcon(),
        draggable: true
      }).addTo(map);

      marker.bindPopup('<b>Selected Pickup Location</b><br>Drag pin or click map to reposition').openPopup();

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange({ lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) });
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      // Map cleanup if unmounted
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position if external lat/lng change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
      },
      (err) => {
        setIsLocating(false);
        setGeoError('Could not retrieve GPS location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityPreset = (cityItem: typeof CITY_PRESETS[0]) => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([cityItem.lat, cityItem.lng]);
      mapInstanceRef.current.setView([cityItem.lat, cityItem.lng], 13);
    }
    onChange({ lat: cityItem.lat, lng: cityItem.lng });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Interactive Map Pin (Leaflet & OpenStreetMap)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Detecting GPS...' : 'Use My GPS'}
          </button>
        </div>
      </div>

      {geoError && (
        <div className="p-2 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-md flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map viewport */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
        <div
          ref={mapContainerRef}
          className="w-full h-56 sm:h-64 z-0"
          style={{ minHeight: '220px' }}
        />

        {/* Quick jump city chips */}
        <div className="absolute top-2 right-2 z-[400] bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-md border border-slate-200 flex flex-wrap gap-1 max-w-[220px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 w-full pl-1">Jump to city:</span>
          {CITY_PRESETS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleCityPreset(c)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Location coordinates badge */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
          <span>Lat: <strong>{latitude ? latitude.toFixed(5) : '0.00'}</strong></span>
          <span>Lng: <strong>{longitude ? longitude.toFixed(5) : '0.00'}</strong></span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        💡 Click anywhere on the map or drag the pin to designate the exact vehicle pickup spot.
      </p>
    </div>
  );
};
