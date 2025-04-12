import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIPersona } from '@/types/ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages, persona } = await req.json();
    console.log('Received request:', { messages, persona });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    console.log('Formatted messages:', formattedMessages);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: formattedMessages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 