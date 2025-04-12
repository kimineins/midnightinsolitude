import OpenAI from 'openai';
import { AIPersona } from '@/types/ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages, persona } = await request.json();
    console.log('Received request:', { messages, persona });

    if (!messages || !persona) {
      throw new Error('Invalid request: messages and persona are required');
    }

    const formattedMessages = [
      { role: 'system', content: persona.systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    console.log('Formatted messages:', formattedMessages);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log('OpenAI response received');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.choices[0].delta.content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
    }
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 