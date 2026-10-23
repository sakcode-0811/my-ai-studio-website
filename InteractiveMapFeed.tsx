import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FoodDonation, FoodCategory } from '../types/donation.ts';
import { createFoodMapMarkerIcon } from '../utils/leafletHelper.ts';
import { MapPin, Navigation, Users, Clock, Filter, ArrowRight } from 'lucide-react';
import { formatLocalDateTime, formatPrepDateTime } from '../services/safetyService.ts';

interface InteractiveMapFeedProps {
  donations: FoodDonation[];
  onSelectDonation: (donation: FoodDonation) => void;
  onClaimDonation?: (donation: FoodDonation) => void;
}

export const InteractiveMapFeed: React.FC<InteractiveMapFeedProps> = ({
  donations,
  onSelectDonation,
  onClaimDonation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterCat, setFilterCat] = useState<'all' | FoodCategory>('all');
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);

  const activeDonations = donations.filter(d => {
    if (d.status !== 'available') return false;
    if (filterCat !== 'all' && d.category !== filterCat) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = donations.length > 0
        ? [donations[0].latitude, donations[0].longitude]
        : [18.5204, 73.8567];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever filtered donations change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds: [number, number][] = [];

    activeDonations.forEach(donation => {
      if (!donation.latitude || !donation.longitude) return;

      const latLng: [number, number] = [donation.latitude, donation.longitude];
      bounds.push(latLng);

      const marker = L.marker(latLng, {
        icon: createFoodMapMarkerIcon(donation.category)
      });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 200px; padding: 2px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 13px;">${donation.foodName}</div>
          <div style="color: #059669; font-weight: 700; margin-bottom: 4px;">🍽️ ${donation.servings} Servings (${donation.category === 'vegetarian' ? 'Veg' : 'Non-Veg'})</div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 2px;"><strong>Pickup:</strong> ${donation.pickupAddress}, ${donation.city}</div>
          ${donation.landmark ? `<div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">📍 Near ${donation.landmark}</div>` : ''}
          <div style="color: #dc2626; font-size: 11px; font-weight: 600; margin-bottom: 4px;">Deadline: ${formatLocalDateTime(donation.pickupDeadline)}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedDonation(donation);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    if (bounds.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [activeDonations.length, filterCat]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">
            City Pickup Map ({activeDonations.length} Active Food Pickups)
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Category:</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-0.5">
            <button
              onClick={() => setFilterCat('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                filterCat === 'all' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({donations.filter(d => d.status === 'available').length})
            </button>
            <button
              onClick={() => setFilterCat('vegetarian')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors flex items-center gap-1 ${
                filterCat === 'vegetarian' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Veg
            </button>
            <button
              onClick={() => setFilterCat('non-vegetarian')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors flex items-center gap-1 ${
                filterCat === 'non-vegetarian' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span> Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Split Map View & Selected Pin Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Leaflet Map Viewport */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-300 shadow bg-slate-100">
          <div
            ref={mapContainerRef}
            className="w-full h-[480px] z-0"
            style={{ minHeight: '420px' }}
          />

          {/* Map legend */}
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 text-[11px] block">Map Legend:</span>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span>Vegetarian Pickup</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
              <span>Non-Vegetarian Pickup</span>
            </div>
          </div>
        </div>

        {/* Selected Donation or List of Markers */}
        <div className="space-y-3">
          {selectedDonation ? (
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-md space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Selected Location
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDonation(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear Selection
                </button>
              </div>

              <div className="h-32 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={selectedDonation.imageUrl}
                  alt={selectedDonation.foodName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedDonation.foodName}</h3>
                <p className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5" />
                  {selectedDonation.servings} Servings Available
                </p>
                <p className="text-slate-600 text-xs flex items-start gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedDonation.pickupAddress}, {selectedDonation.city}</span>
                </p>
                {selectedDonation.landmark && (
                  <p className="text-slate-500 text-[11px] pl-5">Near {selectedDonation.landmark}</p>
                )}
                <p className="text-red-700 font-semibold text-xs flex items-center gap-1 mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  Deadline: {formatLocalDateTime(selectedDonation.pickupDeadline)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectDonation(selectedDonation)}
                  className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                >
                  View Details
                </button>
                {onClaimDonation && (
                  <button
                    type="button"
                    onClick={() => onClaimDonation(selectedDonation)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors text-center"
                  >
                    Claim Food
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Available Food Pins ({activeDonations.length})
              </h3>
              <p className="text-xs text-slate-500">
                Click any marker on the map or select a listing below to focus on its pickup location:
              </p>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {activeDonations.map(donation => (
                  <button
                    key={donation.id}
                    type="button"
                    onClick={() => {
                      setSelectedDonation(donation);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([donation.latitude, donation.longitude], 15);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-center gap-3"
                  >
                    <img
                      src={donation.imageUrl}
                      alt={donation.foodName}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{donation.foodName}</h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">{donation.servings} Servings</p>
                      <p className="text-[10px] text-slate-500 truncate">{donation.city} - {donation.pickupAddress}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
