import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageCircle, Bot, Trash2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface ChatHistoryProps {
  messages: Message[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clearHistory = useChatStore((state) => state.clearHistory);

  // デバイスサイズを判定
  const isEasyPhone = window.innerWidth <= 320;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // メッセージが追加されたら自動的に一番下までスクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自動スクロールの強化
  useEffect(() => {
    // 初期ロード時に明示的にスクロール位置を設定
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      // コンテンツが読み込まれたあとに確実にスクロールするために少し遅延
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        scrollToBottom();
      }, 100);
    }
  }, []);

  // スワイプ操作のハンドリング（タッチデバイス用）
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY;
      const deltaX = e.touches[0].clientX - startX;
      
      // 縦方向のスクロールが横方向より大きい場合のみ処理
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // スクロール操作を許可するために親要素への伝播を防止しない
        // チャットコンテナ自体のスクロールを許可
      }
    };

    chatContainer.addEventListener('touchstart', handleTouchStart);
    chatContainer.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      chatContainer.removeEventListener('touchstart', handleTouchStart);
      chatContainer.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-gradient-to-b from-pink-50 to-white relative"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(244, 114, 182, 0.5) transparent',
        height: '100%',
        maxHeight: '100%'
      }}
    >
      {messages.length > 0 && (
        <button
          onClick={clearHistory}
          className="sticky top-2 right-2 float-right p-1.5 sm:p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors z-10"
          title="履歴を消去"
          aria-label="チャット履歴を消去"
        >
          <Trash2 className={`w-3 h-3 sm:w-4 sm:h-4 text-pink-600 ${isEasyPhone ? 'w-4 h-4' : ''}`} />
        </button>
      )}
      <div className="space-y-2 sm:space-y-3 md:space-y-4 clear-right">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-1.5 sm:gap-2 ${
              message.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-br from-pink-400 to-pink-500' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-400'
              } ${isEasyPhone ? 'w-8 h-8' : ''}`}
            >
              {message.sender === 'user' ? (
                <MessageCircle className={`w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white ${isEasyPhone ? 'w-5 h-5' : ''}`} />
              ) : (
                <Bot className={`w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white ${isEasyPhone ? 'w-5 h-5' : ''}`} />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 sm:p-2 md:p-3 shadow-md ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                  : 'bg-white border border-pink-200 sm:border-2'
              } ${isEasyPhone ? 'easy-phone-text' : ''}`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} className="h-0 w-full" />
    </div>
  );
};