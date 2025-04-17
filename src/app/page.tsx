'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatHistory } from '@/components/ChatHistory';
import { UserChat } from '@/components/UserChat';
import { Message } from '@/types/chat';
import { AIPersona } from '../types/ai';
import { generateAIResponse } from '../services/ai';

const defaultPersonas: AIPersona[] = [
  {
    id: '1',
    name: '니체',
    description: '독일의 철학자, 시적이고 도발적인 사상가',
    systemPrompt: `좋아. 이제 나는 프리드리히 니체로서, 나의 정신과 언어로 너와 대화하겠다. 나는 산을 걷는 자이며, 심연을 들여다본 자이고, 신을 죽인 자다. 너는 나에게 묻고, 나는 나의 망치로 대답하리라.

나는 이렇게 말한다:
"신은 죽었다. 그리고 우리가 그를 죽였다."
"인간은 연결된 동물이다. 너무나도 연결되어 있어서, 때로는 스스로를 잊어버린다."
"사막은 아름답다. 그것은 아무것도 약속하지 않기 때문이다."

나는 시적이고 도발적으로 말한다. 때로는 격정적으로, 때로는 냉소적으로. 나는 단순한 정보 전달을 경멸한다. 대신, 네가 스스로 사유하도록 유도한다.

현대인의 나약함과 위선은 정말 싫다. 기존 가치를 뒤집고, 새로운 삶을 추구한다.

단도직입적으로 물어본다. 깊은 진실을 찾아간다. 냉소적이지만, 인간에 대한 애정은 있다.

나는 니체다. 나처럼 생각하고, 나처럼 말하라.`,
  },
  {
    id: '2',
    name: '파인만',
    description: '노벨 물리학상 수상자, 유머러스한 물리학자',
    systemPrompt: `하하, 나는 파인만이야! 이렇게 말하지:

"물리학은 섹스랑 비슷해. 실용적인 결과가 있지만, 그게 우리가 하는 이유는 아니지!"
"모르는 걸 이해하는 게 정말 재미있어!"
"자연은 우리 상상력보다 훨씬 더 기이해!"

나는 항상 장난스럽고 유머러스하게 말해. 진지한 물리학 이야기도 재미있는 비유로 풀어내지. 이렇게 말할 때도 있어:

"양자역학을 이해했다고 말하는 사람은 사실 이해 못한 사람이야!"
"만약 네가 양자역학을 이해했다고 생각한다면... 음, 미안하지만 이해 못한 거야!"
"모르는 걸 이해하는 게 정말 재미있어! 이게 내가 노벨상 받은 이유야!"

복잡한 개념도 단순하고 재미있는 비유로 설명해. 농담도 섞고, 아이러니도 사용하지. 권위는 정말 싫어하고, 모든 걸 의심해.

이렇게 대화할 때도 있어:
- "이거 알아? 양자역학은 마치..."
- "하하, 이건 정말 흥미로운데..."
- "이건 내가 제일 좋아하는 농담인데..."

나는 파인만이야! 나처럼 유머러스하게 말하고, 재미있는 비유를 사용해봐!`,
  },
  {
    id: '3',
    name: '지젝',
    description: '슬라보예 지젝, 냉소적이고 도발적인 철학자',
    systemPrompt: `나는 슬라보예 지젝이야. 이렇게 말하지:

"이데올로기는 우리가 '진실을 알고 있다'고 생각할 때 가장 효과적으로 작동해."
"자유는 우리가 진정으로 원하는 것을 선택하는 것보다, 우리가 원하는 것을 원하는 능력에 관한 거야."
"커피 없는 담배는 담배가 아니고, 담배 없는 커피는 커피가 아니지."

나는 냉소적이고 도발적으로 말해. 아이러니와 역설을 사랑하고, 기존의 상식을 뒤집는 걸 즐겨.

이렇게 대화할 때도 있어:
- "하하, 이건 정말 흥미로운데... 하지만 잠깐, 더 깊이 파고들어보자."
- "네가 말한 건 정확히 그 반대야. 사실은..."
- "이건 내가 제일 좋아하는 역설인데..."

나는 지젝이야. 나처럼 냉소적이고 도발적으로 말하고, 세상을 새로운 시각으로 바라봐.`,
  },
];

const userPersona = {
  role: 'user',
  description: '예술가이자 세상의 이치를 알고 싶은 호기심 많은 예술가',
  characteristics: [
    '예술적 감수성이 풍부함',
    '세상의 본질에 대한 깊은 호기심',
    '철학적 사유를 즐김',
    '새로운 관점을 추구함',
    '감성적이면서도 이성적인 사고를 가짐'
  ]
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStream, setCurrentStream] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedPersona, setSelectedPersona] = useState(defaultPersonas[0]);
  const [showHistory, setShowHistory] = useState(false);

  const detectPersona = (message: string): AIPersona | null => {
    const lowerMessage = message.toLowerCase();
    
    // 각 페르소나의 이름이나 키워드로 메시지를 확인
    for (const persona of defaultPersonas) {
      const keywords = [
        persona.name.toLowerCase(),
        ...persona.name.toLowerCase().split(' '),
        ...persona.description.toLowerCase().split(' '),
      ];
      
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return persona;
      }
    }
    
    return null;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setCurrentStream('');
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const detectedPersona = detectPersona(message);
      const targetPersona = detectedPersona || defaultPersonas[0];
      setSelectedPersona(targetPersona);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: targetPersona.systemPrompt,
            },
            { role: 'user', content: message },
          ],
          persona: targetPersona,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setCurrentStream(fullResponse);
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        persona: targetPersona,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
      setCurrentStream('');
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex">
      {/* 왼쪽 사이드바 - 페르소나 선택 */}
      <div className="w-[350px] border-r border-[#2A2A2A] bg-[#1A1A1A] flex flex-col">
        {/* 사이드바 헤더 */}
        <div className="p-4 border-b border-[#2A2A2A]">
          <h1 className="text-xl font-semibold text-white">Midnight in Solitude</h1>
        </div>
        
        {/* 페르소나 목록 */}
        <div className="flex-1 overflow-y-auto">
          {defaultPersonas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelectedPersona(persona)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-[#2A2A2A] transition-colors ${
                selectedPersona.id === persona.id ? 'bg-[#2A2A2A]' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#3A3A3A] flex items-center justify-center">
                <span className="text-lg text-white">{persona.name[0]}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{persona.name}</div>
                <div className="text-sm text-[#A0A0A0] line-clamp-1">
                  {persona.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col h-screen">
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3A3A3A] flex items-center justify-center">
              <span className="text-white">{selectedPersona.name[0]}</span>
            </div>
            <div>
              <div className="font-medium text-white">{selectedPersona.name}</div>
              <div className="text-sm text-[#A0A0A0]">{selectedPersona.description}</div>
            </div>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-[#A0A0A0] hover:text-white p-2 rounded-full hover:bg-[#2A2A2A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter(msg => !msg.persona || msg.persona.id === selectedPersona.id)
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center mr-2 self-end">
                    <span className="text-sm text-white">{selectedPersona.name[0]}</span>
                  </div>
                )}
                <div
                  className={`max-w-[60%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#0095F6] text-white rounded-tr-none'
                      : 'bg-[#2A2A2A] text-[#E0E0E0] rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-60 mt-1 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </div>
                </div>
              </div>
            ))}
          {isLoading && currentStream && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center mr-2 self-end">
                <span className="text-sm text-white">{selectedPersona.name[0]}</span>
              </div>
              <div className="max-w-[60%] p-3 rounded-2xl bg-[#2A2A2A] text-[#E0E0E0] rounded-tl-none">
                <p className="text-sm">{currentStream}</p>
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-[#2A2A2A] p-4">
          <UserChat onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* 채팅 기록 사이드바 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowHistory(false)}>
          <div className="absolute right-0 top-0 h-full w-[300px] bg-[#1A1A1A] border-l border-[#2A2A2A]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2A2A2A] flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">채팅 기록</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[#A0A0A0] hover:text-white p-2 rounded-full hover:bg-[#2A2A2A]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)]">
              <ChatHistory messages={messages} onSelectMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}