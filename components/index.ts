// Centralized Component Exports - Organized by Feature Domain
// Following the 23 rules: Always create new, modular UI components

// === UI Foundation Components ===
export * from './ui'

// === Authentication & User Management ===
export * from './auth'

// === Chat & Communication Features ===
export { ChatWindow } from './chat/chat-window'
export { ChatMessageItem } from './chat/chat-message'

// === Resume & Skills Analysis ===
export { default as EnhancedResumeAnalysis } from './resume/enhanced-resume-analysis'
export { default as ResumeDebug } from './resume/resume-debug'
export { ResumeUpload } from './resume/resume-upload'

// === Career & Skills Translation (Key Selling Point) ===
// export { default as SkillsTranslation } from './career/skills-translation'

// === Partner & Organization Management ===
export * from './partners'

// === Search & Discovery ===
export * from './search'

// === Layout & Navigation ===
export * from './layout'

// === Tutorial & Onboarding ===
// export * from './tutorial' - REMOVED: Tutorial directory doesn't exist

export { ErrorBoundary } from './ErrorBoundary';
export { default as FeedbackWidget } from './FeedbackWidget';
export { ClimateAdvisoryChat } from './ClimateAdvisoryChat'; 