import React, { useState } from 'react';

interface UserChatProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function UserChat({ onSendMessage, isLoading }: UserChatProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="       메시지를 입력하세요..."
        className="flex-1 p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-2xl text-[#E0E0E0] placeholder-[#606060] focus:outline-none focus:border-[#4A4A4A] text-base min-h-[60px]"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-4 bg-[#2A2A2A] text-[#A0A0A0] rounded-2xl hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {isLoading ? '전송 중...' : '전송'}
      </button>
    </form>
  );
} 