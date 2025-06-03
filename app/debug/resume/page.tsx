import ResumeDebug from '@/components/resume-debug'

export default function DebugResumePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Resume Detection Debug</h1>
      <p className="mb-6 text-muted-foreground">
        This page helps diagnose issues with resume detection in the Climate Economy Assistant.
      </p>
      
      <ResumeDebug />
      
      <div className="mt-8 p-4 bg-muted rounded-md">
        <h2 className="text-lg font-medium mb-2">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure the Python backend is running on port 8000</li>
          <li>Check that you're logged in with the correct user account</li>
          <li>Verify that you've uploaded a resume for this user</li>
          <li>Ensure the resume has been processed (should have chunks)</li>
          <li>Check browser console for any JavaScript errors</li>
        </ul>
      </div>
    </div>
  )
} 