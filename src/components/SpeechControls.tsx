import React, { useEffect, useRef, useState } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // 画面サイズの変更を監視
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 画面サイズに基づいてスタイルを決定
  const isSmallDevice = windowWidth <= 375;
  const isEasyPhone = windowWidth <= 320;
  const isMobile = windowWidth <= 768;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // モバイルデバイスの場合、送信後にキーボードを閉じて3Dモデルにフォーカスを移す
      if (isMobile && inputRef.current) {
        inputRef.current.blur();
        
        // スクロールを3Dモデル部分（上部）に戻す
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      } else {
        // デスクトップの場合は従来通りフォーカスを維持
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
      
      onSendMessage();
    }
  };
  
  // モバイル向けのフォーム内容高さ調整
  const adjustFormHeight = () => {
    if (isMobile && inputRef.current) {
      inputRef.current.style.height = '40px'; // デフォルト高さ
      
      // コンテンツの高さに基づいて調整（複数行対応）
      const scrollHeight = inputRef.current.scrollHeight;
      if (scrollHeight > 40) {
        inputRef.current.style.height = `${Math.min(scrollHeight, 100)}px`; // 最大高さ制限
      }
    }
  };

  // 入力テキスト変更時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    adjustFormHeight(); // 高さ調整
  };

  // コンポーネントがマウントされたらフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // 画面のリサイズや回転時に高さを調整
    window.addEventListener('resize', adjustFormHeight);
    window.addEventListener('orientationchange', adjustFormHeight);
    
    return () => {
      window.removeEventListener('resize', adjustFormHeight);
      window.removeEventListener('orientationchange', adjustFormHeight);
    };
  }, []);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`chat-input-area p-2 sm:p-3 md:p-4 border-t border-pink-100 bg-white ${
        isMobile ? 'pb-4' : ''
      }`}
    >
      <div className={`flex items-center gap-2 sm:gap-3 ${isMobile ? 'mobile-controls' : ''}`}>
        <button
          type="button"
          onClick={onToggleListen}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg flex-shrink-0 ${
            isListening
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
              : 'bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:from-pink-500 hover:to-pink-600'
          } ${isEasyPhone ? 'easy-phone-button' : ''} ${
            isMobile ? 'w-12 h-12 flex items-center justify-center' : ''
          }`}
          aria-label={isListening ? '音声をオフにする' : '音声をオンにする'}
        >
          {isListening ? (
            <Volume2 className={`w-5 h-5 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
          ) : (
            <VolumeX className={`w-5 h-5 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 p-2 sm:p-2.5 md:p-3 text-sm sm:text-base rounded-full bg-pink-50 border border-pink-200 sm:border-2 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-300 ${
            isEasyPhone ? 'easy-phone-input' : ''
          } ${isSmallDevice ? 'py-1.5 px-3' : ''} ${
            isMobile ? 'min-h-[40px] py-2 px-4 text-base' : ''
          }`}
          style={{
            minHeight: isMobile ? '40px' : 'auto'
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2 sm:p-2.5 md:p-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            isEasyPhone ? 'easy-phone-button' : ''
          } ${
            isMobile ? 'w-12 h-12 flex items-center justify-center' : ''
          }`}
          aria-label="メッセージを送信"
        >
          <Send className={`w-5 h-5 ${isEasyPhone ? 'w-6 h-6' : ''}`} />
        </button>
      </div>
    </form>
  );
};