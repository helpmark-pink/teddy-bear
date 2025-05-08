export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  audioEnabled: boolean;
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  clearHistory: () => void;
  setIsListening: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  setAudioEnabled: (value: boolean) => void;
}