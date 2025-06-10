import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    console.log("📁 POST /api/upload-resume - Starting resume upload process");
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("❌ Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.log("❌ No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);

    // Validate file type and size
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF or Word documents." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `resume_${user.id}_${timestamp}_${file.name}`;
    const filePath = `resumes/${user.id}/${fileName}`;

    // Upload file to Supabase Storage using authenticated client
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("❌ Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file", details: uploadError.message },
        { status: 500 }
      );
    }

    console.log("✅ File uploaded to storage:", uploadData.path);

    // Generate public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(uploadData.path);

    // Save resume record to database using authenticated client
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        upload_status: 'uploaded',
        mime_type: file.type
      })
      .select()
      .single();

    if (dbError) {
      console.error("❌ Database error:", dbError);
      
      // Clean up uploaded file if database insert failed
      await supabase.storage
        .from('resumes')
        .remove([uploadData.path]);
      
      return NextResponse.json(
        { error: "Failed to save resume record", details: dbError.message },
        { status: 500 }
      );
    }

    console.log("✅ Resume record saved:", resumeData.id);

    // Log audit action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        table_name: 'resumes',
        action_type: 'create',
        record_id: resumeData.id,
        new_values: {
          file_name: file.name,
          file_size: file.size,
          upload_status: 'uploaded'
        },
        details: { action: 'resume_upload' }
      });

    // Start the processing of the resume in the background
    let processingStarted = false;
    try {
      // Call v1 proxy route to process the resume
      console.log("Calling v1 proxy route to process resume");
      const backendResponse = await fetch('/api/v1/process-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: publicUrl,
          file_id: resumeData.id,
          context: 'general'
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
      
      // Check processing status using v1 proxy route
      try {
        const statusResponse = await fetch('/api/v1/debug-resume', {
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