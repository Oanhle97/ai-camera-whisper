
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

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Voice recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice result:', transcript);
        onResult(transcript);
        onListeningChange(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        onListeningChange(false);
      };

      recognitionRef.current.onend = () => {
        console.log('Voice recognition ended');
        onListeningChange(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult, onListeningChange]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      onListeningChange(false);
    } else {
      recognitionRef.current?.start();
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
