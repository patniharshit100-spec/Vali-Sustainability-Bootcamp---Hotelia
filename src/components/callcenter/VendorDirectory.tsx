import React, { useState } from 'react';
import { Phone, AlertTriangle, Search } from 'lucide-react';
import type { Vendor } from '../../types/call';
import { mockVendors } from '../../data/mockCallData';
import { useCallStore } from '../../stores/callStore';

const CATEGORY_COLORS: Record<Vendor['category'], string> = {
  maintenance: 'bg-amber-100 text-amber-700',
  cleaning: 'bg-blue-100 text-blue-700',
  catering: 'bg-green-100 text-green-700',
  transport: 'bg-violet-100 text-violet-700',
  security: 'bg-slate-100 text-slate-700',
  medical: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-500',
};

export const VendorDirectory: React.FC = () => {
  const { startCall, activeCall } = useCallStore();
  const [search, setSearch] = useState('');

  const filtered = mockVendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.includes(search.toLowerCase()),
  );

  const call = (vendor: Vendor) => {
    if (activeCall) return;
    startCall(vendor.name, vendor.phone, 'outbound');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Vendor Directory</h3>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors…"
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      <ul className="divide-y divide-slate-100">
        {filtered.map((vendor) => (
          <li key={vendor.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-slate-800 truncate">{vendor.name}</p>
                {vendor.isEmergency && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full flex-shrink-0">
                    <AlertTriangle size={10} />
                    Emergency
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[vendor.category]}`}>
                  {vendor.category}
                </span>
                {vendor.contactPerson && (
                  <span className="text-xs text-slate-400 truncate">{vendor.contactPerson}</span>
                )}
              </div>
              {vendor.notes && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">{vendor.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-slate-500 hidden sm:block">{vendor.phone}</span>
              <button
                onClick={() => call(vendor)}
                disabled={!!activeCall}
                className="h-8 w-8 rounded-lg bg-green-100 hover:bg-green-200 disabled:opacity-40 text-green-700 flex items-center justify-center transition-colors"
                title={`Call ${vendor.name}`}
              >
                <Phone size={14} />
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-xs text-slate-400">No vendors found.</li>
        )}
      </ul>
    </div>
  );
};
