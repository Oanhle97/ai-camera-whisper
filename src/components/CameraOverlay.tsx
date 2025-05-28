
import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceInput from './VoiceInput';
import AIResponse from './AIResponse';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const CameraOverlay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const handleVoiceStart = () => {
    console.log('Voice input started - turning camera on');
    setIsCameraOn(true);
  };

  const handleVoiceEnd = () => {
    console.log('Voice input ended - will turn camera off after response');
  };

  const handleSendMessage = async (text: string, isVoiceInput = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput('');
    setIsLoading(true);

    // If this is from voice input, set up delayed response and camera turn off
    if (isVoiceInput) {
      responseTimeoutRef.current = setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAIResponse(text),
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Turn off camera after response
        setTimeout(() => {
          console.log('Turning camera off after response');
          setIsCameraOn(false);
        }, 1000);
      }, 2000);
    } else {
      // Immediate response for text input
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: generateAIResponse(text),
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 2000);
    }
  };

  const generateAIResponse = (question: string): string => {
    const responses = [
      "I can see what appears to be a modern indoor environment. Could you be more specific about what you'd like to know?",
      "Based on the visual input, I notice various objects and lighting. What particular aspect interests you?",
      "I'm analyzing the visual elements in your camera feed. The lighting suggests this is an indoor setting.",
      "I can observe the scene through your camera. What specific information are you looking for?",
      "The camera shows an interesting view. Could you clarify what you'd like me to help you identify or understand?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleVoiceResult = (text: string) => {
    handleSendMessage(text, true);
  };

  const toggleContinuousMode = () => {
    setIsContinuousMode(!isContinuousMode);
    if (!isContinuousMode) {
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Camera Feed */}
      {isCameraOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-white text-lg">Camera is off</p>
          </div>
        </div>
      )}
      
      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40">
        
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isContinuousMode ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-white font-medium">
                {isContinuousMode ? 'Continuous AI Listening' : 'AI Vision Active'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleContinuousMode}
                size="sm"
                className={`${
                  isContinuousMode 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                {isContinuousMode ? 'Auto ON' : 'Auto OFF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="absolute top-20 left-4 right-4 bottom-32 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-3 pb-4">
            {messages.map((message) => (
              <AIResponse key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-white/70 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask about what you see..."
                className="bg-transparent border-none text-white placeholder-white/60 focus:ring-0 rounded-full px-6"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(textInput)}
              />
            </div>
            
            <VoiceInput
              isListening={isListening || isContinuousMode}
              onListeningChange={setIsListening}
              onResult={handleVoiceResult}
              onVoiceStart={handleVoiceStart}
              onVoiceEnd={handleVoiceEnd}
            />
            
            <Button
              onClick={() => handleSendMessage(textInput)}
              disabled={!textInput.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 rounded-full w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Camera Toggle Button */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button
            onClick={toggleCamera}
            className={`${
              isCameraOn 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-red-500 hover:bg-red-600'
            } backdrop-blur-md rounded-lg p-3 border border-white/20`}
          >
            {isCameraOn ? (
              <Camera className="w-6 h-6 text-white" />
            ) : (
              <CameraOff className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraOverlay;
