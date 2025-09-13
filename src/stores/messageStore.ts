import { create } from 'zustand';

interface Message {
  message: string;
  type: 'Success' | 'Error' | 'info';
  hideButton?: boolean;
  progress?: number;
}

interface MessageState {
  message: Message | null;
  
  // Actions
  setMessage: (message: Message | null) => void;
  clearMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  message: null,

  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: null }),
}));
