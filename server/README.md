# Backend Server

This is the backend API server for the AI Support Triage System.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory (not in server/) with:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/tickets.db
ADMIN_TOKEN=admin-bearer-token-change-me
OPENAI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
RAG_TOP_K=3
RAG_SIMILARITY_THRESHOLD=0.7
LOW_CONFIDENCE_THRESHOLD=0.6
```

## Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database
npm run seed

# Run tests
npm test
```

## Project Structure

```
server/
├── index.js          # Express server entry point
├── db/               # Database setup and queries
├── routes/           # API route handlers
├── middleware/       # Auth and error handling
├── ai/               # AI provider abstraction
├── scripts/          # Utility scripts (seed, etc.)
└── tests/            # Test files
```

## API

See the root `API.md` for complete API documentation.

The server runs on `http://localhost:3001` by default.

