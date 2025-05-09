import React, { useState, useEffect, useCallback } from 'react';
import { ChatHistory } from './components/ChatHistory';
import { SpeechControls } from './components/SpeechControls';
import { CharacterScene, lipSync } from './components/CharacterScene';
import { useChatStore } from './store/chatStore';
import { useChatAI } from './hooks/useChatAI';

// Window型を拡張してoperaプロパティを追加
declare global {
  interface Window {
    opera?: unknown;
  }
}

function App() {
  const [inputText, setInputText] = useState('');
  const { messages, isListening, setIsListening, setAudioEnabled, audioEnabled } = useChatStore();
  const { processMessage } = useChatAI(lipSync);

  // デバイスサイズの判定
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // ユーザーエージェントからモバイルデバイスを検出
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // 画面サイズに基づく条件
  const isSmallDevice = windowWidth <= 375;
  const isIPhone16 = windowWidth >= 390 && windowWidth <= 428;
  const isTallDevice = windowWidth >= 390 && windowHeight >= 800 && windowWidth <= 428;
  // 6.3インチ以上のスマホ対応用（大型スマホ）
  const isLargePhone = windowWidth > 428 && windowWidth <= 510;

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processMessage(inputText);
      setInputText('');
    }
  };

  const handleToggleListen = useCallback(() => {
    const newState = !isListening;
    setIsListening(newState);
    setAudioEnabled(newState);
    
    // モバイルデバイスで音声を有効化する時、追加の初期化処理
    if (newState && isMobileDevice) {
      try {
        // 音声合成の初期化（iOS Safariで必要）
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        setTimeout(() => window.speechSynthesis.cancel(), 50);
        
        // AudioContextの初期化（Android Chrome等で必要）
        // @ts-expect-error: AudioContext互換性の問題
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      } catch (error) {
        console.error('音声初期化エラー:', error);
      }
    }
  }, [isListening, setIsListening, setAudioEnabled, isMobileDevice]);

  // モバイルでの音声と表示の初期化
  useEffect(() => {
    // iOS Safariの音声再生問題に対応するためのタッチイベント追加
    const initAudio = () => {
      try {
        // 音声合成の初期化
        window.speechSynthesis.cancel(); // 既存の音声をキャンセル
        
        // 空の音声を再生してシステムを初期化
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        
        // AudioContextも初期化
        // @ts-expect-error: AudioContext互換性の問題
        const context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') {
        context.resume();
        }
        
        console.log('Mobile audio initialized');
      } catch (error) {
        console.error('Mobile audio init error:', error);
      }
    };

    // モバイルデバイスの検出
    const detectMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window.opera ? window.opera : '');
      const isMobile = /android|ipad|iphone|ipod|mobile|tablet/i.test(String(userAgent).toLowerCase());
      setIsMobileDevice(isMobile);
      
      // モバイルデバイスの場合、デフォルトで音声を無効に
      if (isMobile && !window.localStorage.getItem('audio-enabled')) {
        setAudioEnabled(false);
      }
    };
    
    detectMobileDevice();

    // モバイル用の音声初期化処理
    if (isMobileDevice) {
      // ユーザーインタラクション時に音声を初期化
      document.addEventListener('touchstart', initAudio, { once: true });
      document.addEventListener('click', initAudio, { once: true });
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
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('click', initAudio);
    };
  }, [isMobileDevice, setAudioEnabled]);

  // AIが話している間はモバイルデバイスでスクロールを制御
  useEffect(() => {
    const { isSpeaking } = useChatStore.getState();
    
    // モバイルデバイスでAIが話している時のスクロール制御
    const handleScroll = () => {
      if (isMobileDevice && isSpeaking) {
        // 3Dモデルが見えるように上部にスクロール位置を固定
        window.scrollTo({ top: 0 });
      }
    };
    
    if (isMobileDevice) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileDevice]);

  // キャラクターコンテナのクラス名を決定
  const characterContainerClass = `w-full md:w-1/2 flex-shrink-0 character-container ${
    isLargePhone
      ? 'large-phone-character'
      : isIPhone16 
        ? 'iphone16-character' 
        : isSmallDevice 
          ? 'model-container-small'
          : isTallDevice
            ? 'tall-device-character'
            : 'h-[35vh] sm:h-[40vh] md:h-full'
  }`;

  // チャットコンテナのクラス名を決定
  const chatContainerClass = `w-full md:w-1/2 flex-1 flex flex-col ${
    isLargePhone
      ? 'large-phone-chat'
      : isIPhone16 
        ? 'iphone16-chat' 
        : isTallDevice
          ? 'tall-device-chat'
          : 'h-[calc(65vh-4rem)] sm:h-[calc(60vh-4rem)] md:h-full'
  } ${isSmallDevice ? 'chat-height-small' : ''}`;

  // タイトルのクラス名を決定
  const titleClass = `font-bold text-center text-pink-600 drop-shadow-sm easy-phone-text ${
    isIPhone16 || isTallDevice
      ? 'text-lg py-1'
      : 'text-xl sm:text-2xl md:text-3xl py-2 sm:py-3 md:py-4'
  }`;

  // 音声状態インジケータークラス
  const audioStatusClass = `absolute top-1 right-1 text-xs px-2 py-0.5 rounded-full z-10 ${
    audioEnabled
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200'
  }`;

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-pink-100 via-pink-50 to-white flex flex-col" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <h1 className={titleClass}>
        AI チャットフレンド
      </h1>
      <div className="flex-1 flex flex-col md:flex-row gap-1 sm:gap-2 md:gap-4 p-1 sm:p-2 md:p-4 device-small device-medium device-large min-h-0 overflow-hidden">
        <div className={characterContainerClass}>
          <div className="h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border sm:border-2 md:border-4 border-pink-200 relative">
            {isMobileDevice && (
              <span className={audioStatusClass}>
                {audioEnabled ? '音声: ON' : '音声: OFF'}
              </span>
            )}
            <CharacterScene />
          </div>
        </div>
        <div className={chatContainerClass}>
          <div className="w-full h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border sm:border-2 md:border-4 border-pink-200 flex flex-col chat-container">
            <div className="flex-1 overflow-hidden chat-history">
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