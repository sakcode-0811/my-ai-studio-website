import React, { useState } from 'react';
import { X, Code2, Play, CheckCircle2, Copy } from 'lucide-react';
import { FoodDonation } from '../types/donation.ts';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  donations: FoodDonation[];
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({
  isOpen,
  onClose,
  donations
}) => {
  const [activeEndpoint, setActiveEndpoint] = useState<'list' | 'detail' | 'safety' | 'create'>('list');
  const [responseJson, setResponseJson] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleDonation = donations[0];

  const handleTestEndpoint = (endpoint: 'list' | 'detail' | 'safety' | 'create') => {
    setActiveEndpoint(endpoint);

    if (endpoint === 'list') {
      const data = {
        status: 200,
        total: donations.length,
        filterApplied: 'status=available',
        data: donations.map(d => ({
          id: d.id,
          foodName: d.foodName,
          servings: d.servings,
          prepDate: d.prepDate,
          prepTime: d.prepTime,
          pickupDeadline: d.pickupDeadline,
          pickupLocation: {
            address: d.pickupAddress,
            city: d.city,
            landmark: d.landmark,
            coordinates: { latitude: d.latitude, longitude: d.longitude }
          },
          category: d.category,
          storageCondition: d.storageCondition,
          status: d.status,
          safetyRating: d.safetyRating
        }))
      };
      setResponseJson(JSON.stringify(data, null, 2));
    } else if (endpoint === 'detail') {
      const data = {
        status: 200,
        data: sampleDonation || {}
      };
      setResponseJson(JSON.stringify(data, null, 2));
    } else if (endpoint === 'safety') {
      const data = {
        status: 200,
        standards: 'FDA & FSSAI 2hr/4hr Perishable Guidelines',
        rules: [
          { category: 'non-vegetarian', storage: 'room_temperature', maxSafeHours: 3.0, warningHours: 1.5 },
          { category: 'non-vegetarian', storage: 'refrigerated', maxSafeHours: 24.0, warningHours: 18.0 },
          { category: 'vegetarian', storage: 'room_temperature', maxSafeHours: 5.0, warningHours: 3.0 },
          { category: 'vegetarian', storage: 'refrigerated', maxSafeHours: 48.0, warningHours: 36.0 }
        ]
      };
      setResponseJson(JSON.stringify(data, null, 2));
    } else if (endpoint === 'create') {
      const data = {
        method: 'POST',
        endpoint: '/api/donations',
        requiredFields: [
          'foodName',
          'servings',
          'prepDate',
          'prepTime',
          'pickupDeadline',
          'pickupAddress',
          'city',
          'latitude',
          'longitude',
          'category',
          'contactName',
          'contactPhone'
        ],
        sampleSuccessResponse: {
          success: true,
          donationId: 'donation_1729600000_abc12',
          message: 'Donation published and coordinates mapped to Leaflet engine.',
          safetyRating: 'fresh'
        }
      };
      setResponseJson(JSON.stringify(data, null, 2));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Backend API Endpoints Explorer</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            The platform exposes clean REST endpoints providing identical data shapes to the frontend dashboards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleTestEndpoint('list')}
              className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                activeEndpoint === 'list'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">GET</span>
              /api/donations
            </button>

            <button
              onClick={() => handleTestEndpoint('detail')}
              className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                activeEndpoint === 'detail'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">GET</span>
              /api/donations/:id
            </button>

            <button
              onClick={() => handleTestEndpoint('create')}
              className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                activeEndpoint === 'create'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-indigo-600 block">POST</span>
              /api/donations
            </button>

            <button
              onClick={() => handleTestEndpoint('safety')}
              className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                activeEndpoint === 'safety'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">GET</span>
              /api/safety-rules
            </button>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono">
              <span>Response Payload (JSON)</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="hover:text-white flex items-center gap-1 text-[11px]"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs rounded-b-xl overflow-x-auto max-h-[300px] border-t border-slate-800">
              {responseJson || 'Click one of the endpoints above to test and view live responses.'}
            </pre>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
