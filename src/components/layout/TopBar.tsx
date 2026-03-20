import React, { useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { Avatar } from '../common/Avatar';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Command Center', subtitle: 'Today\'s overview & priority inbox' },
  '/conversations': { title: 'Conversations', subtitle: 'Guest communications across all channels' },
  '/operations': { title: 'Operations', subtitle: 'Task management & staff coordination' },
  '/intelligence': { title: 'Intelligence', subtitle: 'KPIs, reviews & competitive insights' },
  '/reservations': { title: 'Reservations', subtitle: 'Current and upcoming bookings' },
  '/settings': { title: 'Settings', subtitle: 'Hotel configuration & preferences' },
};

export const TopBar: React.FC = () => {
  const { hotel, user, notificationCount } = useAppStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'Hotel Insight', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Page title */}
      <div>
        <h1 className="text-base font-semibold text-slate-800 leading-tight">{pageInfo.title}</h1>
        {pageInfo.subtitle && (
          <p className="hidden sm:block text-xs text-slate-500">{pageInfo.subtitle}</p>
        )}
      </div>

      {/* Right: Search, hotel name, notifications, user */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
          />
        </div>

        {/* Hotel name chip */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-slate-600">{hotel.name}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Avatar name={user.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{user.role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20 py-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-700">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Profile</button>
                <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">Settings</button>
                <div className="border-t border-slate-100 mt-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50">Sign out</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
