import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    // Regular client for user authentication
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log("Authenticated user:", user.id);
    
    // TEMPORARY: Use admin client to bypass RLS for troubleshooting
    const adminClient = createAdminClient();
    
    // Get form data with the file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const context = formData.get("context") as string;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Check file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }
    
    // Create a unique file name with user ID
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
    const filePath = `resumes/${fileName}`;
    
    console.log("Uploading to path:", filePath);
    
    // TEMPORARY: Use admin client to bypass RLS for storage
    const { error: uploadError } = await adminClient.storage
      .from('user-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });
    
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }
    
    // Get the public URL for the file
    const { data: { publicUrl } } = adminClient.storage
      .from('user-documents')
      .getPublicUrl(filePath);
    
    // Create a user-friendly folder name for easier identification in backend processing
    const userFolder = `user_${user.id}`;
    const userFilePath = filePath.replace(user.id, userFolder);
    
    console.log("Attempting to insert into resumes table with user_id:", user.id);
    
    // TEMPORARY: Use admin client to bypass RLS for database
    const { data: resumeData, error: resumeError } = await adminClient
      .from('resumes')
      .insert({
        user_id: user.id,
        file_path: userFilePath, // Use the user-friendly path format
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        context: context || 'general',
      })
      .select()
      .single();
    
    if (resumeError) {
      console.error("Resume metadata error:", resumeError);
      // If metadata storage fails, we should delete the uploaded file
      await adminClient.storage.from('user-documents').remove([filePath]);
      
      return NextResponse.json(
        { error: "Failed to store resume metadata", details: resumeError },
        { status: 500 }
      );
    }
    
    console.log("Resume saved with ID:", resumeData.id);
    
    // Start the processing of the resume in the background
    let processingStarted = false;
    try {
      // Call the Python backend to process the resume
      console.log("Calling Python backend to process resume");
      const backendResponse = await fetch('http://localhost:8000/api/process-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: publicUrl,
          file_id: resumeData.id,
          context: context || 'general'
        }),
      });
      
      if (!backendResponse.ok) {
        console.warn("Resume processing may have failed:", 
          await backendResponse.text());
      } else {
        const processingResult = await backendResponse.json();
        console.log("Resume processing initiated successfully:", processingResult);
        processingStarted = true;
      }
    } catch (processingError) {
      console.warn("Failed to start resume processing:", processingError);
    }
    
    // Add a delay to wait for processing to start
    if (processingStarted) {
      // Wait 2 seconds to give time for processing to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check processing status
      try {
        const statusResponse = await fetch('http://localhost:8000/api/debug-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume_id: resumeData.id
          }),
        });
        
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          console.log("Resume processing status:", status);
        }
      } catch (statusError) {
        console.warn("Failed to check resume processing status:", statusError);
      }
    }
    
    return NextResponse.json({
      fileId: resumeData.id,
      userId: user.id,
      fileName: file.name,
      url: publicUrl,
      processingStarted: processingStarted
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 