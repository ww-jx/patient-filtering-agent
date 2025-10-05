'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ChatWidget.module.css';
import { Message, ChatApiResponse, SuggestedQuestion } from '@/lib/papers/chatTypes';
import { processPageReferences, handlePageNavigation, PAPER_SOURCE_CONFIGS, ParsedPaperId } from '@/lib/papers';

// Component to render markdown with clickable page references
const MarkdownWithPageLinks: React.FC<{ content: string }> = ({ content }) => {
  const handlePageClick = (pageNum: string) => {
    console.log('Page link clicked:', pageNum);
    handlePageNavigation(pageNum);
  };

  const processedContent = processPageReferences(content);
  
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, ...props }) => {
          const pageMatch = href?.match(/^#page-(\d+)$/);
          if (pageMatch) {
            const pageNum = pageMatch[1];
            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(pageNum);
                }}
                className={styles.pageLink}
                {...props}
              >
                {children}
              </a>
            );
          }
          return <a href={href} {...props}>{children}</a>;
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

// Component to render suggested questions
const SuggestedQuestions: React.FC<{ 
  questions: SuggestedQuestion[]; 
  onQuestionClick: (question: string) => void;
  isLoading: boolean;
}> = ({ questions, onQuestionClick, isLoading }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className={styles.suggestedQuestions}>
      <h4 className={styles.suggestedTitle}>Suggested questions:</h4>
      <div className={styles.questionsList}>
        {questions.map((question, index) => (
          <button
            key={index}
            className={styles.questionButton}
            onClick={() => onQuestionClick(question.text)}
            title={question.description}
            disabled={isLoading}
          >
            {question.text}
          </button>
        ))}
      </div>
    </div>
  );
};

interface ChatWidgetProps {
  paperId: string;
  parsedPaper: ParsedPaperId;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ paperId, parsedPaper }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sourceConfig = PAPER_SOURCE_CONFIGS[parsedPaper.source];

  const scrollToUserMessage = () => {
    const chatContainer = document.querySelector(`.${styles.messages}`);
    if (chatContainer) {
      const messageElements = chatContainer.querySelectorAll(`.${styles.message}`);
      if (messageElements.length >= 2) {
        const userMessage = messageElements[messageElements.length - 2] as HTMLElement;
        const containerRect = chatContainer.getBoundingClientRect();
        const messageRect = userMessage.getBoundingClientRect();
        const scrollTop = chatContainer.scrollTop + (messageRect.top - containerRect.top) - 20;
        
        chatContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSuggestedQuestionClick = async (question: string) => {
    if (isLoading || !paperId || !question.trim()) {
      return;
    }

    setMessage('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = messages
        .filter(msg => !msg.isBot || msg.id !== 'welcome')
        .concat(userMessage)
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user' as const,
          content: msg.text
        }));

      const response = await fetch('/api/papers/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          paperId: paperId,
          source: parsedPaper.source
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        let errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        if (errorData.details && !errorMessage.includes(errorData.details)) {
          errorMessage += ` - ${errorData.details}`;
        }
        throw new Error(errorMessage);
      }

      const data: ChatApiResponse = await response.json();
      if (!data.response && !data.structured) {
        throw new Error('No response from AI');
      }

      const messageText = data.structured?.content || data.response || '';
      const structuredData = data.structured;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        isBot: true,
        timestamp: new Date(),
        structured: structuredData
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Failed to get response. Please try again.',
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    if (messages.length >= 2) {
      setTimeout(scrollToUserMessage, 100);
    }
  }, [messages]);

  const handleWelcomeMessage = useCallback(async (welcomePrompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/papers/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: welcomePrompt
          }],
          paperId: paperId,
          source: parsedPaper.source
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(`Welcome message API error: ${errorMessage}`);
      }

      const data: ChatApiResponse = await response.json();
      
      const messageText = data.structured?.content || data.response || '';
      const structuredData = data.structured;
      
      if (!messageText) {
        throw new Error('Empty response from AI API');
      }
      
      setMessages([{
        id: 'welcome',
        text: messageText,
        isBot: true,
        timestamp: new Date(),
        structured: structuredData
      }]);
    } catch (error: unknown) {
      console.error('Welcome message error:', error);
      const fallbackMessage = `Welcome! I'm here to help you understand this ${sourceConfig.displayName} paper. \n\nAsk me anything about the paper!`;
      
      setMessages([{
        id: 'welcome',
        text: fallbackMessage,
        isBot: true,
        timestamp: new Date(),
        structured: {
          content: fallbackMessage,
          suggestedQuestions: [
            { text: "What is this paper about?", description: "Get an overview of the study" },
            { text: "What are the key findings?", description: "Learn about the main results" },
            { text: "What methodology was used?", description: "Understand the research methods" }
          ],
          responseType: 'welcome' as const
        }
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [paperId, parsedPaper.source, sourceConfig.displayName]);

  useEffect(() => {
    if (paperId && messages.length === 0) {
      const welcomeMessage = 'Please provide a welcome message for this paper with suggested questions I can ask about it.';
      handleWelcomeMessage(welcomeMessage);
    }
  }, [paperId, messages.length, handleWelcomeMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      
      if (!message.trim() || isLoading || !paperId) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isBot: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsLoading(true);
      setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const apiMessages = messages
        .filter(msg => !msg.isBot || msg.id !== 'welcome')
        .concat(userMessage)
        .map(msg => ({
          role: msg.isBot ? 'assistant' : 'user' as const,
          content: msg.text
        }));

      const response = await fetch('/api/papers/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          paperId: paperId,
          source: parsedPaper.source
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        let errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        if (errorData.details && !errorMessage.includes(errorData.details)) {
          errorMessage += ` - ${errorData.details}`;
        }
        throw new Error(errorMessage);
      }

      const data: ChatApiResponse = await response.json();
      if (!data.response && !data.structured) {
        throw new Error('No response from AI');
      }

      const messageText = data.structured?.content || data.response || '';
      const structuredData = data.structured;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        isBot: true,
        timestamp: new Date(),
        structured: structuredData
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'Failed to get response. Please try again.',
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    } catch (unexpectedError: unknown) {
      console.error('Unexpected error in handleSubmit:', unexpectedError);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: unexpectedError instanceof Error ? unexpectedError.message : 'An unexpected error occurred. Please try refreshing the page.',
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className={styles.headerTitle}>
              <a 
                href="https://www.giraffeguru.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.arxivLink}
              >
                GiraffeGuru
              </a>
              {' '}AI Assistant
            </h2>
            <p className={styles.headerSubtitle}>
              {paperId ? (
              <a 
                href={`${sourceConfig.baseUrl}/${parsedPaper.source === 'arxiv' ? 'abs' : 'content'}/${paperId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.arxivLink}
              >
                {sourceConfig.displayName}:{paperId}
              </a>
              ) : (
                'No paper selected'
              )}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.messages} role="log" aria-live="polite">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.message} ${msg.isBot ? styles.bot : styles.user} ${msg.isError ? styles.error : ''}`}
            role={msg.isBot ? 'assistant' : 'user'}
          >
            {msg.isBot ? (
              <>
                <MarkdownWithPageLinks content={msg.text} />
                {msg.structured?.suggestedQuestions && (
                  <SuggestedQuestions 
                    questions={msg.structured.suggestedQuestions}
                    onQuestionClick={handleSuggestedQuestionClick}
                    isLoading={isLoading}
                  />
                )}
              </>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.bot} ${styles.loading}`}>
            <span className={styles.loadingDots}>●●●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "AI is typing..." : "Type a message…"}
          className={styles.input}
          aria-label="Type your message"
          disabled={isLoading || !paperId}
        />
        <button 
          type="submit" 
          className={styles.sendButton} 
          aria-label="Send message"
          disabled={isLoading || !message.trim() || !paperId}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
