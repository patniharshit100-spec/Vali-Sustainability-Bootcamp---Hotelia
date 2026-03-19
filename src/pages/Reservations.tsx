import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { mockReservations } from '../data/mockData';
import type { ReservationStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';

const statusVariant: Record<ReservationStatus, 'success' | 'primary' | 'default' | 'danger' | 'warning'> = {
  confirmed: 'primary',
  checked_in: 'success',
  checked_out: 'default',
  cancelled: 'danger',
  no_show: 'warning',
};

const statusLabels: Record<ReservationStatus, string> = {
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

const tabs: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'confirmed', label: 'Arriving' },
  { id: 'checked_in', label: 'In-House' },
  { id: 'checked_out', label: 'Departed' },
];

export const Reservations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockReservations.filter((r) => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch =
      !search ||
      r.guestName.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.includes(search) ||
      r.roomType.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>New Reservation</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Guest</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Room</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Check In</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Check Out</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Source</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={res.guestName} size="sm" />
                    <div>
                      <p className="font-medium text-slate-800">{res.guestName}</p>
                      <p className="text-xs text-slate-400">{res.guestEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-700">{res.roomNumber}</p>
                  <p className="text-xs text-slate-400">{res.roomType}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {new Date(res.checkIn).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {new Date(res.checkOut).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  <span className="text-xs text-slate-400 ml-1">({res.nights}n)</span>
                </td>
                <td className="px-4 py-4 text-slate-600">{res.source}</td>
                <td className="px-4 py-4 text-right font-semibold text-slate-800">
                  ${res.totalAmount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-center">
                  <Badge variant={statusVariant[res.status]} size="sm">
                    {statusLabels[res.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <p className="text-sm">No reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
};
