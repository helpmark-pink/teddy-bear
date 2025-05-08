import React from 'react';
import { Volume2, VolumeX, Send } from 'lucide-react';

interface SpeechControlsProps {
  isListening: boolean;
  onToggleListen: () => void;
  onSendMessage: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  placeholder?: string;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  isListening,
  onToggleListen,
  onSendMessage,
  inputText,
  setInputText,
  placeholder = "メッセージを入力..."
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 md:p-4 border-t border-pink-100 bg-white">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleListen}
          className={`p-2 md:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
            isListening
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
              : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600'
          }`}
          aria-label={isListening ? '音声をオフにする' : '音声をオンにする'}
        >
          {isListening ? (
            <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 md:p-3 text-sm md:text-base rounded-full bg-pink-50 border border-pink-200 md:border-2 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-300"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 md:p-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="メッセージを送信"
        >
          <Send className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </form>
  );
};