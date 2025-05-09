import { useCallback, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  // モバイルデバイスでの音声合成初期化を処理
  useEffect(() => {
    // iOSとAndroidデバイスでの音声合成APIの初期化
    const initSpeechSynthesis = () => {
      try {
        // 空の発話で音声合成を初期化（特にiOSで効果的）
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0; // 無音で初期化
        window.speechSynthesis.speak(utterance);
        
        // iOSのSafariで必要な場合があるので、音声をキャンセル
        setTimeout(() => {
          window.speechSynthesis.cancel();
          console.log('Speech synthesis initialized');
        }, 100);
      } catch (error) {
        console.error('Failed to initialize speech synthesis:', error);
      }
    };

    // タッチイベントまたはクリックイベントで音声合成を初期化
    const handleUserInteraction = () => {
      initSpeechSynthesis();
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    // ユーザーインタラクションリスナーを追加
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('click', handleUserInteraction);

    // 音声の事前ロード試行（iOS対策）
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis is not supported in this browser.'));
        return;
      }

      // 発話を停止
      window.speechSynthesis.cancel();

      // 音声合成が一時停止されている場合は再開
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

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
          console.error('Speech synthesis error:', event);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        try {
        window.speechSynthesis.speak(utterance);
          
          // iOSのSafariでの音声再生の問題に対処するためのウォッチドッグ
          // （音声合成が一時停止することがある）
          const maxDuration = sentences[currentIndex].length * 100; // 文字数に基づく最大持続時間
          setTimeout(() => {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }, maxDuration);
          
        } catch (error) {
          console.error('Error during speech synthesis:', error);
          reject(error);
        }
      };

      // 音声の準備が完了してから開始
      if (window.speechSynthesis.getVoices().length > 0) {
        speakNextSentence();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null; // リスナーを一度だけ実行
          speakNextSentence();
        };
      }
    });
  }, []);

  return { speak };
};