import React from 'react';
import { Utensils } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
          <Utensils className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">{message}</p>
    </div>
  );
};
