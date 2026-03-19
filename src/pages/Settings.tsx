import React, { useState } from 'react';
import { Building2, Bell, Users, Globe, Shield, Plug } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAppStore } from '../stores/appStore';

const sections = [
  { id: 'hotel', label: 'Hotel Profile', icon: <Building2 size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'team', label: 'Team & Access', icon: <Users size={16} /> },
  { id: 'channels', label: 'Channels', icon: <Globe size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={16} /> },
];

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hotel');
  const { hotel } = useAppStore();

  return (
    <div className="flex h-full">
      {/* Sidebar nav */}
      <div className="w-52 border-r border-slate-200 bg-white py-4">
        <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-blue-50 text-blue-700 border-r-2 border-r-blue-600'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <span className={activeSection === s.id ? 'text-blue-600' : 'text-slate-400'}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'hotel' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-base font-semibold text-slate-800 mb-1">Hotel Profile</h2>
              <p className="text-sm text-slate-500">Update your hotel's information and branding.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hotel Name</label>
                <input
                  type="text"
                  defaultValue={hotel.name}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
                <input
                  type="text"
                  defaultValue={hotel.location}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Star Rating</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s} selected={s === hotel.stars}>{s} Star{s > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hotel Description</label>
                <textarea
                  rows={3}
                  placeholder="A brief description of your hotel..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="pt-2">
                <Button variant="primary" size="sm">Save Changes</Button>
              </div>
            </div>
          </div>
        )}

        {activeSection !== 'hotel' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 pt-24">
            <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
              {sections.find((s) => s.id === activeSection)?.icon}
            </div>
            <p className="text-sm font-medium text-slate-500">
              {sections.find((s) => s.id === activeSection)?.label} settings
            </p>
            <p className="text-xs text-slate-400">Coming soon — this section is under development</p>
          </div>
        )}
      </div>
    </div>
  );
};
