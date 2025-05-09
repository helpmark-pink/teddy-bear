import React, { useState, useEffect } from 'react';
import { ChatHistory } from './components/ChatHistory';
import { SpeechControls } from './components/SpeechControls';
import { CharacterScene, lipSync } from './components/CharacterScene';
import { useChatStore } from './store/chatStore';
import { useChatAI } from './hooks/useChatAI';

function App() {
  const [inputText, setInputText] = useState('');
  const { messages, isListening, setIsListening, setAudioEnabled } = useChatStore();
  const { processMessage } = useChatAI(lipSync);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processMessage(inputText);
      setInputText('');
    }
  };

  const handleToggleListen = () => {
    setIsListening(!isListening);
    setAudioEnabled(!isListening);
  };

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      document.addEventListener('touchstart', () => {
        // @ts-ignore: AudioContext互換性のためにanyを使用
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        context.resume();
      }, { once: true });
    }

    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      // アプリの高さも設定
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // デバイスサイズの判定
  const isSmallDevice = window.innerWidth <= 375;
  const isIPhone16 = window.innerWidth >= 390 && window.innerWidth <= 428;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-pink-100 via-pink-50 to-white flex flex-col" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center py-2 sm:py-3 md:py-4 text-pink-600 drop-shadow-sm easy-phone-text">
        AI チャットフレンド
      </h1>
      <div className="flex-1 flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 device-small device-medium device-large min-h-0 overflow-hidden">
        <div className={`w-full md:w-1/2 flex-shrink-0 ${
          isIPhone16 ? 'iphone16-character' : 'h-[35vh] sm:h-[40vh] md:h-full'
        }`}>
          <div className="h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border sm:border-2 md:border-4 border-pink-200">
            <CharacterScene />
          </div>
        </div>
        <div className={`w-full md:w-1/2 flex-1 flex flex-col ${
          isIPhone16 ? 'iphone16-chat' : 'h-[calc(65vh-4rem)] sm:h-[calc(60vh-4rem)] md:h-full'
        } ${isSmallDevice ? 'chat-height-small' : ''}`}>
          <div className="w-full h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border sm:border-2 md:border-4 border-pink-200 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ChatHistory messages={messages} />
            </div>
            <div className="chat-footer">
              <SpeechControls
                isListening={isListening}
                onToggleListen={handleToggleListen}
                onSendMessage={handleSendMessage}
                inputText={inputText}
                setInputText={setInputText}
                placeholder="メッセージを入力..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;