import { useState } from 'react';
import { getAIResponse } from '../services/openAIService';
import { useChatStore } from '../store/chatStore';
import { LipSyncController } from '../utils/lipSync';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useChatAI = (lipSync: LipSyncController) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMessage, setIsSpeaking } = useChatStore();
  const { speak } = useSpeechSynthesis();

  const processMessage = async (message: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      addMessage(message, 'user');

      const response = await getAIResponse(message);
      
      // リップシンクアニメーションの開始
      setIsSpeaking(true);
      lipSync.startTalking();
      
      // メッセージの追加
      addMessage(response, 'ai');
      
      // 音声合成で応答を読み上げ
      await speak(response);
      
      // アニメーションの終了
      lipSync.stopTalking();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('申し訳ありません。エラーが発生しました。', 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  return { processMessage, isProcessing };
};