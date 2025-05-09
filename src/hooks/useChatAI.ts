import { useState, useEffect } from 'react';
import { getAIResponse } from '../services/openAIService';
import { useChatStore } from '../store/chatStore';
import { LipSyncController } from '../utils/lipSync';
import { useSpeechSynthesis } from './useSpeechSynthesis';

// Window型拡張の宣言
declare global {
  interface Window {
    opera?: unknown;
  }
}

export const useChatAI = (lipSync: LipSyncController) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addMessage, setIsSpeaking, audioEnabled } = useChatStore();
  const { speak } = useSpeechSynthesis();
  const [isMobile, setIsMobile] = useState(false);
  
  // モバイル検出
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window.opera ? window.opera : '');
      const mobile = /android|ipad|iphone|ipod|mobile|tablet/i.test(String(userAgent).toLowerCase());
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const focusOn3DModel = () => {
    if (isMobile) {
      // キーボードを確実に閉じる
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // スクロールを上部（3Dモデル部分）に移動
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // iOS SafariやAndroidでのキーボードハンドリングの問題を解決するために遅延
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const processMessage = async (message: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      addMessage(message, 'user');
      
      if (isMobile) {
        // 返信待ち中に3Dモデルにフォーカス
        focusOn3DModel();
      }

      const response = await getAIResponse(message);
      
      if (audioEnabled) {
        setIsSpeaking(true);
        lipSync.startTalking();
        addMessage(response, 'ai');
        
        // モバイルの場合、応答時に再度フォーカスを確保
        if (isMobile) {
          focusOn3DModel();
        }
        
        await speak(response);
        lipSync.stopTalking();
        setIsSpeaking(false);
      } else {
        addMessage(response, 'ai');
        
        // 音声がオフでもモバイルの場合は3Dモデルにフォーカス
        if (isMobile) {
          focusOn3DModel();
        }
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