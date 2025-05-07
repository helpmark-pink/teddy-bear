import React, { useState } from 'react';
import { ChatHistory } from './components/ChatHistory';
import { SpeechControls } from './components/SpeechControls';
import { CharacterScene, lipSync } from './components/CharacterScene';
import { useChatStore } from './store/chatStore';
import { useChatAI } from './hooks/useChatAI';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

function App() {
  const [inputText, setInputText] = useState('');
  const { messages, isListening, setIsListening } = useChatStore();
  const { processMessage } = useChatAI(lipSync);

  const handleRecognizedSpeech = (text: string) => {
    setInputText(text);
    processMessage(text);
  };

  useSpeechRecognition(handleRecognizedSpeech);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      processMessage(inputText);
      setInputText('');
    }
  };

  const handleToggleListen = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-pink-100 via-pink-50 to-white flex flex-col">
      <h1 className="text-2xl md:text-3xl font-bold text-center py-2 md:py-4 text-pink-600 drop-shadow-sm">
        チャットフレンド
      </h1>
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4">
        <div className="w-full md:w-1/2 h-[42vh] md:h-full">
          <div className="h-full bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border-2 md:border-4 border-pink-200">
            <CharacterScene />
          </div>
        </div>
        <div className="w-full md:w-1/2 h-[42vh] md:h-full flex">
          <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border-2 md:border-4 border-pink-200 flex flex-col">
            <ChatHistory messages={messages} />
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
  );
}

export default App;