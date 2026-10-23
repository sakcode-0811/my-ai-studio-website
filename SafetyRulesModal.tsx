import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, RotateCcw, Save, Info } from 'lucide-react';
import { FoodSafetyRule } from '../types/donation.ts';
import { getSafetyRules, saveSafetyRules, resetSafetyRulesToDefault } from '../services/safetyService.ts';

interface SafetyRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesUpdated: () => void;
}

export const SafetyRulesModal: React.FC<SafetyRulesModalProps> = ({
  isOpen,
  onClose,
  onRulesUpdated
}) => {
  const [rules, setRules] = useState<FoodSafetyRule[]>(getSafetyRules());
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: 'warningHours' | 'maxSafeHours', value: number) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0.5, value)
    };
    setRules(updated);
  };

  const handleSave = () => {
    saveSafetyRules(rules);
    setIsSavedNotice(true);
    onRulesUpdated();
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    const defaults = resetSafetyRulesToDefault();
    setRules(defaults);
    onRulesUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Configurable Food Safety Thresholds
            </h2>
            <p className="text-xs text-slate-300">
              Customize shelf-life limits & warning triggers based on food category and storage method.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Food safety rules dynamically evaluate preparation timestamps and holding conditions. Donors receive real-time warnings if cooked food approaches or exceeds these safety parameters.
            </span>
          </div>

          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.guidelineDescription}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rule.category === 'vegetarian' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Show Warning After (Hours):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="72"
                      value={rule.warningHours}
                      onChange={e => handleFieldChange(idx, 'warningHours', parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Strict Expiry Limit (Max Safe Hours):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="120"
                      value={rule.maxSafeHours}
                      onChange={e => handleFieldChange(idx, 'maxSafeHours', parseFloat(e.target.value) || 2)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to FDA Standards
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSavedNotice ? 'Saved!' : 'Save Safety Rules'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
