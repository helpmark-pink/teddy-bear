import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState, Message } from '../types';

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isListening: false,
      isSpeaking: false,
      audioEnabled: false,
      addMessage: (text: string, sender: 'user' | 'ai') => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text,
          sender,
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      clearHistory: () => set({ messages: [] }),
      setIsListening: (value: boolean) => set({ isListening: value }),
      setIsSpeaking: (value: boolean) => set({ isSpeaking: value }),
      setAudioEnabled: (value: boolean) => set({ audioEnabled: value }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);