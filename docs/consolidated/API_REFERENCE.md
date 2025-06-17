# API Reference
The Climate Economy Assistant API provides comprehensive access to climate job data, user management, and AI-powered matching services.
## Base URL
All API endpoints are relative to the base URL:

```
https://your-domain.com/api/v1
```

## Authentication

Most API endpoints require authentication. Include the authentication token in the request headers:

```
Authorization: Bearer <token>
```

## Edge Functions

Supabase Edge Functions are server-side TypeScript functions that run on Deno, distributed globally at the edge (close to users) for low latency. They are used for serverless operations like webhooks, third-party integrations, and processing tasks.

### Key Features

1. **Global Distribution**: Functions run close to users for minimal latency
2. **TypeScript/JavaScript Support**: Built on Deno runtime with TypeScript first-class support
3. **NPM Compatibility**: Access to 2+ million NPM modules
4. **Open Source**: Built on open-source technology without vendor lock-in
5. **Local Development**: Full local development experience with hot reloading
6. **Observability**: Built-in logging, metrics, and monitoring capabilities
7. **Supabase Integration**: Seamless integration with other Supabase services

### Development Workflow

#### Local Development
```bash
# Create a new function
supabase functions new my-function

# Serve locally with hot reloading
supabase functions serve my-function

# Test locally
curl --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"name":"World"}'
```

#### Deployment
```bash
# Deploy to production
supabase functions deploy my-function

# For public webhook access (no JWT required)
supabase functions deploy my-function --no-verify-jwt
```

### Best Practices

1. **Organize Functions Properly**: Use a `_shared` folder for shared code between functions
2. **Use Hyphenated Names**: Function names should use hyphens for URL-friendliness
3. **Secure Environment Variables**: Never hardcode sensitive information in your functions
4. **Implement Error Handling**: Always handle errors properly in your functions
5. **Optimize for Size**: Keep functions small and efficient for faster cold starts
6. **Use TypeScript**: Leverage TypeScript for better type safety and developer experience
7. **Implement CORS**: Add proper CORS headers for browser access

### Limitations

- Cannot write to file system
- Cannot connect to ports 25, 465, and 587 (email ports)
- Limited to POST requests only
- No HTML response support
- Local development limited to one function at a time

## Integration with Climate Economy Assistant

In the Climate Economy Assistant project, Edge Functions are used for:

1. **Webhook Handling**: Processing webhooks from third-party services
2. **Resume Processing**: Analyzing uploaded resumes with AI
3. **Background Tasks**: Running scheduled tasks and background processing
4. **API Integration**: Connecting with external APIs and services
5. **Custom Authentication**: Implementing specialized authentication flows
