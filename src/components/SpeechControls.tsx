import React, { useEffect, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 画面サイズに基づいてスタイルを決定
  const isSmallDevice = window.innerWidth <= 375;
  const isEasyPhone = window.innerWidth <= 320;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage();
      // 送信後にフォーカスを維持
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // コンポーネントがマウントされたらフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="chat-input-area p-2 sm:p-3 md:p-4 border-t border-pink-100 bg-white"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleListen}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${
            isListening
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
              : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600'
          } ${isEasyPhone ? 'easy-phone-button' : ''}`}
          aria-label={isListening ? '音声をオフにする' : '音声をオンにする'}
        >
          {isListening ? (
            <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
          ) : (
            <VolumeX className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 p-2 sm:p-2.5 md:p-3 text-sm sm:text-base rounded-full bg-pink-50 border border-pink-200 sm:border-2 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-300 ${
            isEasyPhone ? 'easy-phone-input' : ''
          } ${isSmallDevice ? 'py-1.5 px-2.5' : ''}`}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed ${
            isEasyPhone ? 'easy-phone-button' : ''
          }`}
          aria-label="メッセージを送信"
        >
          <Send className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
        </button>
      </div>
    </form>
  );
};