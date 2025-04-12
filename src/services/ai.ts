import { AIPersona } from '@/types/ai';

export const generateAIResponse = async (
  message: string,
  persona: AIPersona
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: persona.systemPrompt,
          },
          { role: 'user', content: message },
        ],
        persona,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullResponse += chunk;
    }

    return fullResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}; 