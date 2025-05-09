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

  // デバイスサイズの判定
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // 画面サイズに基づく条件
  const isSmallDevice = windowWidth <= 375;
  const isIPhone16 = windowWidth >= 390 && windowWidth <= 428;
  const isTallDevice = windowWidth >= 390 && windowHeight >= 800 && windowWidth <= 428; 

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
        // @ts-expect-error: AudioContext互換性の問題
        const context = new (window.AudioContext || window.webkitAudioContext)();
        context.resume();
      }, { once: true });
    }

    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      // アプリの高さも設定
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      // 画面サイズを更新
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
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

  // キャラクターコンテナのクラス名を決定
  const characterContainerClass = `w-full md:w-1/2 flex-shrink-0 character-container ${
    isIPhone16 
      ? 'iphone16-character' 
      : isSmallDevice 
        ? 'model-container-small'
        : isTallDevice
          ? 'tall-device-character'
          : 'h-[35vh] sm:h-[40vh] md:h-full'
  }`;

  // チャットコンテナのクラス名を決定
  const chatContainerClass = `w-full md:w-1/2 flex-1 flex flex-col ${
    isIPhone16 
      ? 'iphone16-chat' 
      : isTallDevice
        ? 'tall-device-chat'
        : 'h-[calc(65vh-4rem)] sm:h-[calc(60vh-4rem)] md:h-full'
  } ${isSmallDevice ? 'chat-height-small' : ''}`;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-pink-100 via-pink-50 to-white flex flex-col" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center py-2 sm:py-3 md:py-4 text-pink-600 drop-shadow-sm easy-phone-text">
        AI チャットフレンド
      </h1>
      <div className="flex-1 flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 device-small device-medium device-large min-h-0 overflow-hidden">
        <div className={characterContainerClass}>
          <div className="h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border sm:border-2 md:border-4 border-pink-200">
            <CharacterScene />
          </div>
        </div>
        <div className={chatContainerClass}>
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