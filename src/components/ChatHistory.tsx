import React from 'react';
import { Message } from '@/types/chat';

interface ChatHistoryProps {
  messages: Message[];
  onSelectMessage: (message: string) => void;
}

export function ChatHistory({ messages, onSelectMessage }: ChatHistoryProps) {
  return (
    <div className="space-y-2 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="p-3 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] cursor-pointer"
          onClick={() => onSelectMessage(message.content)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#A0A0A0]">
              {message.persona?.name || 'User'}
            </span>
            <span className="text-xs text-[#606060]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-[#E0E0E0] line-clamp-2">{message.content}</p>
        </div>
      ))}
    </div>
  );
} 