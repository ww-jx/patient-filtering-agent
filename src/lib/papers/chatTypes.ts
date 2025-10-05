/**
 * Chat types for paper AI assistant
 * Adapted from asxiv/src/types/chat.ts
 */

export interface SuggestedQuestion {
  text: string;
  description?: string;
}

export interface StructuredChatResponse {
  content: string;
  suggestedQuestions?: SuggestedQuestion[];
  responseType?: 'welcome' | 'answer' | 'clarification' | 'error';
}

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isError?: boolean;
  structured?: StructuredChatResponse;
}

export interface ChatApiResponse {
  response?: string;
  structured?: StructuredChatResponse;
}
