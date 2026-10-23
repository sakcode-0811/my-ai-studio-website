import React from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { FoodCategory } from '../types/donation.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FoodFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: 'all' | FoodCategory;
  onCategoryChange: (value: 'all' | FoodCategory) => void;
  cityFilter: string;
  onCityChange: (value: string) => void;
  availableCities: string[];
  registeredCity?: string;
  onResetFilters: () => void;
}

export const FoodFilters: React.FC<FoodFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  cityFilter,
  onCityChange,
  availableCities,
  registeredCity,
  onResetFilters
}) => {
  const { t } = useLanguage();

  const isFiltered = searchTerm !== '' || categoryFilter !== 'all' || (cityFilter !== 'all' && cityFilter !== registeredCity);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="sm:w-56 relative">
          <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">📍 {t('home.allCities')}</option>
            {registeredCity && (
              <option value={registeredCity}>
                ⭐ {registeredCity} (My Registered City)
              </option>
            )}
            {availableCities
              .filter(c => c !== registeredCity)
              .map((city) => (
                <option key={city} value={city}>
                  📍 {city}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Category Pills & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
          >
            {t('home.allCategories')}
          </button>
          <button
            type="button"
            onClick={() => onCategoryChange('vegetarian')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              categoryFilter === 'vegetarian'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
            {t('home.vegOnly')}
          </button>
          <button
            type="button"
            onClick={() => onCategoryChange('non-vegetarian')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              categoryFilter === 'non-vegetarian'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 border border-white"></span>
            {t('home.nonVeg')}
          </button>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('home.clearFilters')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
