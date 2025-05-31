import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { query, user_id, match_threshold, match_count } = body;
    
    // Ensure the user is only searching their own resumes
    if (user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only search your own resumes" },
        { status: 403 }
      );
    }
    
    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    try {
      // Call Python backend
      const response = await fetch("http://localhost:8000/api/search-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          user_id,
          match_threshold: match_threshold || 0.7,
          match_count: match_count || 5
        }),
        // Set a timeout to avoid long waits if the service is down
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        return NextResponse.json(
          { error: errorData.error || "Search failed" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Search error:", error);
      
      return NextResponse.json(
        { error: "Failed to connect to search service" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      { error: "Failed to process search request" },
      { status: 500 }
    );
  }
} 