import React from 'react';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const NotFound: React.FC = () => {
  const { navigate } = useNavigation();
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-5 animate-fade-in">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
        <UtensilsCrossed className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-700">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          The page or food listing you are looking for does not exist or has been moved.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Claim Food</span>
      </button>
    </div>
  );
};
