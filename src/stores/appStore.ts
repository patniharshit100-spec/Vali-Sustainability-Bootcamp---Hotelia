import { create } from 'zustand';
import type { Hotel, User } from '../types';
import { mockHotel, mockUser } from '../data/mockData';

interface AppState {
  hotel: Hotel;
  user: User;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  notificationCount: number;
}

export const useAppStore = create<AppState>((set) => ({
  hotel: mockHotel,
  user: mockUser,
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  notificationCount: 5,
}));
