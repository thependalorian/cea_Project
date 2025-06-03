import EnhancedResumeAnalysis from '@/components/enhanced-resume-analysis';

/**
 * Enhanced Resume Analysis Page - Climate Economy Assistant
 * 
 * Comprehensive resume analysis featuring:
 * - Skill gap analysis with urgency levels
 * - Career recommendations with match scores  
 * - Upskilling program suggestions with direct links
 * - Career pathway mapping with timelines
 * - External resource citations
 * - Contextual follow-up questions
 * - Actionable next steps with URLs
 * 
 * Location: /app/resume-analysis/page.tsx
 */

export default function ResumeAnalysisPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <EnhancedResumeAnalysis />
    </div>
  );
} 