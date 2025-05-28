
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  onResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  onListeningChange,
  onResult
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Voice result:', transcript);
        onResult(transcript);
        
        // In continuous mode, don't stop listening
        if (!isListening) {
          onListeningChange(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        
        // If in continuous mode and there's an error, try to restart
        if (isListening && event.error !== 'aborted') {
          console.log('Attempting to restart voice recognition...');
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
              }
            }
          }, 1000);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        
        // If we're supposed to be listening (continuous mode), restart
        if (isListening) {
          console.log('Restarting continuous listening...');
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
              }
            }
          }, 500);
        } else {
          onListeningChange(false);
        }
      };
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult, onListeningChange]);

  // Handle continuous listening state changes
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Recognition already started or failed to start:', error);
      }
    } else if (!isListening && recognitionRef.current) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      recognitionRef.current?.stop();
      onListeningChange(false);
    } else {
      onListeningChange(true);
    }
  };

  return (
    <Button
      onClick={toggleListening}
      className={`rounded-full w-12 h-12 p-0 transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20'
      }`}
      disabled={!isSupported}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
    </Button>
  );
};

export default VoiceInput;
