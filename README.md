# AI Support Triage System

An intelligent support ticket management system powered by OpenAI GPT, featuring automatic ticket classification, content moderation, and RAG (Retrieval-Augmented Generation) for knowledge base-powered responses.

## 🚀 Features

- **AI-Powered Ticket Classification**: Automatically categorizes tickets by intent (billing, technical, account, other) and urgency
- **Content Moderation**: Built-in content safety filtering using AI
- **RAG-Based Answers**: Generates contextual responses using knowledge base articles
- **Knowledge Base Management**: Create, search, and manage KB articles with vector embeddings
- **Admin Dashboard**: Full-featured React admin panel for ticket management
- **Real-time Processing**: Immediate ticket analysis and response generation
- **Modular Architecture**: Clean, maintainable codebase with separation of concerns

## 📋 Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** with better-sqlite3
- **OpenAI API** (GPT-4o-mini, text-embedding-3-small)
- **Vector Search** for semantic KB article retrieval

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **Axios** for API communication

## 🏗️ Project Structure

```
├── server/                 # Backend API server
│   ├── config/            # Configuration and constants
│   ├── controllers/       # Request handlers (functional)
│   ├── services/          # Business logic layer
│   ├── validators/         # Input validation
│   ├── routes/            # Express routes
│   ├── middleware/        # Auth and error handling
│   ├── ai/                # AI provider and vector search
│   ├── db/                # Database setup
│   ├── utils/             # Utility functions
│   └── scripts/           # Utility scripts
│
└── web/                   # Frontend React application
    ├── src/
    │   ├── components/    # React components
    │   │   └── shared/   # Reusable UI components
    │   ├── constants.js  # Static text and data
    │   ├── utils.jsx     # Utility functions
    │   └── api.js        # API client
    └── ...
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-support-triage
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Authentication
   ADMIN_TOKEN=your-secure-admin-token-here
   
   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-openai-api-key-here
   AI_MODEL=gpt-4o-mini
   EMBEDDING_MODEL=text-embedding-3-small
   
   # RAG Configuration
   RAG_TOP_K=3
   RAG_SIMILARITY_THRESHOLD=0.5
   RAG_FALLBACK_THRESHOLD=0.3
   LOW_CONFIDENCE_THRESHOLD=0.6
   
   # Retry Configuration (optional)
   MAX_RETRIES=3
   INITIAL_RETRY_DELAY=2000
   MAX_RETRY_DELAY=60000
   REQUEST_DELAY=1000
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This starts both the backend (port 3001) and frontend (port 5173) concurrently.

### Running Separately

**Backend only:**
```bash
cd server
npm run dev
```

**Frontend only:**
```bash
cd web
npm run dev
```

## 📚 API Documentation

### Tickets

- `POST /api/tickets` - Submit a new ticket (public)
- `GET /api/tickets` - List tickets with filters (admin)
- `GET /api/tickets/:id` - Get ticket details (admin)
- `PATCH /api/tickets/:id` - Update ticket (admin)
- `POST /api/tickets/:id/regenerate` - Regenerate AI answer (admin)

### Knowledge Base

- `POST /api/kb` - Create KB article (admin)
- `GET /api/kb` - List all articles (admin)
- `GET /api/kb/search?q=query&k=3` - Search articles (admin)
- `GET /api/kb/:id` - Get article (admin)
- `PATCH /api/kb/:id` - Update article (admin)
- `DELETE /api/kb/:id` - Delete article (admin)
- `POST /api/kb/reembed` - Re-embed all articles (admin)

### Authentication

All admin endpoints require Bearer token authentication:
```
Authorization: Bearer <ADMIN_TOKEN>
```

## 🧪 Testing

```bash
npm test
```

## 🏭 Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🎯 Key Features Explained

### Ticket Processing Flow

1. **Submission**: User submits ticket with email, subject, and message
2. **Moderation**: AI checks content for safety violations
3. **NLP Extraction**: AI extracts intent, urgency, entities, and confidence score
4. **Vector Search**: System searches KB for similar articles using embeddings
5. **RAG Generation**: AI generates answer using relevant KB articles
6. **Auto-Classification**: Ticket status set based on confidence threshold

### Knowledge Base

- Articles are embedded using OpenAI's embedding model
- Vector search finds semantically similar articles
- Supports full CRUD operations
- Batch re-embedding for updates

## 🔧 Configuration

All configuration is centralized in `server/config/env.js` with sensible defaults. Key settings:

- **LOW_CONFIDENCE_THRESHOLD**: Confidence score below which tickets are queued (default: 0.6)
- **RAG_TOP_K**: Number of KB articles to retrieve (default: 3)
- **RAG_SIMILARITY_THRESHOLD**: Minimum similarity score for article retrieval (default: 0.5)

## 📝 Code Quality

- **Modular Architecture**: Clean separation of concerns (controllers, services, validators)
- **Error Handling**: Custom error classes with consistent error responses
- **Input Validation**: Centralized validation with clear error messages
- **Type Safety**: Consistent data structures and validation
- **Reusable Components**: Shared UI components for consistency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
