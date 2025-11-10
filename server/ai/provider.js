import OpenAI from 'openai';
import { config } from '../config/env.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const MODEL = config.AI_MODEL;
const EMBEDDING_MODEL = config.EMBEDDING_MODEL;
const MAX_RETRIES = config.MAX_RETRIES;
const INITIAL_RETRY_DELAY = config.INITIAL_RETRY_DELAY;
const MAX_RETRY_DELAY = config.MAX_RETRY_DELAY;
const REQUEST_DELAY = config.REQUEST_DELAY;

/**
 * Retry function with exponential backoff with rate limit handling
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise}
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error.status || error.response?.status || error.statusCode;
      const code = error.code;
      const isRetryable = status === 429 ||
        (status >= 500 && status < 600) ||
        code === 'ECONNRESET' ||
        code === 'ETIMEDOUT';
      if (attempt === maxRetries || !isRetryable) {
        if (status) {
          error.status = status;
        }
        throw error;
      }
      const backoffDelay = Math.min(
        delay * Math.pow(2, attempt),
        MAX_RETRY_DELAY
      );
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffDelay}ms due to:`, status || code);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

/**
 * AI Provider abstraction layer
 */
export class AIProvider {
  /**
   * Moderation check with rate limit handling
   * @param {string} text - Text to moderate
   * @returns {Promise<{allowed: boolean, reasons: string[]}>}
   */
  async moderate(text) {
    return retryWithBackoff(async () => {
      try {
        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a content safety filter. Analyze the following text and return ONLY valid JSON with this exact structure:
{
  "allowed": boolean,
  "reasons": string[]
}
Return "allowed": false if the content contains abuse, harassment, hate speech, spam, or inappropriate content. Otherwise return "allowed": true. Keep reasons concise.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
          allowed: result.allowed === true,
          reasons: result.reasons || [],
        };
      } catch (error) {
        if (error.response) {
          error.status = error.response.status;
        }
        if (error.status === 429) {
          throw error;
        }
        console.error('Moderation error:', error);
        return { allowed: true, reasons: ['Moderation check failed'] };
      }
    });
  }

  /**
   * Extract intent, entities, urgency, and confidence with rate limit handling
   * @param {string} subject - Ticket subject
   * @param {string} message - Ticket message
   * @returns {Promise<{intent: string, entities: Record<string, string>, urgency: string, confidence: number}>}
   */
  async extractNLP(subject, message) {
    return retryWithBackoff(async () => {
      try {
        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are an NLP extraction system. Analyze the support ticket and return ONLY valid JSON with this exact structure:
{
  "intent": "billing" | "technical" | "account" | "other",
  "entities": { "key": "value" },
  "urgency": "low" | "normal" | "high",
  "confidence": 0.0-1.0
}
Intent categories:
- billing: payment, refund, subscription, invoice issues
- technical: bugs, API, integration, performance
- account: login, password, 2FA, profile settings
- other: anything else

Urgency: low (general questions), normal (standard support), high (urgent/critical issues)
Confidence: 0.0-1.0 based on how certain you are about the classification.`,
            },
            {
              role: 'user',
              content: `Subject: ${subject}\n\nMessage: ${message}`,
            },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0].message.content);

        const intent = ['billing', 'technical', 'account', 'other'].includes(result.intent)
          ? result.intent
          : 'other';

        const urgency = ['low', 'normal', 'high'].includes(result.urgency)
          ? result.urgency
          : 'normal';

        const confidence = Math.max(0, Math.min(1, parseFloat(result.confidence) || 0.5));

        return {
          intent,
          entities: result.entities || {},
          urgency,
          confidence,
          raw: response.choices[0].message.content,
        };
      } catch (error) {
        if (error.response) {
          error.status = error.response.status;
        }
        if (error.status === 429) {
          throw error;
        }
        console.error('NLP extraction error:', error);
        return {
          intent: 'other',
          entities: {},
          urgency: 'normal',
          confidence: 0.3,
          raw: JSON.stringify({ error: 'Extraction failed' }),
        };
      }
    });
  }

  /**
   * Generate embedding vector with rate limit handling
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>}
   */
  async embed(text) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    
    return retryWithBackoff(async () => {
      try {
        const response = await openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        if (error.response) {
          error.status = error.response.status;
        }
        throw error;
      }
    });
  }

  /**
   * Generate RAG answer using KB chunks with rate limit handling and error handling for RAG generation 
   * @param {string} question - User's question
   * @param {Array<{id: string, title: string, body: string, score: number}>} chunks - Top-k KB chunks
   * @param {string} systemHint - Optional system prompt hint
   * @returns {Promise<{answer: string, citations: string[]}>}
   */
  async generateRAGAnswer(question, chunks, systemHint = null) {
    return retryWithBackoff(async () => {
      try {
        if (chunks.length === 0) {
          return {
            answer: "I'm sorry, I couldn't find relevant information in our knowledge base. Could you please provide more details about your issue?",
            citations: [],
          };
        }

        const kbContext = chunks
          .map((chunk, idx) => `[KB-${chunk.id}]\nTitle: ${chunk.title}\nContent: ${chunk.body}`)
          .join('\n\n---\n\n');

        const systemPrompt = systemHint ||
          `You are a helpful support agent. Answer the user's question using ONLY the provided knowledge base excerpts. 
- Cite sources as [KB-ID] inline (e.g., "According to [KB-3], refunds are available...")
- If the KB doesn't fully answer the question, acknowledge this and ask 1 specific clarifying question.
- Keep answers concise (100-150 words).
- Be professional and friendly.`;

        const response = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Knowledge Base:\n\n${kbContext}\n\n---\n\nUser Question: ${question}`,
            },
          ],
          temperature: 0.3,
        });

        const answer = response.choices[0].message.content;
        const citations = chunks.map((c) => c.id);

        return {
          answer,
          citations,
        };
      } catch (error) {
        if (error.response) {
          error.status = error.response.status;
        }
        if (error.status === 429) {
          throw error;
        }
        console.error('RAG generation error:', error);
        return {
          answer: "I apologize, but I encountered an error generating a response. Please try again or contact support directly.",
          citations: [],
        };
      }
    });
  }
}

export const aiProvider = new AIProvider();

