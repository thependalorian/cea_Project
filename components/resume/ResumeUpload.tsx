/**
 * Resume upload component aligned with database schema
 * Purpose: Handle resume uploads following database structure
 * Location: /components/resume/ResumeUpload.tsx
 */
import { useState, useCallback } from 'react'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { supabase } from '@/lib/supabase'
import type { Resume } from '@/types/database'

interface ResumeUploadProps {
  userId: string
  onUploadComplete?: (resume: Resume) => void
}

export function ResumeUpload({ userId, onUploadComplete }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileUpload = async (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Call the processing API endpoint
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Simulate progress updates for better UX
      setUploadProgress(50)
      await new Promise(resolve => setTimeout(resolve, 500))
      setUploadProgress(100)

      // Create resume object for callback
      const resume = {
        id: result.data.resume_id,
        user_id: userId,
        file_path: `/resumes/${result.data.resume_id}`,
        file_name: result.data.filename,
        file_type: file.type,
        status: 'processed',
        analysis_result: {
          climate_relevance_score: result.data.climate_relevance_score,
          skills_extracted: result.data.skills_extracted,
          chunks_processed: result.data.chunks_processed
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      onUploadComplete?.(resume)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Check file type
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['pdf', 'doc', 'docx'].includes(fileExt || '')) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.')
        return
      }
      
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB.')
        return
      }
      
      handleFileUpload(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  return (
    <BrandFrame size="md" color="spring-green">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-h2 font-title-medium text-[var(--midnight-forest)] mb-2">
            Upload Your Resume
          </h2>
          <p className="text-body text-[var(--moss-green)]">
            Get personalized analysis and climate career matching
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${dragOver 
              ? 'border-[var(--spring-green)] bg-[var(--spring-green-10)]' 
              : 'border-[var(--sand-gray)] hover:border-[var(--spring-green)]'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => !uploading && document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <span className="inline-block w-16 h-16 border-4 border-[var(--spring-green)] border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="text-body font-body-medium text-[var(--midnight-forest)]">
                  Uploading Resume...
                </p>
                <div className="w-full bg-[var(--sand-gray)] rounded-full h-2 mt-2">
                  <div 
                    className="bg-[var(--spring-green)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-body-small text-[var(--moss-green)] mt-1">
                  {uploadProgress}% complete
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto text-[var(--moss-green)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <p className="text-body font-body-medium text-[var(--midnight-forest)]">
                  {dragOver 
                    ? 'Drop your resume here...' 
                    : 'Drag & drop your resume here, or click to select'
                  }
                </p>
                <p className="text-body-small text-[var(--moss-green)] mt-2">
                  Supports PDF, DOC, and DOCX files up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body text-red-800">
              Upload failed: {error}
            </p>
          </div>
        )}

        <div className="bg-[var(--sand-gray-10)] rounded-lg p-4">
          <h3 className="text-body font-body-semibold text-[var(--midnight-forest)] mb-2">
            What happens next?
          </h3>
          <ul className="space-y-2 text-body-small text-[var(--moss-green)]">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-[var(--spring-green)] rounded-full mt-2 flex-shrink-0" />
              <span>AI analysis extracts your skills and experience</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-[var(--spring-green)] rounded-full mt-2 flex-shrink-0" />
              <span>Climate relevance scoring for career matching</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-[var(--spring-green)] rounded-full mt-2 flex-shrink-0" />
              <span>Personalized recommendations from our specialists</span>
            </li>
          </ul>
        </div>
      </div>
    </BrandFrame>
  )
} 