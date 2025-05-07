import { useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis is not supported in this browser.'));
        return;
      }

      // 発話を停止
      window.speechSynthesis.cancel();

      // 文章を自然な長さに分割
      const sentences = text.match(/[^。！？]+[。！？]/g) || [text];
      let currentIndex = 0;

      const speakNextSentence = () => {
        if (currentIndex >= sentences.length) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[currentIndex]);
        
        // 日本語の女性の声を設定
        utterance.lang = 'ja-JP';
        
        // 利用可能な音声を取得
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => 
          voice.lang.includes('ja-JP') && voice.name.includes('Female')
        );
        
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }

        // より子供らしい声になるように調整
        utterance.pitch = 1.5; // かなり高めに
        utterance.rate = 1.1; // やや早め
        utterance.volume = 0.85; // 少し抑えめ

        // 文末に応じてイントネーションを調整（より表情豊かに）
        const sentence = sentences[currentIndex];
        if (sentence.endsWith('？')) {
          utterance.pitch = 1.7; // 疑問文はさらに高く
        } else if (sentence.endsWith('！')) {
          utterance.volume = 1.0; // 感嘆文は通常の音量で
          utterance.pitch = 1.6; // 感嘆文も高めに
        }

        utterance.onend = () => {
          currentIndex++;
          // 文章間に短いポーズを入れる（子供らしい間の取り方）
          setTimeout(speakNextSentence, 300);
        };

        utterance.onerror = (event) => {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        window.speechSynthesis.speak(utterance);
      };

      // 音声の準備が完了してから開始
      if (window.speechSynthesis.getVoices().length > 0) {
        speakNextSentence();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          speakNextSentence();
        };
      }
    });
  }, []);

  return { speak };
};