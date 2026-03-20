import { create } from 'zustand';
import type { Message } from '../types';
import { mockMessages } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchMessages,
  updateMessage,
  subscribeToMessages,
} from '../services/supabase/messages';

let _unsubscribe: (() => void) | null = null;

interface InboxState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  selectedMessageId: string | null;

  // Actions
  selectMessage: (id: string | null) => void;
  markAsRead: (id: string) => Promise<void>;
  approveAIReply: (id: string) => Promise<void>;
  cleanup: () => void;
}

export const useInboxStore = create<InboxState>((set) => {
  void (async () => {
    if (isSupabaseConfigured()) {
      set({ loading: true, error: null });
      const data = await fetchMessages();
      if (data.length > 0) set({ messages: data });
      set({ loading: false });
      _unsubscribe = subscribeToMessages((msg) => {
        set((state) => ({ messages: [msg, ...state.messages] }));
      });
    } else {
      set({ loading: false });
    }
  })();

  return {
    messages: mockMessages,
    loading: isSupabaseConfigured(),
    error: null,
    selectedMessageId: null,

    selectMessage: (id) => set({ selectedMessageId: id }),

    markAsRead: async (id) => {
      // Optimistic update
      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
      }));
      // Persist to Supabase
      if (isSupabaseConfigured()) {
        await updateMessage(id, { isRead: true } as Partial<Message>);
      }
    },

    approveAIReply: async (id) => {
      // Optimistic: mark as replied locally
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === id ? { ...m, isRead: true } : m,
        ),
      }));
      // Persist: set status to 'replied' in Supabase messages table
      if (isSupabaseConfigured()) {
        // The DB column is `status` not `isRead`; use a raw patch
        await updateMessage(id, { status: 'replied' } as unknown as Partial<Message>);
      }
    },

    cleanup: () => {
      _unsubscribe?.();
      _unsubscribe = null;
    },
  };
});
