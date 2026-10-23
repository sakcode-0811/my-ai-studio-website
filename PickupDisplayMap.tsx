import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FoodDonation } from '../types/donation.ts';
import { createFoodMapMarkerIcon } from '../utils/leafletHelper.ts';
import { ExternalLink, Navigation } from 'lucide-react';
import { formatLocalDateTime } from '../services/safetyService.ts';

interface PickupDisplayMapProps {
  donation: FoodDonation;
  height?: string;
  zoom?: number;
}

export const PickupDisplayMap: React.FC<PickupDisplayMapProps> = ({
  donation,
  height = '260px',
  zoom = 15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const lat = donation.latitude || 18.5204;
    const lng = donation.longitude || 73.8567;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: createFoodMapMarkerIcon(donation.category)
      }).addTo(map);

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; min-width: 180px; padding: 2px;">
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">${donation.foodName}</div>
          <div style="color: #059669; font-weight: 600; margin-bottom: 4px;">🍽️ ${donation.servings} Servings (${donation.category === 'vegetarian' ? 'Veg' : 'Non-Veg'})</div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 4px;"><strong>Pickup:</strong> ${donation.pickupAddress}, ${donation.city}</div>
          ${donation.landmark ? `<div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">📍 Near ${donation.landmark}</div>` : ''}
          <div style="color: #dc2626; font-size: 11px; font-weight: 600;">Deadline: ${formatLocalDateTime(donation.pickupDeadline)}</div>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapRef.current.setView([lat, lng], zoom);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [donation.latitude, donation.longitude, donation.foodName]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${donation.latitude},${donation.longitude}`;

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={containerRef} style={{ width: '100%', height }} />

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 right-2.5 z-[400] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-emerald-800 text-xs font-semibold rounded-lg shadow-md border border-slate-200 transition-all hover:scale-105"
      >
        <Navigation className="w-3.5 h-3.5 text-emerald-600" />
        Open in Maps / Get Directions
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </div>
  );
};
