import { Message } from '../types/ai';

interface ChatHistoryProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistory({ messages, isOpen, onClose }: ChatHistoryProps) {
  return (
    <>
      {/* 사이드바 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* 사이드바 */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-[#1A1A1A] shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ right: isOpen ? '0' : '-320px' }}
      >
        <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#A0A0A0]">대화 기록</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded text-[#A0A0A0] hover:text-[#E0E0E0]"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="mb-4 p-3 rounded bg-[#2A2A2A]"
            >
              <div className="text-sm font-semibold mb-1 text-[#A0A0A0]">
                {message.role === 'user' ? '나' : message.persona?.name}
              </div>
              <p className="text-sm text-[#E0E0E0]">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 