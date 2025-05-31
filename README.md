# Climate Economy Assistant (CEA)

A sophisticated AI-powered system designed to connect underrepresented communities with opportunities in the climate economy sector. The CEA provides personalized career guidance, resume analysis, and skill matching for job seekers interested in climate tech positions.

## System Architecture

The CEA consists of the following components:

1. **Frontend**: Next.js application with a responsive UI built using Tailwind CSS and DaisyUI
2. **Backend**: FastAPI Python service with specialized AI modules
3. **Database**: Supabase PostgreSQL database with vector search capabilities
4. **AI Services**: Integration with OpenAI APIs for embeddings and LLM services
5. **Web Search**: Tavily API integration for gathering real-time information

## Key Features

### Resume Analysis and RAG

- Processes uploaded resumes using OpenAI embeddings
- Stores resume chunks in Supabase with vector embeddings
- Implements Retrieval-Augmented Generation (RAG) for contextually relevant responses
- Provides personalized career advice based on user's resume

### Social Profile Enhancement

- Retrieves additional information about users from their social profiles
- Supports LinkedIn, GitHub, and personal website analysis
- Uses Tavily API to gather comprehensive professional background
- Enhances RAG responses with social profile information

### Climate Career Matching

- Analyzes user skills and experience in the context of climate economy
- Identifies transferable skills for climate tech positions
- Provides personalized career pathways in the climate sector
- Addresses specific needs of underrepresented groups

## Database Schema

The core database structure revolves around the `resumes` table:

```sql
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  context TEXT DEFAULT 'general',
  processed BOOLEAN DEFAULT false,
  chunks JSONB DEFAULT '[]'::jsonb,
  linkedin_url TEXT,
  github_url TEXT,
  personal_website TEXT,
  full_text TEXT,
  social_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Key database functions:
- `jsonb_to_vector`: Converts JSONB arrays to vector embeddings
- `match_resume_content`: Semantic search using vector embeddings
- `match_resume_text`: Text-based similarity search for resumes

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/api/process-resume` | POST | Process and embed a resume |
| `/api/chat` | POST | General chat interface with resume context |
| `/api/search-resume` | POST | Search for relevant content in resumes |
| `/api/chat-with-resume` | POST | Chat with a resume using RAG |
| `/api/chat-with-resume-social` | POST | Enhanced chat with social data |
| `/api/resume-agent` | POST | LangChain agent for complex resume queries |
| `/api/debug-resume` | POST | Debug endpoint for resume structure |
| `/api/update-social-links` | POST | Update social profile links |
| `/api/search-social-profiles` | POST | Search for social profile information |

## Technical Implementation

### Resume Processing

The system processes uploaded resumes through these steps:
1. Upload PDF resume to Supabase storage
2. Extract text content with PyPDFLoader
3. Split into chunks using RecursiveCharacterTextSplitter
4. Generate embeddings using OpenAI's text-embedding-ada-002
5. Store chunks and embeddings in Supabase

### Social Profile Integration

For enhanced context about users:
1. User provides LinkedIn, GitHub, or personal website URLs
2. System uses Tavily API to search for additional information
3. LLM summarizes findings into a comprehensive profile
4. Social data is stored in the resume record
5. RAG system incorporates social context in responses

### RAG System

The RAG implementation includes:
1. Custom SimpleDocumentRetriever for accessing resume chunks
2. LLMChain with a specialized prompt template
3. StuffDocumentsChain for combining document content
4. Conditional templates that incorporate social data when available
5. Conversational memory for multi-turn interactions

## Development Tools

- **Language**: Python 3.11+ for backend, TypeScript for frontend
- **Frameworks**: FastAPI, Next.js, LangChain
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 and Embeddings API
- **Search**: Tavily API
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Set up environment variables in `.env`
3. Initialize Supabase with the consolidated migrations
4. Install dependencies with `pip install -r requirements.txt`
5. Run the backend with `python -m python_backend.main`
6. Start the frontend with `npm run dev`

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY` - API key for OpenAI services
- `SUPABASE_URL` - URL for your Supabase project
- `SUPABASE_SERVICE_KEY` - Service role key for Supabase
- `TAVILY_API_KEY` - API key for Tavily search services

## Features

### Chat Interface
- General chat about climate tech and careers
- Resume-aware chat that can analyze your uploaded resume
- Enhanced Social Context that leverages information from your social profiles

### Resume Processing
- Upload your resume to get personalized advice
- Backend vectorization and embedding for semantic search
- Retrieval-Augmented Generation (RAG) for context-aware responses

### Social Profile Integration
- Link your LinkedIn, GitHub, and personal website
- Enhance chat responses with information from your online presence
- Get more personalized career advice based on your complete professional profile

## Usage

1. Upload your resume through the interface
2. Enable "Chat with Resume" to get personalized responses
3. Enable "Enhanced Social Context" to incorporate your social profile information
4. Chat with the assistant to get tailored advice for your climate tech career

## UI Controls

The application includes a control panel with the following options:

- **Chat with Resume**: Toggle to enable using your resume content in conversations
- **Enhanced Social Context**: Toggle to enable using social profile information to enhance responses
- **Refresh Social Data**: Button to update social profile information when changes have been made

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Tech Stack

- **Frontend**: Next.js (v14) with App Router and SSR
- **Backend**: FastAPI with Supabase
- **Styling**: Tailwind CSS and DaisyUI
- **AI**: OpenAI GPT models with retrieval augmentation
- **Vector Store**: Supabase pgvector extension
