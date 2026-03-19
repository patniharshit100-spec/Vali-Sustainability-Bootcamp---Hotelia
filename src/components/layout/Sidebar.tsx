import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Settings,
  Hotel,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'command-center', label: 'Command Center', path: '/', icon: <LayoutDashboard size={20} /> },
  { id: 'conversations', label: 'Conversations', path: '/conversations', icon: <MessageSquare size={20} />, badge: 3 },
  { id: 'operations', label: 'Operations', path: '/operations', icon: <ClipboardList size={20} />, badge: 2 },
  { id: 'intelligence', label: 'Intelligence', path: '/intelligence', icon: <BarChart3 size={20} /> },
  { id: 'reservations', label: 'Reservations', path: '/reservations', icon: <CalendarDays size={20} /> },
  { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, hotel } = useAppStore();

  return (
    <aside
      className={`flex flex-col h-full bg-slate-900 text-white transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      } flex-shrink-0`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-slate-800 ${sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
        <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Hotel size={18} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight truncate">Hotel Insight</p>
            <p className="text-xs text-slate-400 truncate">{hotel.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-colors group relative ${
                    sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5 gap-3'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                        {item.badge && !isActive && (
                          <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && item.badge && !isActive && (
                      <span className="absolute top-1 right-1 bg-red-500 rounded-full h-2 w-2" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
