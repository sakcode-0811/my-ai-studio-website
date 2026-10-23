import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { AppNotification } from '../types/donation.ts';
import { formatLocalDateTime } from '../services/safetyService.ts';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenTokenVerification?: (token: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenTokenVerification
}) => {
  const [tab, setTab] = useState<'unread' | 'read' | 'all'>('unread');

  if (!isOpen) return null;

  const unreadList = notifications.filter(n => !n.isRead);
  const readList = notifications.filter(n => n.isRead);

  const displayedList = tab === 'unread' ? unreadList : tab === 'read' ? readList : notifications;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[85vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-emerald-400" />
              {unreadList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
              )}
            </div>
            <h2 className="text-base font-bold">
              Notifications ({unreadList.length} Unread)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls and Actions */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setTab('unread')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                tab === 'unread' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({unreadList.length})
            </button>
            <button
              onClick={() => setTab('read')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                tab === 'read' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Read ({readList.length})
            </button>
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                tab === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
          </div>

          {unreadList.length > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {displayedList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No {tab !== 'all' ? tab : ''} notifications</p>
              <p className="text-xs text-slate-400">
                You will receive alerts here immediately whenever meals are claimed or verified.
              </p>
            </div>
          ) : (
            displayedList.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  !notif.isRead
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
                    : 'bg-white border-slate-200 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                      )}
                      <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {notif.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {formatLocalDateTime(notif.createdAt)}
                  </span>
                </div>

                {/* Claim details box */}
                <div className="p-3 bg-white/80 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <strong>Food Item:</strong> {notif.foodName}
                    </div>
                    <div>
                      <strong>Servings Claimed:</strong> {notif.claimedServings}
                      {notif.remainingServings !== undefined && (
                        <span className="text-slate-500"> ({notif.remainingServings} left)</span>
                      )}
                    </div>
                    {notif.recipientName && (
                      <div>
                        <strong>Recipient:</strong> {notif.recipientName}
                        {notif.recipientPhone && <span className="text-slate-500"> ({notif.recipientPhone})</span>}
                      </div>
                    )}
                    {notif.pickupDeadline && (
                      <div className="text-red-700">
                        <strong>Pickup Deadline:</strong> {formatLocalDateTime(notif.pickupDeadline)}
                      </div>
                    )}
                    {notif.expiryTimestamp && (
                      <div className="text-amber-800">
                        <strong>Food Expiry:</strong> {formatLocalDateTime(notif.expiryTimestamp)}
                      </div>
                    )}
                    {notif.pickupAddress && (
                      <div className="sm:col-span-2 text-slate-600">
                        <strong>Location:</strong> {notif.pickupAddress}
                      </div>
                    )}
                  </div>

                  {notif.verificationToken && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Verification Token:</span>
                        <strong className="text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {notif.verificationToken}
                        </strong>
                      </div>

                      {notif.role === 'donor' && onOpenTokenVerification && (
                        <button
                          type="button"
                          onClick={() => {
                            onMarkAsRead(notif.id);
                            onClose();
                            onOpenTokenVerification(notif.verificationToken || '');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-[11px] shadow-2xs transition-colors"
                        >
                          Verify Token
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!notif.isRead && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onMarkAsRead(notif.id)}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
