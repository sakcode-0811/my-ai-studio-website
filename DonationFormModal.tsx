import React, { useState, useId } from 'react';
import {
  X,
  Upload,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Flame,
  Snowflake,
  PackageCheck,
  Sparkles,
  Phone,
  User,
  MapPin,
  Utensils
} from 'lucide-react';
import { DonationFormData, FoodCategory, StorageCondition, PackagingType } from '../types/donation.ts';
import { evaluateFoodSafety, findMatchingRule } from '../services/safetyService.ts';
import { LocationPickerMap } from './LocationPickerMap.tsx';

interface DonationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DonationFormData) => Promise<void>;
  currentUserName?: string;
  currentUserEmail?: string;
}

const SAMPLE_PHOTO_PRESETS = [
  { name: 'Veg Biryani', category: 'vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chapatis & Curry', category: 'vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80' },
  { name: 'Steamed Rice & Dal', category: 'vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Veg Sandwiches', category: 'vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chicken Biryani', category: 'non-vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mixed Catering Trays', category: 'vegetarian' as FoodCategory, url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80' }
];

export const DonationFormModal: React.FC<DonationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserName,
  currentUserEmail
}) => {
  const fileInputId = useId();
  // Set default prep time to 1 hour ago, deadline 3 hours from now
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
    servings: 25,
    prepDate: defaultDateStr,
    prepTime: defaultTimeStr,
    expiryDate: defaultExpiryDateStr,
    expiryTime: defaultExpiryTimeStr,
    pickupDeadlineDate: defaultDeadlineDateStr,
    pickupDeadlineTime: defaultDeadlineTimeStr,
    pickupAddress: '',
    city: 'Pune',
    landmark: '',
    latitude: 18.5204,
    longitude: 73.8567,
    category: 'vegetarian',
    description: '',
    ingredients: '',
    allergens: '',
    packagingType: 'sealed_containers',
    storageCondition: 'room_temperature',
    dietaryTags: ['Vegetarian'],
    imageUrl: SAMPLE_PHOTO_PRESETS[0].url,
    contactName: currentUserName || 'Pradeep Patil',
    contactPhone: '+91 98220 54321',
    contactAltPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(SAMPLE_PHOTO_PRESETS[0].url);

  if (!isOpen) return null;

  // Real-time safety calculation
  const deadlineIso = `${formData.pickupDeadlineDate}T${formData.pickupDeadlineTime || '00:00'}:00`;
  const expiryIso = `${formData.expiryDate}T${formData.expiryTime || '00:00'}:00`;
  const safetyEval = evaluateFoodSafety(
    formData.category,
    formData.storageCondition,
    formData.prepDate,
    formData.prepTime,
    deadlineIso,
    expiryIso
  );
  const activeRule = findMatchingRule(formData.category, formData.storageCondition);

  // Validate entire form against required rules
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Food Name
    if (!formData.foodName.trim()) {
      errs.foodName = 'Food name is required (e.g. Veg Biryani, Chapati, Rice, Sandwich).';
    } else if (formData.foodName.trim().length < 2) {
      errs.foodName = 'Food name must be at least 2 characters.';
    }

    // 2. Servings: positive whole number
    const servingsNum = Number(formData.servings);
    if (!formData.servings || isNaN(servingsNum) || servingsNum <= 0 || !Number.isInteger(servingsNum)) {
      errs.servings = 'Food servings must be a positive whole number (e.g., 25).';
    }

    // 3. Prep Date & 4. Prep Time
    if (!formData.prepDate) {
      errs.prepDate = 'Date of food preparation is required.';
    }
    if (!formData.prepTime) {
      errs.prepTime = 'Time of food preparation is required.';
    }

    const currentTime = new Date();
    let prepDateTime: Date | null = null;
    let expiryDateTime: Date | null = null;
    let deadlineDateTime: Date | null = null;

    if (formData.prepDate && formData.prepTime) {
      prepDateTime = new Date(`${formData.prepDate}T${formData.prepTime}:00`);
      if (prepDateTime.getTime() > currentTime.getTime() + 60000) {
        errs.prepTime = 'Preparation date and time cannot be in the future.';
      }
    }

    // 6 & 7. Food Expiry Date & Time (Required)
    if (!formData.expiryDate) {
      errs.expiryDate = 'Food expiry date is required.';
    }
    if (!formData.expiryTime) {
      errs.expiryTime = 'Food expiry time is required.';
    }

    if (formData.expiryDate && formData.expiryTime) {
      expiryDateTime = new Date(`${formData.expiryDate}T${formData.expiryTime}:00`);
      if (expiryDateTime.getTime() <= currentTime.getTime()) {
        errs.expiryTime = 'Cannot publish already-expired food. Expiry must be in the future.';
      } else if (prepDateTime && expiryDateTime.getTime() <= prepDateTime.getTime()) {
        errs.expiryTime = 'Expiry date and time must be later than the preparation date and time.';
      }
    }

    // 10. Pickup Deadline: must be later than preparation time, AND cannot be later than food expiry time
    if (!formData.pickupDeadlineDate) {
      errs.pickupDeadlineDate = 'Pickup deadline date is required.';
    }
    if (!formData.pickupDeadlineTime) {
      errs.pickupDeadlineTime = 'Pickup deadline time is required.';
    }

    if (formData.pickupDeadlineDate && formData.pickupDeadlineTime) {
      deadlineDateTime = new Date(`${formData.pickupDeadlineDate}T${formData.pickupDeadlineTime}:00`);
      if (prepDateTime && deadlineDateTime.getTime() <= prepDateTime.getTime()) {
        errs.pickupDeadlineTime = 'Pickup deadline must be later than the preparation time.';
      }
      if (expiryDateTime && deadlineDateTime.getTime() > expiryDateTime.getTime()) {
        errs.pickupDeadlineTime = 'Pickup deadline must not be later than the food expiry time.';
      }
    }

    // 5. Pickup Location
    if (!formData.pickupAddress.trim()) {
      errs.pickupAddress = 'Full pickup street address is required.';
    }
    if (!formData.city.trim()) {
      errs.city = 'City is required.';
    }

    // 6. Map coordinates
    if (!formData.latitude || !formData.longitude) {
      errs.map = 'Please select a pickup pin on the interactive map.';
    }

    // 11. Contact Details
    if (!formData.contactName.trim()) {
      errs.contactName = 'Contact person name is required.';
    }
    if (!formData.contactPhone.trim()) {
      errs.contactPhone = 'Phone number is required for coordinating pickup.';
    } else if (formData.contactPhone.trim().length < 8) {
      errs.contactPhone = 'Please enter a valid phone number with area/country code.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image file size should be under 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (preset: typeof SAMPLE_PHOTO_PRESETS[0]) => {
    setImagePreview(preset.url);
    setFormData(prev => ({
      ...prev,
      imageUrl: preset.url,
      foodName: prev.foodName ? prev.foodName : preset.name,
      category: preset.category
    }));
  };

  const handleQuickFoodSelect = (name: string, category: FoodCategory) => {
    setFormData(prev => ({ ...prev, foodName: name, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top of modal to see errors
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      alert('Error submitting donation: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-300" />
              Upload Surplus Food Donation
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Fill in all 11 required fields. Every submission runs through the configurable food safety evaluation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick preset food name buttons */}
          <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl">
            <span className="text-xs font-semibold text-emerald-900 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick fill popular food items:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Veg Biryani', cat: 'vegetarian' as FoodCategory },
                { name: 'Fresh Chapati', cat: 'vegetarian' as FoodCategory },
                { name: 'Steamed Rice & Dal', cat: 'vegetarian' as FoodCategory },
                { name: 'Grilled Sandwich', cat: 'vegetarian' as FoodCategory },
                { name: 'Paneer Butter Masala', cat: 'vegetarian' as FoodCategory },
                { name: 'Chicken Biryani', cat: 'non-vegetarian' as FoodCategory }
              ].map(f => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => handleQuickFoodSelect(f.name, f.cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    formData.foodName === f.name
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-500'
                  }`}
                >
                  {f.cat === 'vegetarian' ? '🟢' : '🔴'} {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Food Basics (Fields 1, 2, 8) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Food Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                1. Food Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.foodName}
                onChange={e => setFormData({ ...formData, foodName: e.target.value })}
                placeholder="e.g. Veg Biryani, Chapati, Rice, or Sandwich"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg border ${
                  errors.foodName ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-emerald-500'
                } focus:ring-2 focus:ring-emerald-200 outline-none`}
              />
              {errors.foodName && <p className="text-xs text-red-600 mt-1">{errors.foodName}</p>}
            </div>

            {/* 2. Food Servings */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                2. Servings (People) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.servings}
                  onChange={e => setFormData({ ...formData, servings: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 25"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border ${
                    errors.servings ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-emerald-500'
                  } focus:ring-2 focus:ring-emerald-200 outline-none`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">servings</span>
              </div>
              {errors.servings && <p className="text-xs text-red-600 mt-1">{errors.servings}</p>}
            </div>
          </div>

          {/* 8. Food Category & Storage Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                8. Food Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'vegetarian' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    formData.category === 'vegetarian'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-emerald-400 border border-white inline-block"></span>
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'non-vegetarian' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    formData.category === 'non-vegetarian'
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-red-400'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-400 border border-white inline-block"></span>
                  Non-Vegetarian
                </button>
              </div>
            </div>

            {/* Storage Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>Storage / Holding Method</span>
                <span className="text-[11px] font-normal text-slate-500">Affects safe hours</span>
              </label>
              <select
                value={formData.storageCondition}
                onChange={e => setFormData({ ...formData, storageCondition: e.target.value as StorageCondition })}
                className="w-full px-3 py-2 text-xs font-medium bg-white rounded-lg border border-slate-300 focus:border-emerald-500 outline-none"
              >
                <option value="room_temperature">Room Temperature (Ambient)</option>
                <option value="refrigerated">Refrigerated Chilled (&lt; 4°C)</option>
                <option value="heated_insulated">Hot Holding / Thermal Insulated (&gt; 60°C)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Preparation, Expiry & Pickup Timestamps */}
          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 3 & 4. Prep Date & Time */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  3 & 4. Preparation Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.prepDate}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={e => setFormData({ ...formData, prepDate: e.target.value })}
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                        errors.prepDate ? 'border-red-500' : 'border-slate-300'
                      } outline-none focus:border-indigo-500`}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.prepTime}
                      onChange={e => setFormData({ ...formData, prepTime: e.target.value })}
                      className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                        errors.prepTime ? 'border-red-500' : 'border-slate-300'
                      } outline-none focus:border-indigo-500`}
                    />
                  </div>
                </div>
                {(errors.prepDate || errors.prepTime) && (
                  <p className="text-xs text-red-600 mt-1">{errors.prepDate || errors.prepTime}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Cannot be in future.
                </p>
              </div>

              {/* 6 & 7. Food Expiry Date & Time (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>6 & 7. Food Expiry Time <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Strict Expiry</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.expiryDate}
                    min={formData.prepDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                      errors.expiryDate ? 'border-red-500' : 'border-slate-300'
                    } outline-none focus:border-indigo-500`}
                  />
                  <input
                    type="time"
                    value={formData.expiryTime}
                    onChange={e => setFormData({ ...formData, expiryTime: e.target.value })}
                    className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                      errors.expiryTime ? 'border-red-500' : 'border-slate-300'
                    } outline-none focus:border-indigo-500`}
                  />
                </div>
                {(errors.expiryDate || errors.expiryTime) && (
                  <p className="text-xs text-red-600 mt-1">{errors.expiryDate || errors.expiryTime}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be later than prep time.
                </p>
              </div>

              {/* 12. Pickup Deadline */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  12. Pickup Deadline <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={formData.pickupDeadlineDate}
                    min={formData.prepDate}
                    max={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, pickupDeadlineDate: e.target.value })}
                    className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                      errors.pickupDeadlineDate ? 'border-red-500' : 'border-slate-300'
                    } outline-none focus:border-indigo-500`}
                  />
                  <input
                    type="time"
                    value={formData.pickupDeadlineTime}
                    onChange={e => setFormData({ ...formData, pickupDeadlineTime: e.target.value })}
                    className={`w-full px-2.5 py-2 text-xs rounded-lg border bg-white ${
                      errors.pickupDeadlineTime ? 'border-red-500' : 'border-slate-300'
                    } outline-none focus:border-indigo-500`}
                  />
                </div>
                {(errors.pickupDeadlineDate || errors.pickupDeadlineTime) && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.pickupDeadlineDate || errors.pickupDeadlineTime}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Must not exceed expiry time.
                </p>
              </div>
            </div>

            {/* LIVE SAFETY EVALUATION WARNING BOX */}
            <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
              safetyEval.rating === 'fresh'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : safetyEval.rating === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}>
              {safetyEval.rating === 'fresh' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {safetyEval.rating === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              {safetyEval.rating === 'expired' && <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}

              <div className="space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span>Food Safety Analysis ({activeRule.title}):</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                    safetyEval.rating === 'fresh' ? 'bg-emerald-200 text-emerald-800' :
                    safetyEval.rating === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {safetyEval.rating.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-700">
                  {safetyEval.recommendation} (Shelf-life limit: {activeRule.maxSafeHours} hours).
                </p>
                {safetyEval.warnings.length > 0 && (
                  <ul className="list-disc list-inside text-red-700 font-medium space-y-0.5 pt-1">
                    {safetyEval.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Pickup Location & Map (Fields 5, 6) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              5 & 6. Pickup Location & Interactive Leaflet Map
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Pickup Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pickupAddress}
                  onChange={e => setFormData({ ...formData, pickupAddress: e.target.value })}
                  placeholder="Building name, street, locality (e.g. 42 Orchid Heights, Central Ave)"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.pickupAddress ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  } outline-none focus:border-emerald-500`}
                />
                {errors.pickupAddress && <p className="text-xs text-red-600 mt-1">{errors.pickupAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
                {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Landmark / Gate Instructions
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="e.g. Near Gate 3 / Behind Westend Mall / Opposite Metro Station"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
              />
            </div>

            {/* 6. Leaflet Map Component */}
            <LocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={coords => setFormData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }))}
              pickupAddress={formData.pickupAddress}
              city={formData.city}
            />
          </div>

          {/* Section 4: Food Description, Packaging, Ingredients & Allergens */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Food Description & Context
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe food contents, packaging style, or preparation context (e.g., surplus from wedding catering, freshly steamed, unconsumed)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Packaging Type
                </label>
                <select
                  value={formData.packagingType}
                  onChange={e => setFormData({ ...formData, packagingType: e.target.value as PackagingType })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="sealed_containers">Hygienic Sealed Containers</option>
                  <option value="boxed_meals">Boxed Individual Meals</option>
                  <option value="foil_wrapped">Foil Wrapped Packs</option>
                  <option value="casserole_carrier">Thermal Casserole / Chafing Pan</option>
                  <option value="biodegradable_pack">Biodegradable Eco-Pack</option>
                  <option value="loose_catering_pans">Large Catering Trays</option>
                </select>
              </div>
            </div>

            {/* 13. Optional Ingredients & Allergen Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  13. Key Ingredients (Optional)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g. Basmati rice, paneer, peas, ghee, whole spices"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Allergen Information (Optional)
                </label>
                <input
                  type="text"
                  value={formData.allergens}
                  onChange={e => setFormData({ ...formData, allergens: e.target.value })}
                  placeholder="e.g. Contains Dairy (paneer/ghee). Nut-free, Gluten-free."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Food Image Upload & Presets (Field 9) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              9. Food Image (Upload or Pick Sample)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              {/* Image preview box */}
              <div className="sm:col-span-1 rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-100 relative group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                    <Utensils className="w-8 h-8 mb-1" />
                    No image selected
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="sm:col-span-3 space-y-2">
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={fileInputId}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload from Device
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <span className="text-xs text-slate-500">Supports JPG, PNG, WEBP (&lt; 4MB)</span>
                </div>

                {/* Preset thumbnails */}
                <div>
                  <span className="text-[11px] text-slate-600 block mb-1">Or choose photo preset:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className={`h-12 rounded-lg overflow-hidden border-2 transition-all relative ${
                          imagePreview === p.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white truncate px-1 py-0.5">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Contact Details (Field 11) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              11. Contact Details for Pickup Coordination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. Chef Rajesh / Sunita"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.contactName ? 'border-red-500' : 'border-slate-300'
                  } outline-none focus:border-emerald-500`}
                />
                {errors.contactName && <p className="text-xs text-red-600 mt-1">{errors.contactName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="e.g. +91 98230 45678"
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.contactPhone ? 'border-red-500' : 'border-slate-300'
                  } outline-none focus:border-emerald-500`}
                />
                {errors.contactPhone && <p className="text-xs text-red-600 mt-1">{errors.contactPhone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alternate Phone / Notes
                </label>
                <input
                  type="text"
                  value={formData.contactAltPhone}
                  onChange={e => setFormData({ ...formData, contactAltPhone: e.target.value })}
                  placeholder="e.g. Reception Ext 104"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Saving & Verifying...</>
              ) : (
                <>Publish Food Donation</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
