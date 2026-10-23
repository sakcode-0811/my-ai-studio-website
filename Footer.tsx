import React from 'react';
import { ShieldCheck, Code2, UtensilsCrossed, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FooterProps {
  onOpenSafetyModal: () => void;
  onOpenApiModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSafetyModal, onOpenApiModal }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-stone-50 border-t border-stone-200 mt-16 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-200">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                  {t('nav.brandName')}
                </span>
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {t('nav.badge')}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t('nav.safetyRules')} & Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={onOpenSafetyModal}
                  className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  {t('nav.safetyRules')} (FDA & FSSAI Standards)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenApiModal}
                  className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  {t('nav.apiExplorer')}
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-500">
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>Languages: English, हिन्दी, मराठी</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Safe Food Donation Pledge */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Community Food Safety
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every food listing on Annapurna requires preparation and expiry timestamps with token verification at handover to protect recipient health.
            </p>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Annapurna Food Network. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Map data &copy; OpenStreetMap Contributors</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">Zero Waste, Zero Hunger</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
