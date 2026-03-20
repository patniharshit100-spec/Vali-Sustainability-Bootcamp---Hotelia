import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const TAB_ITEMS: TabItem[] = [
  { id: 'overview',       label: 'Overview',  path: '/',              icon: <LayoutDashboard size={22} /> },
  { id: 'conversations',  label: 'Inbox',     path: '/conversations', icon: <MessageSquare size={22} />, badge: 3 },
  { id: 'operations',     label: 'Tasks',     path: '/operations',    icon: <ClipboardList size={22} />, badge: 2 },
  { id: 'intelligence',   label: 'Reports',   path: '/intelligence',  icon: <BarChart3 size={22} /> },
  { id: 'reservations',   label: 'Bookings',  path: '/reservations',  icon: <CalendarDays size={22} /> },
];

export const BottomTabBar: React.FC = () => {
  return (
    <nav
      className="md:hidden flex-shrink-0 bg-white border-t border-slate-200 flex items-stretch pb-safe"
      style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
    >
      {TAB_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors min-h-[44px] ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {item.icon}
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1.5 h-4 min-w-[16px] px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 inset-x-0 h-0.5 bg-blue-600 rounded-b" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
