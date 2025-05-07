import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { MessageCircle, Bot, Trash2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface ChatHistoryProps {
  messages: Message[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clearHistory = useChatStore((state) => state.clearHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-gradient-to-b from-pink-50 to-white relative">
      {messages.length > 0 && (
        <button
          onClick={clearHistory}
          className="absolute top-2 right-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
          title="履歴を消去"
        >
          <Trash2 className="w-4 h-4 text-pink-600" />
        </button>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-2 ${
            message.sender === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md ${
              message.sender === 'user' 
                ? 'bg-gradient-to-br from-pink-400 to-pink-500' 
                : 'bg-gradient-to-br from-purple-400 to-pink-400'
            }`}
          >
            {message.sender === 'user' ? (
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          <div
            className={`max-w-[80%] rounded-xl md:rounded-2xl p-2 md:p-3 shadow-md text-sm md:text-base ${
              message.sender === 'user'
                ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                : 'bg-white border border-pink-200 md:border-2'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}