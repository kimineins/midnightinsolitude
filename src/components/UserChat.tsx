import React, { useState, useRef, useEffect } from 'react';

interface UserChatProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function UserChat({ onSendMessage, isLoading }: UserChatProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        className="flex-1 bg-[#2A2A2A] text-white px-6 py-4 rounded-lg text-lg min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#4A4A4A]"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-[#3A3A3A] text-white px-6 py-4 rounded-lg text-lg hover:bg-[#4A4A4A] disabled:opacity-50"
      >
        {isLoading ? '전송 중...' : '전송'}
      </button>
    </form>
  );
} 