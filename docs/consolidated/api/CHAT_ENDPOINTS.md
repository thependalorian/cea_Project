# Chat Endpoints Documentation - Climate Economy Assistant

## Current Active Endpoints

### 🎯 Primary Chat Endpoint
**`/api/v1/interactive-chat`**
- **Purpose**: Main authenticated chat interface
- **Authentication**: Required (Supabase JWT)
- **Features**: Full climate career assistance, resume analysis, job search
- **Status**: Production ready

### 🧠 Supervisor Chat Endpoint  
**`/api/v1/supervisor-chat`**
- **Purpose**: LangGraph 2025 supervisor workflow with user steering
- **Authentication**: Required (Supabase JWT)
- **Features**: Multi-specialist routing, streaming responses, workflow management
- **Status**: Production ready
- **Special**: Advanced LangGraph integration with user steering

### 🧪 Test Chat Endpoint
**`/api/v1/test-chat`**
- **Purpose**: Testing backend integration without authentication
- **Authentication**: None (testing only)
- **Features**: Basic chat functionality for development testing
- **Status**: Development only - DO NOT USE IN PRODUCTION

## Removed Legacy Endpoints

### ❌ Removed in Cleanup
- **`/api/chat`**: Legacy proxy to v1/interactive-chat (redundant)
- **`/api/chat/climate-advisory/`**: Old climate advisory implementation

## Environment Variables Used

These endpoints use the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side)
- `PYTHON_BACKEND_URL`: Python backend URL (default: http://localhost:8000)

## Usage Examples

### Interactive Chat (Primary)
```javascript
const response = await fetch('/api/v1/interactive-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "I'm interested in renewable energy careers",
    conversation_id: "unique-conversation-id"
  })
});
```

### Supervisor Chat (Advanced)
```javascript
const response = await fetch('/api/v1/supervisor-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: "Help me plan my climate career path",
    conversation_id: "unique-conversation-id",
    stream: true,
    user_journey_stage: "discovery"
  })
});
```

## Migration Notes

If you were using the legacy `/api/chat` endpoint:
1. Replace calls with `/api/v1/interactive-chat`
2. Update request format to match new schema
3. Ensure proper authentication headers are included

## Testing

Use the `/api/v1/test-chat` endpoint for development testing:
- No authentication required
- Returns test responses
- Helps verify backend connectivity

---
*Last updated: 2025-06-16 11:02:49*