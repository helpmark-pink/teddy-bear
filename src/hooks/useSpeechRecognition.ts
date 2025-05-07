import { useEffect, useCallback, useState } from 'react';
import { useChatStore } from '../store/chatStore';

export const useSpeechRecognition = (onRecognized: (text: string) => void) => {
  const { isListening, setIsListening } = useChatStore();
  const [error, setError] = useState<string | null>(null);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'denied') {
        throw new Error('Microphone access is required. Please enable it in your browser settings.');
      }
      
      // Even if permission is granted/prompt, we still need to request access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Microphone access is required for speech recognition.');
      }
      setIsListening(false);
      return false;
    }
  };

  const startListening = useCallback(async () => {
    setError(null);

    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      setIsListening(false);
      return;
    }

    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onRecognized(text);
      };

      recognition.onerror = (event: any) => {
        let errorMessage = 'An error occurred with speech recognition.';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access was denied. Please enable it in your browser settings.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          case 'no-speech':
            errorMessage = 'No speech was detected.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found or it is not working properly.';
            break;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to start speech recognition.');
      }
      setIsListening(false);
    }
  }, [setIsListening, onRecognized]);

  useEffect(() => {
    if (isListening) {
      startListening();
    }
  }, [isListening, startListening]);

  return { startListening, error };
};