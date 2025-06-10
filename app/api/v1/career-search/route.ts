/**
 * Climate Career Search API v1 - Climate Economy Assistant
 * Proxies career search requests to Python backend with authentication
 * Location: app/api/v1/career-search/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      query,
      user_id,
      include_resume_context = true,
      search_scope = 'all',
      stream = false 
    } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate search scope
    const validScopes = ['all', 'jobs', 'education', 'partners', 'knowledge'];
    if (!validScopes.includes(search_scope)) {
      return NextResponse.json(
        { error: `Invalid search_scope. Must be one of: ${validScopes.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare request to Python backend
    const backendRequest = {
      query,
      user_id: user_id || user.id,
      session_id: `career-search-${Date.now()}`,
      include_resume_context,
      search_scope,
      stream,
      context: {
        user: {
          id: user.id,
          email: user.email
        },
        search_initiated_at: new Date().toISOString()
      }
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout for comprehensive search

      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/climate-career-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle streaming response if requested
      if (stream && backendResponse.ok) {
        // Return streamed response directly
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        
        // Process stream from Python backend
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get reader from backend response');
        }

        // Stream processing function
        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              await writer.write(value);
            }
          } catch (error) {
            console.error('Career search stream processing error:', error);
          } finally {
            await writer.close();
          }
        })();

        return new NextResponse(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }

      // Handle non-streaming response
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Career search backend error:', errorText);
        return NextResponse.json(
          { error: `Career search failed: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return standard JSON response
      const data = await backendResponse.json();
      
      // Handle successful response but empty search results
      if (data && typeof data === 'object') {
        // Check if search returned no results
        if (data.search_climate_ecosystem_data && 
            data.search_climate_ecosystem_data.results && 
            Array.isArray(data.search_climate_ecosystem_data.results) &&
            data.search_climate_ecosystem_data.results.length === 0) {
          
          return NextResponse.json({
            ...data,
            success: true,
            status: 'no_results',
            message: 'No matching opportunities found for your search criteria.',
            suggestions: [
              'Try broadening your search terms',
              'Consider related keywords or skills',
              'Explore different climate sectors',
              'Check back later as new opportunities are added regularly'
            ],
            search_metadata: {
              query,
              search_scope,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        // Handle low confidence responses
        if (data.generate_personalized_response && 
            data.generate_personalized_response.confidence_score !== undefined &&
            data.generate_personalized_response.confidence_score < 0.6) {
          
          return NextResponse.json({
            ...data,
            success: true,
            status: 'limited_results',
            confidence_note: `Search completed with limited matches. Consider refining your search criteria.`,
            improvement_tips: [
              'Be more specific about your target role',
              'Include relevant skills or experience level',
              'Specify location preferences if relevant',
              'Try alternative industry terms'
            ]
          });
        }
      }
      
      return NextResponse.json(data);

    } catch (fetchError) {
      console.error('Career search fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Career search timed out. Please try a more specific query.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to career search service. Please ensure Python backend is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in career search API:', error);
    return NextResponse.json(
      { error: 'Failed to process career search request' },
      { status: 500 }
    );
  }
} 