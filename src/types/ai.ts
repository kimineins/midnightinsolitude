export interface AIPersona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  persona: {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
  };
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
} 