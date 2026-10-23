import React from 'react';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { CheckCircle2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenVerifyTokenModal: () => void;
  onOpenSafetyModal: () => void;
  onOpenApiModal: () => void;
  toastMessage?: string | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenVerifyTokenModal,
  onOpenSafetyModal,
  onOpenApiModal,
  toastMessage
}) => {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={onOpenNotifications}
        onOpenVerifyTokenModal={onOpenVerifyTokenModal}
        onOpenSafetyModal={onOpenSafetyModal}
        onOpenApiModal={onOpenApiModal}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-fade-in max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer
        onOpenSafetyModal={onOpenSafetyModal}
        onOpenApiModal={onOpenApiModal}
      />
    </div>
  );
};
