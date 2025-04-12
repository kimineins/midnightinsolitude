export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  persona?: Persona;
} 