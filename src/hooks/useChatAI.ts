import { useState } from 'react';
import { getAIResponse } from '../services/openAIService';
import { useChatStore } from '../store/chatStore';
import { LipSyncController } from '../utils/lipSync';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useChatAI = (lipSync: LipSyncController) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMessage, setIsSpeaking, audioEnabled } = useChatStore();
  const { speak } = useSpeechSynthesis();

  const processMessage = async (message: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      addMessage(message, 'user');

      const response = await getAIResponse(message);
      
      if (audioEnabled) {
        setIsSpeaking(true);
        lipSync.startTalking();
        addMessage(response, 'ai');
        await speak(response);
        lipSync.stopTalking();
        setIsSpeaking(false);
      } else {
        addMessage(response, 'ai');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('申し訳ありません。エラーが発生しました。', 'ai');
    } finally {
      setIsProcessing(false);
    }
  };

  return { processMessage, isProcessing };
};