import React from 'react';
import { Message } from '@/types/chat';

interface ChatHistoryProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-80 bg-[#1A1A1A] shadow-lg">
        <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#A0A0A0]">대화 기록</h2>
          <button
            onClick={onClose}
            className="text-[#A0A0A0] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-[#2A2A2A] ${
                message.role === 'user' ? 'bg-[#2A2A2A]' : 'bg-[#1A1A1A]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-[#A0A0A0]">
                  {message.role === 'user' ? '나' : message.persona?.name || 'AI'}
                </span>
                <span className="text-xs text-[#666666]">
                  {new Date(message.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[#E0E0E0]">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 