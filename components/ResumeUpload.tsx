'use client'

import { useState } from 'react'

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document')
      return
    }

    // Check file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }

      // Reset form
      setFile(null)
      if (document.getElementById('resume-upload') instanceof HTMLFormElement) {
        (document.getElementById('resume-upload') as HTMLFormElement).reset()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form id="resume-upload" className="space-y-4">
      <div className="form-control w-full">
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label className="label">
          <span className="label-text-alt">PDF or Word document (max 5MB)</span>
        </label>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="alert alert-info">
          <span>Selected file: {file.name}</span>
        </div>
      )}

      <button
        type="button"
        className={`btn btn-primary w-full ${uploading ? 'loading' : ''}`}
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        Upload Resume
      </button>
    </form>
  )
} 