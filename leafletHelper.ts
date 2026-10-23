import L from 'leaflet';
import { FoodCategory } from '../types/donation.ts';

export function createFoodMapMarkerIcon(category: FoodCategory, isSelected: boolean = false): L.DivIcon {
  const isVeg = category === 'vegetarian';
  const bgColor = isSelected ? '#4f46e5' : isVeg ? '#16a34a' : '#dc2626';
  const symbol = isVeg ? '🟢' : '🔴';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: white;
      border: 3px solid ${bgColor};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      <div style="
        transform: rotate(45deg);
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-food-marker',
    html,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36]
  });
}

export function createLocationPickerIcon(): L.DivIcon {
  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: #4f46e5;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.45);
      animation: bounce 1.5s infinite;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">
        📍
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'picker-marker-icon',
    html,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40]
  });
}
