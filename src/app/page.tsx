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

  const detectPersona = (content: string): AIPersona | null => {
    const lowerContent = content.toLowerCase();
    for (const persona of defaultPersonas) {
      if (lowerContent.includes(persona.name.toLowerCase())) {
        return persona;
      }
    }
    return null;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      persona: selectedPersona,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // 모든 페르소나에게 동시에 메시지 전송
    const messagePromises = defaultPersonas.map(async (persona) => {
      const formattedMessages = [
        {
          role: 'system',
          content: persona.systemPrompt,
        },
        {
          role: 'user',
          content: content,
        },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: formattedMessages,
            persona: persona,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        let aiMessage = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                const aiResponse: Message = {
                  id: Date.now().toString(),
                  content: aiMessage,
                  role: 'assistant',
                  timestamp: new Date().toISOString(),
                  persona: persona,
                };
                setMessages((prev) => [...prev, aiResponse]);
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  aiMessage += parsed.choices[0].delta.content;
                  setCurrentStream(aiMessage);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });

    try {
      await Promise.all(messagePromises);
    } catch (error) {
      console.error('Error in message promises:', error);
    } finally {
      setIsLoading(false);
      setCurrentStream('');
    }
  };

  return (
    <main className="flex min-h-screen bg-[#1A1A1A] text-white">
      <div className="flex-1 flex">
        {/* 메인 채팅 영역 */}
        <div className="flex-1 flex flex-col relative">
          {/* 헤더 */}
          <header className="border-b border-[#2A2A2A] p-4 flex justify-between items-center bg-[#1A1A1A]">
            <h1 className="text-xl font-bold text-[#A0A0A0]">Midnight in Solitude</h1>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 bg-[#2A2A2A] rounded hover:bg-[#3A3A3A] flex items-center gap-2 text-[#A0A0A0]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              대화 기록
            </button>
          </header>

          {/* 페르소나별 채팅 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 니체 영역 */}
            <div className="flex-1 border-b border-[#2A2A2A] p-4 bg-[#1A1A1A]">
              <div className="font-bold text-lg mb-2 text-[#A0A0A0]">니체</div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {messages
                  .filter(msg => msg.personaId === '1')
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded ${
                        message.role === 'user'
                          ? 'bg-[#2A2A2A] ml-4'
                          : 'bg-[#3A3A3A] mr-4'
                      }`}
                    >
                      <p className="text-sm text-[#E0E0E0]">{message.content}</p>
                    </div>
                  ))}
                {isLoading && currentStream && selectedPersona.id === '1' && (
                  <div className="p-3 rounded bg-[#3A3A3A] mr-4">
                    <p className="text-sm text-[#E0E0E0]">{currentStream}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 파인만 영역 */}
            <div className="flex-1 border-b border-[#2A2A2A] p-4 bg-[#1A1A1A]">
              <div className="font-bold text-lg mb-2 text-[#A0A0A0]">파인만</div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {messages
                  .filter(msg => msg.personaId === '2')
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded ${
                        message.role === 'user'
                          ? 'bg-[#2A2A2A] ml-4'
                          : 'bg-[#3A3A3A] mr-4'
                      }`}
                    >
                      <p className="text-sm text-[#E0E0E0]">{message.content}</p>
                    </div>
                  ))}
                {isLoading && currentStream && selectedPersona.id === '2' && (
                  <div className="p-3 rounded bg-[#3A3A3A] mr-4">
                    <p className="text-sm text-[#E0E0E0]">{currentStream}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 지젝 영역 */}
            <div className="flex-1 border-b border-[#2A2A2A] p-4 bg-[#1A1A1A]">
              <div className="font-bold text-lg mb-2 text-[#A0A0A0]">지젝</div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {messages
                  .filter(msg => msg.personaId === '3')
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded ${
                        message.role === 'user'
                          ? 'bg-[#2A2A2A] ml-4'
                          : 'bg-[#3A3A3A] mr-4'
                      }`}
                    >
                      <p className="text-sm text-[#E0E0E0]">{message.content}</p>
                    </div>
                  ))}
                {isLoading && currentStream && selectedPersona.id === '3' && (
                  <div className="p-3 rounded bg-[#3A3A3A] mr-4">
                    <p className="text-sm text-[#E0E0E0]">{currentStream}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 사용자 입력 영역 */}
            <div className="border-t border-[#2A2A2A] p-4 bg-[#1A1A1A]">
              <UserChat onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* 채팅 히스토리 사이드바 */}
        <ChatHistory
          messages={messages}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </div>
    </main>
  );
} 