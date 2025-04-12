import React, { useState } from 'react';
import { Message, AIPersona } from '../types/ai';

interface ChatProps {
  persona: AIPersona;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  currentStream: string;
  defaultPersonas: AIPersona[];
}

export function Chat({ persona, messages, onSendMessage, isLoading, currentStream, defaultPersonas }: ChatProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{persona.name}</h2>
        <p className="text-sm text-gray-600">{persona.description}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' 
                  ? '나' 
                  : defaultPersonas.find(p => p.id === message.personaId)?.name || 'AI'}: 
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && currentStream && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200 text-gray-800">
              <div className="font-semibold mb-1">{persona.name}:</div>
              <p className="whitespace-pre-wrap">{currentStream}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
} 