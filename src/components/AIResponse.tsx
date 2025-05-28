
import React from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIResponseProps {
  message: Message;
}

const AIResponse: React.FC<AIResponseProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-md border ${
          message.isUser
            ? 'bg-blue-500/80 text-white border-blue-400/30 rounded-br-md'
            : 'bg-white/10 text-white border-white/20 rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className={`text-xs mt-2 ${
          message.isUser ? 'text-blue-100' : 'text-white/60'
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

export default AIResponse;
