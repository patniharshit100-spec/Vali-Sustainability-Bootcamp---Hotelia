import { create } from 'zustand';
import type { Hotel, User } from '../types';
import { mockHotel, mockUser } from '../data/mockData';

interface AppState {
  hotel: Hotel;
  user: User;
  sidebarCollapsed: boolean;
  loading: boolean;
  error: string | null;
  toggleSidebar: () => void;
  notificationCount: number;
}

export const useAppStore = create<AppState>((set) => ({
  hotel: mockHotel,
  user: mockUser,
  sidebarCollapsed: false,
  loading: false,
  error: null,
  notificationCount: 5,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
