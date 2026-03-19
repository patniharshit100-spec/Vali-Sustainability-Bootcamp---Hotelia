import { create } from 'zustand';
import type { Message } from '../types';
import { mockMessages } from '../data/mockData';

interface InboxState {
  messages: Message[];
  selectedMessageId: string | null;
  selectMessage: (id: string | null) => void;
  markAsRead: (id: string) => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  messages: mockMessages,
  selectedMessageId: null,
  selectMessage: (id) => set({ selectedMessageId: id }),
  markAsRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    })),
}));
