"use client";

import { useState } from 'react';
import { ACTCard } from '@/components/ui';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploadSectionProps {
  userId: string;
  hasExistingResume: boolean;
  currentResumeData?: Record<string, unknown>;
}

export function ResumeUploadSection({ userId, hasExistingResume, currentResumeData }: ResumeUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-resume-${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Update job seeker profile with resume info
      const { error: updateError } = await supabase
        .from('job_seeker_profiles')
        .upsert({
          user_id: userId,
          resume_filename: file.name,
          resume_storage_path: uploadData.path,
          resume_uploaded_at: new Date().toISOString(),
          profile_completed: true
        });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been saved and is ready for analysis",
      });

      setFile(null);
      // Reload the page to show updated state
      window.location.reload();

    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ACTCard
      variant="outlined"
      title="Resume Management"
      className="w-full"
    >
      <div className="space-y-6">
        {hasExistingResume ? (
          <div className="flex items-center gap-3 p-4 bg-spring-green/5 rounded-lg border border-spring-green/20">
            <CheckCircle className="w-5 h-5 text-spring-green" />
            <div className="flex-1">
              <div className="font-medium text-midnight-forest">Resume Uploaded</div>
              <div className="text-sm text-midnight-forest/70">
                {(currentResumeData?.resume_filename as string) || 'resume.pdf'} • 
                Uploaded {currentResumeData?.resume_uploaded_at ? new Date(currentResumeData.resume_uploaded_at as string).toLocaleDateString() : 'recently'}
              </div>
            </div>
            <Button variant="outline" size="sm">
              Replace
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-midnight-forest/20 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-midnight-forest/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-midnight-forest mb-2">Upload Your Resume</h3>
            <p className="text-midnight-forest/70 mb-4">
              Upload your resume to get personalized job recommendations and career insights
            </p>
            
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              
              {!file ? (
                <label htmlFor="resume-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-midnight-forest">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-spring-green hover:bg-spring-green/90"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFile(null)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-midnight-forest/50">
              Supported formats: PDF, DOC, DOCX • Max size: 5MB
            </div>
          </div>
        )}

        {hasExistingResume && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View Resume
            </Button>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Get AI Analysis
            </Button>
          </div>
        )}
      </div>
    </ACTCard>
  );
} 