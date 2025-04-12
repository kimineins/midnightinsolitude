import { Message } from '../types/ai';

interface PersonaChatProps {
  personaName: string;
  messages: Message[];
  currentStream: string;
  isLoading: boolean;
}

export function PersonaChat({ personaName, messages, currentStream, isLoading }: PersonaChatProps) {
  return (
    <div className="flex-1 border-b p-4 flex flex-col">
      <div className="font-bold text-lg mb-2">{personaName}</div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-4'
                : 'bg-gray-100 mr-4'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        {isLoading && currentStream && (
          <div className="p-2 rounded-lg bg-gray-100 mr-4">
            <p className="text-sm">{currentStream}</p>
          </div>
        )}
      </div>
    </div>
  );
} 