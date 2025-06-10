/**
 * Download Resource API - Climate Economy Assistant
 * Secure endpoint for downloading admin/partner resources
 * Location: app/api/admin/download-resource/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('id');
    const type = searchParams.get('type'); // 'knowledge', 'admin', 'partner'
    const format = searchParams.get('format'); // 'pdf', 'zip', 'json', etc.

    if (!resourceId || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Handle different resource types
    switch (type) {
      case 'knowledge':
        return await downloadKnowledgeResource(supabase, resourceId, format);
      
      case 'admin':
        return await downloadAdminResource(resourceId, format, adminProfile.admin_level);
      
      case 'partner':
        return await downloadPartnerResource(resourceId, format, adminProfile.admin_level);
      
      default:
        return NextResponse.json(
          { error: 'Invalid resource type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Download resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function downloadKnowledgeResource(supabase: any, resourceId: string, format?: string | null) {
  // Get the knowledge resource
  const { data: resource, error } = await supabase
    .from('knowledge_resources')
    .select('*')
    .eq('id', resourceId)
    .single();

  if (error || !resource) {
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }

  // If resource has a file_path, download from Supabase storage
  if (resource.file_path) {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('knowledge-resources')
        .download(resource.file_path);

      if (downloadError) {
        throw downloadError;
      }

      // Create response with file
      const response = new NextResponse(fileData);
      response.headers.set('Content-Type', getContentType(resource.file_path));
      response.headers.set('Content-Disposition', `attachment; filename="${resource.title}.${getFileExtension(resource.file_path)}"`);
      
      return response;
    } catch (storageError) {
      console.error('Storage download error:', storageError);
      // Fall through to alternative download methods
    }
  }

  // If resource has external URL, redirect or provide link
  if (resource.source_url) {
    return NextResponse.json({
      type: 'external_link',
      url: resource.source_url,
      title: resource.title,
      message: 'This resource is hosted externally. You will be redirected.'
    });
  }

  // Generate downloadable content based on format
  switch (format) {
    case 'json':
      return downloadAsJson(resource, 'knowledge-resource');
    
    case 'pdf':
      return downloadAsPdf(resource);
    
    case 'txt':
      return downloadAsText(resource);
    
    default:
      // Default to JSON export
      return downloadAsJson(resource, 'knowledge-resource');
  }
}

async function downloadAdminResource(resourceId: string, format?: string | null, adminLevel?: string) {
  // Check if user has sufficient privileges for admin resources
  if (adminLevel !== 'super' && adminLevel !== 'system') {
    return NextResponse.json(
      { error: 'Insufficient privileges for admin resources' },
      { status: 403 }
    );
  }

  // Admin resource library (these would typically be stored in a secure location)
  const adminResources = {
    'admin-guide': {
      title: 'Administrator User Guide',
      content: 'Complete guide for system administrators...',
      type: 'pdf',
      size: '2.4 MB'
    },
    'api-docs': {
      title: 'API Documentation',
      content: 'Internal API reference and endpoints...',
      type: 'pdf',
      size: '1.8 MB'
    },
    'db-schema': {
      title: 'Database Schema Documentation',
      content: 'Complete database structure and relationships...',
      type: 'pdf',
      size: '1.2 MB'
    },
    'security-protocols': {
      title: 'Security Protocols',
      content: 'Platform security guidelines and procedures...',
      type: 'pdf',
      size: '1.0 MB'
    }
  };

  const resource = adminResources[resourceId as keyof typeof adminResources];
  if (!resource) {
    return NextResponse.json(
      { error: 'Admin resource not found' },
      { status: 404 }
    );
  }

  return downloadAsJson(resource, 'admin-resource');
}

async function downloadPartnerResource(resourceId: string, format?: string | null, adminLevel?: string) {
  // Partner resource library
  const partnerResources = {
    'welcome-guide': {
      title: 'Partner Welcome Guide',
      content: 'Welcome to the Climate Economy Assistant partner program...',
      type: 'pdf',
      size: '2.1 MB'
    },
    'api-integration': {
      title: 'API Integration Guide',
      content: 'How to integrate your systems with our platform...',
      type: 'pdf',
      size: '3.2 MB'
    },
    'branding-kit': {
      title: 'Co-branding Guidelines',
      content: 'Brand guidelines for partner organizations...',
      type: 'zip',
      size: '4.5 MB'
    },
    'training-modules': {
      title: 'Partner Training Modules',
      content: 'Training materials for partner staff...',
      type: 'video',
      size: '2.5 hours'
    }
  };

  const resource = partnerResources[resourceId as keyof typeof partnerResources];
  if (!resource) {
    return NextResponse.json(
      { error: 'Partner resource not found' },
      { status: 404 }
    );
  }

  return downloadAsJson(resource, 'partner-resource');
}

function downloadAsJson(data: any, type: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const response = new NextResponse(jsonContent);
  
  response.headers.set('Content-Type', 'application/json');
  response.headers.set('Content-Disposition', `attachment; filename="${type}-${Date.now()}.json"`);
  
  return response;
}

function downloadAsText(resource: any) {
  const textContent = `
Title: ${resource.title}
Description: ${resource.description || 'No description'}
Content Type: ${resource.content_type || 'N/A'}
Created: ${resource.created_at || 'N/A'}

Content:
${resource.content || 'No content available'}
  `.trim();

  const response = new NextResponse(textContent);
  response.headers.set('Content-Type', 'text/plain');
  response.headers.set('Content-Disposition', `attachment; filename="${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`);
  
  return response;
}

function downloadAsPdf(resource: any) {
  // For now, return as text with PDF mime type
  // In production, you'd use a PDF generation library like jsPDF or puppeteer
  const textContent = `
${resource.title}

${resource.description || ''}

${resource.content || 'No content available'}
  `.trim();

  const response = new NextResponse(textContent);
  response.headers.set('Content-Type', 'application/pdf');
  response.headers.set('Content-Disposition', `attachment; filename="${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
  
  return response;
}

function getContentType(filePath: string): string {
  const extension = getFileExtension(filePath);
  const contentTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'json': 'application/json',
    'zip': 'application/zip',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}

function getFileExtension(filePath: string): string {
  return filePath.split('.').pop()?.toLowerCase() || '';
} 