import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Calendar,
  Users,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { DonationFormData, FoodCategory, StorageCondition, PackagingType } from '../types/donation.ts';
import { evaluateFoodSafety, findMatchingRule } from '../services/safetyService.ts';
import { LocationPickerMap } from '../components/LocationPickerMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigation } from '../context/NavigationContext.tsx';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';

interface UploadFoodProps {
  onCreateDonation: (data: DonationFormData) => Promise<void>;
}

export const UploadFood: React.FC<UploadFoodProps> = ({ onCreateDonation }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { navigate } = useNavigation();

  // Helper date generators
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const threeHoursLater = new Date(now.getTime() + 180 * 60 * 1000);
  const sixHoursLater = new Date(now.getTime() + 360 * 60 * 1000);

  const defaultDateStr = oneHourAgo.toISOString().slice(0, 10);
  const defaultTimeStr = oneHourAgo.toTimeString().slice(0, 5);

  const defaultDeadlineDateStr = threeHoursLater.toISOString().slice(0, 10);
  const defaultDeadlineTimeStr = threeHoursLater.toTimeString().slice(0, 5);

  const defaultExpiryDateStr = sixHoursLater.toISOString().slice(0, 10);
  const defaultExpiryTimeStr = sixHoursLater.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState<DonationFormData>({
    foodName: '',
    servings: 20,
    prepDate: defaultDateStr,
    prepTime: defaultTimeStr,
    expiryDate: defaultExpiryDateStr,
    expiryTime: defaultExpiryTimeStr,
    pickupDeadlineDate: defaultDeadlineDateStr,
    pickupDeadlineTime: defaultDeadlineTimeStr,
    pickupAddress: 'FC Road, Shivaji Nagar',
    city: user?.city || 'Pune',
    landmark: 'Near Deccan Gymkhana',
    latitude: 18.5204,
    longitude: 73.8567,
    category: 'vegetarian',
    storageCondition: 'heated_insulated',
    packagingType: 'sealed_containers',
    dietaryTags: ['Vegetarian'],
    description: '',
    ingredients: '',
    allergens: '',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    contactName: user?.name || 'Chef Rajesh Sharma',
    contactPhone: user?.phone || '+91 98230 45678',
    contactAltPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time safety validation
  const deadlineIso = `${formData.pickupDeadlineDate}T${formData.pickupDeadlineTime || '00:00'}:00`;
  const expiryIso = `${formData.expiryDate}T${formData.expiryTime || '00:00'}:00`;
  const safetyEvaluation = evaluateFoodSafety(
    formData.category,
    formData.storageCondition,
    formData.prepDate,
    formData.prepTime,
    deadlineIso,
    expiryIso
  );

  const isSafe = safetyEvaluation.rating === 'fresh' || safetyEvaluation.rating === 'warning';

  const handleChange = (field: keyof DonationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Required food name
    if (!formData.foodName.trim()) {
      setError('Please provide the food name (e.g., Royal Veg Biryani).');
      return;
    }

    // Validation 2: Servings must be positive whole number
    const servingsNum = Number(formData.servings);
    if (!formData.servings || isNaN(servingsNum) || servingsNum <= 0 || !Number.isInteger(servingsNum)) {
      setError('Food servings must be a positive whole number (e.g. 25).');
      return;
    }

    // Validation 3: Safety validation
    if (!isSafe) {
      setError(safetyEvaluation.warnings[0] || 'Food does not meet safe distribution criteria.');
      return;
    }

    // Validation 4: Pickup address & contact
    if (!formData.pickupAddress.trim() || !formData.contactPhone.trim()) {
      setError('Pickup address and contact phone number are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateDonation(formData);
      navigate('/profile', { state: { activeTab: 'donations' } });
    } catch (err: any) {
      setError(err.message || 'Failed to publish donation.');
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute fallbackPath="/register">
      <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xl space-y-8">
          {/* Header */}
          <div className="space-y-2 border-b border-stone-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{t('upload.title')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Share Quality Surplus Food
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              {t('upload.subtitle')}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Food Name & Servings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.foodNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.foodName}
                  onChange={(e) => handleChange('foodName', e.target.value)}
                  placeholder={t('upload.foodNamePlaceholder')}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.servingsLabel')}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={formData.servings}
                  onChange={(e) => handleChange('servings', parseInt(e.target.value) || 1)}
                  placeholder="25"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                />
              </div>
            </div>

            {/* 2. Category & Packaging Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.categoryLabel')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as FoodCategory)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="vegetarian">🟢 {t('upload.categoryVeg')}</option>
                  <option value="non-vegetarian">🔴 {t('upload.categoryNonVeg')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Storage Condition *
                </label>
                <select
                  value={formData.storageCondition}
                  onChange={(e) => handleChange('storageCondition', e.target.value as StorageCondition)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="heated_insulated">🔥 Heated / Insulated Carrier</option>
                  <option value="refrigerated">❄️ Refrigerated / Chilled</option>
                  <option value="room_temperature">🌡️ Room Temperature</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Packaging Type *
                </label>
                <select
                  value={formData.packagingType}
                  onChange={(e) => handleChange('packagingType', e.target.value as PackagingType)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="sealed_containers">Sealed Plastic Containers</option>
                  <option value="boxed_meals">Individual Boxed Meals</option>
                  <option value="foil_wrapped">Foil Wrapped Packs</option>
                  <option value="casserole_carrier">Thermal Casserole Carrier</option>
                  <option value="loose_catering_pans">Large Catering Trays / Pans</option>
                </select>
              </div>
            </div>

            {/* 3. Prep Date/Time & Required Expiry Date/Time */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-wider">
                  Preparation & Food Expiry Timestamps (Required)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Prep Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    {t('upload.prepDateLabel')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.prepDate}
                    onChange={(e) => handleChange('prepDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Prep Time */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    {t('upload.prepTimeLabel')}
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.prepTime}
                    onChange={(e) => handleChange('prepTime', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-900">
                    {t('upload.expiryDateLabel')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Expiry Time */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-amber-900">
                    {t('upload.expiryTimeLabel')}
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.expiryTime}
                    onChange={(e) => handleChange('expiryTime', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Pickup Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/50">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-red-900">
                    Pickup Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.pickupDeadlineDate}
                    onChange={(e) => handleChange('pickupDeadlineDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-red-900">
                    Pickup Deadline Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.pickupDeadlineTime}
                    onChange={(e) => handleChange('pickupDeadlineTime', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-red-950"
                  />
                </div>
              </div>

              {/* Real-time Safety Indicator */}
              <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                isSafe
                  ? safetyEvaluation.rating === 'warning'
                    ? 'bg-amber-100/70 border-amber-300 text-amber-900'
                    : 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                  : 'bg-red-100/70 border-red-300 text-red-900'
              }`}>
                <div className="flex items-center gap-2">
                  {isSafe ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                  )}
                  <span className="font-semibold">
                    {safetyEvaluation.warnings[0] || safetyEvaluation.recommendation}
                  </span>
                </div>
                <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                  {safetyEvaluation.rating}
                </span>
              </div>
            </div>

            {/* 4. Description & Ingredients */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.descLabel')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('upload.descPlaceholder')}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    {t('upload.ingredientsLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.ingredients || ''}
                    onChange={(e) => handleChange('ingredients', e.target.value)}
                    placeholder={t('upload.ingredientsPlaceholder')}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    {t('upload.allergensLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.allergens || ''}
                    onChange={(e) => handleChange('allergens', e.target.value)}
                    placeholder={t('upload.allergensPlaceholder')}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 5. Food Image Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                Food Image *
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { name: 'Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Roti / Chapati & Curry', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Sandwich / Snacks', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
                  { name: 'Mixed Meals / Dal', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleChange('imageUrl', preset.url)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      formData.imageUrl === preset.url
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="Or paste custom image URL..."
                className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-700"
              />
            </div>

            {/* 6. Pickup Address, City & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.cityLabel')}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800"
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Thane">Thane</option>
                  <option value="Aurangabad">Chhatrapati Sambhajinagar</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.pickupAddressLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.pickupAddress}
                  onChange={(e) => handleChange('pickupAddress', e.target.value)}
                  placeholder={t('upload.pickupAddressPlaceholder')}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            {/* 7. Interactive Leaflet Location Map Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{t('upload.pinLocationLabel')}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              </label>
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(coords) => setFormData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }))}
                pickupAddress={formData.pickupAddress}
                city={formData.city}
              />
            </div>

            {/* 8. Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.contactNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  {t('upload.contactPhoneLabel')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                {t('upload.cancelBtn')}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isSafe}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Publishing food listing...</span>
                ) : (
                  <>
                    <span>{t('upload.submitBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};
