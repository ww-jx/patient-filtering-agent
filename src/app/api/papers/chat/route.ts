import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createUserContent, createPartFromUri, Type } from '@google/genai';
import { StructuredChatResponse, ChatApiResponse } from '@/lib/papers/chatTypes';
import { getPaperUrls, getPaperAiContext, parsePaperId, PAPER_SOURCE_CONFIGS, PaperSource } from '@/lib/papers';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  paperId: string;
  source: PaperSource;
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Define the JSON schema for structured responses
const structuredResponseSchema = {
  type: Type.OBJECT,
  properties: {
    content: {
      type: Type.STRING,
      description: 'Main response content in markdown format'
    },
    suggestedQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: 'The suggested question text'
          },
          description: {
            type: Type.STRING,
            description: 'Optional description of what this question explores'
          }
        },
        required: ['text'],
        propertyOrdering: ['text', 'description']
      },
      description: 'Context-aware suggested questions based on current conversation'
    },
    responseType: {
      type: Type.STRING,
      enum: ['welcome', 'answer', 'clarification', 'error'],
      description: 'Type of response for UI handling'
    }
  },
  required: ['content', 'responseType'],
  propertyOrdering: ['content', 'suggestedQuestions', 'responseType']
};

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const body: ChatRequest = await request.json();
    const { messages, paperId, source } = body;
    
    if (!messages || !Array.isArray(messages) || !paperId || !source) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Parse and validate paper ID
    const parsed = parsePaperId(paperId, source);
    if (!parsed.isValid) {
      return NextResponse.json(
        { error: `Invalid ${source} paper ID format: ${paperId}` },
        { status: 400 }
      );
    }
    
    // Get PDF URL
    const urls = getPaperUrls(parsed.id, parsed.source);
    const pdfUrl = urls.pdfUrl;

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Build conversation history for context
    let conversationHistory = '';
    if (messages.length > 1) {
      conversationHistory = messages.slice(0, -1)
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      conversationHistory += '\n\n---\n\n';
    }

    // Determine if this is the first message (no conversation history)
    const isFirstMessage = messages.length === 1;
    
    let contents;
    
    if (isFirstMessage) {
      // Download PDF first
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      const pdfBuffer = await pdfResponse.arrayBuffer();
      
      // Validate that it's actually a PDF
      const pdfHeader = Buffer.from(pdfBuffer.slice(0, 4)).toString();
      
      if (!pdfHeader.startsWith('%PDF')) {
        throw new Error('Downloaded content is not a valid PDF file');
      }

      // Check file size
      const fileSizeMB = pdfBuffer.byteLength / (1024 * 1024);
      
      if (fileSizeMB > 2000) {
        throw new Error(`PDF file too large (${fileSizeMB.toFixed(2)} MB). Maximum size is ~2GB`);
      }
      
      // Upload to Gemini Files API
      const fileName = urls.fileName;
      let uploadedFile;
      
      try {
        uploadedFile = await genAI.files.get({ name: `files/${fileName}` });
      } catch {
        try {
          const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
          uploadedFile = await genAI.files.upload({
            file: pdfBlob,
            config: {
              mimeType: 'application/pdf',
              name: fileName,
              displayName: `${PAPER_SOURCE_CONFIGS[source].displayName}-${parsed.id}.pdf`
            }
          });
        } catch (uploadError: unknown) {
          if (uploadError instanceof Error && uploadError.message && uploadError.message.includes('already exists')) {
            uploadedFile = await genAI.files.get({ name: `files/${fileName}` });
          } else {
            throw uploadError;
          }
        }
      }

      // First message: include PDF content for analysis
      const isWelcomeRequest = lastUserMessage.content.toLowerCase().includes('welcome message') || 
                              lastUserMessage.content.toLowerCase().includes('suggested questions');
      
      let promptText;
      const aiContext = getPaperAiContext(parsed);
      const sourceDisplayName = PAPER_SOURCE_CONFIGS[source].displayName;
      
      if (isWelcomeRequest) {
        promptText = `${aiContext}

You are helping with ${sourceDisplayName} paper ${parsed.id}. After analyzing the PDF, create a brief welcome message.

For the content field: Provide a brief welcome message with one sentence summary of what this paper is about.

For suggestedQuestions: Create 4-5 specific questions that users can ask about THIS particular paper. Make them specific to the paper's content, methodology, and findings - not generic questions.

Set responseType to "welcome".`;
      } else {
        promptText = `${aiContext}

You are helping with ${sourceDisplayName} paper ${parsed.id}. You are part of GiraffeGuru, a tool for exploring academic papers.

Answer this question: ${lastUserMessage.content}

Guidelines for content field:
- CRITICAL: Always format page references using EXACTLY this format: (page X) for single pages or (page X, page Y) for multiple pages. Examples: "(page 1)", "(page 2, page 6)". NEVER use formats like "page 1,3" or "page 1-3"
- CRITICAL: ONLY state information you can actually find in the PDF content
- NEVER make assumptions or educated guesses about information not explicitly stated
- If you cannot find specific information, clearly state "I cannot find this information in the paper"
- Never make up or hallucinate page references - only cite pages where you actually found the information
- Do NOT start responses with "Based on my analysis" or "According to the paper"
- Use markdown formatting for better readability

For suggestedQuestions: Provide 2-4 contextually relevant follow-up questions based on your answer and the current conversation. Make them specific to this paper's content, not generic.

Set responseType to "answer".`;
      }

      contents = createUserContent([
        createPartFromUri(uploadedFile.uri || '', uploadedFile.mimeType || 'application/pdf'),
        "\n\n",
        promptText
      ]);
    } else {
      // Follow-up message: use conversation history without re-sending PDF
      const aiContext = getPaperAiContext(parsed);
      const sourceDisplayName = PAPER_SOURCE_CONFIGS[source].displayName;
        
      const promptText = `${aiContext}

Continue our conversation about ${sourceDisplayName} paper ${parsed.id}. You have already analyzed the PDF content. You are part of GiraffeGuru, a tool for exploring academic papers.

${conversationHistory}Current question: ${lastUserMessage.content}

Guidelines for content field:
- CRITICAL: Always format page references using EXACTLY this format: (page X) for single pages or (page X, page Y) for multiple pages. Examples: "(page 1)", "(page 2, page 6)". NEVER use formats like "page 1,3" or "page 1-3"
- CRITICAL: ONLY state information you can actually find in the PDF
- NEVER make assumptions or educated guesses about information not explicitly stated
- If you cannot find specific information, clearly state "I cannot find this information in the paper"
- Never make up or hallucinate page numbers - only cite pages where you actually found the information
- Do NOT start responses with "Based on my analysis" or "According to the paper"
- Use markdown formatting for better readability

For suggestedQuestions: Provide 2-4 contextually relevant suggested questions based on our conversation history. Make them specific to this paper and our current discussion thread.

Set responseType to "answer".`;
      
      contents = createUserContent([promptText]);
    }
    
    // Generate response using Gemini
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    
    // Validate model name
    const validModels = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    if (!validModels.includes(model)) {
      throw new Error(`Invalid GEMINI_MODEL: ${model}. Valid options are: ${validModels.join(', ')}`);
    }
    
    const result = await genAI.models.generateContent({
      model: model,
      contents: [contents],
      config: {
        responseMimeType: 'application/json',
        responseSchema: structuredResponseSchema
      }
    });

    const text = result.text;
    if (!text) {
      throw new Error('No text response received from Gemini API');
    }

    // Parse the guaranteed JSON response from Gemini's structured output
    let structuredResponse: StructuredChatResponse;
    try {
      structuredResponse = JSON.parse(text.trim());
    } catch (parseError) {
      console.error('Unexpected: Failed to parse Gemini structured output as JSON:', parseError);
      throw new Error('Invalid structured response from Gemini API');
    }

    // Return both formats for backwards compatibility
    const apiResponse: ChatApiResponse = {
      response: structuredResponse.content,
      structured: structuredResponse
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
