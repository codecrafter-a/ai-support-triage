import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration with defaults
 */
export const config = {
  // Server
  PORT: parseInt(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DB_PATH: process.env.DB_PATH || '../../data/tickets.db',
  
  // Authentication
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'admin-bearer-token-change-me',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  
  // AI Configuration
  LOW_CONFIDENCE_THRESHOLD: parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD) || 0.6,
  RAG_TOP_K: parseInt(process.env.RAG_TOP_K) || 3,
  RAG_SIMILARITY_THRESHOLD: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.5,
  RAG_FALLBACK_THRESHOLD: parseFloat(process.env.RAG_FALLBACK_THRESHOLD) || 0.3,
  
  // Retry Configuration
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3,
  INITIAL_RETRY_DELAY: parseInt(process.env.INITIAL_RETRY_DELAY) || 2000,
  MAX_RETRY_DELAY: parseInt(process.env.MAX_RETRY_DELAY) || 60000,
  REQUEST_DELAY: parseInt(process.env.REQUEST_DELAY) || 1000,
  
  // Request Limits
  JSON_LIMIT: process.env.JSON_LIMIT || '10mb',
};

// Validate required environment variables
if (!config.OPENAI_API_KEY && config.NODE_ENV === 'production') {
  console.warn('WARNING: OPENAI_API_KEY is not set. AI features will not work.');
}

