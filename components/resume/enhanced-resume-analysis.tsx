'use client';

import { useState } from 'react';

/**
 * Enhanced Resume Analysis Component - Climate Economy Assistant
 * 
 * Provides comprehensive resume analysis with:
 * - Skill gap analysis with urgency levels
 * - Career recommendations with match scores
 * - Upskilling program suggestions with direct links
 * - Career pathway mapping
 * - External resource citations
 * - Contextual follow-up questions
 * 
 * Location: /components/enhanced-resume-analysis.tsx
 */

interface SkillGap {
  skill: string;
  current_level: string;
  target_level: string;
  gap_description: string;
  urgency: string;
}

interface CareerRecommendation {
  title: string;
  description: string;
  match_score: number;
  required_skills: string[];
  recommended_actions: string[];
  partner_name?: string;
  application_url?: string;
}

interface UpskillingProgram {
  program_name: string;
  provider: string;
  program_type: string;
  skills_covered: string[];
  duration?: string;
  cost?: string;
  application_url?: string;
  relevance_score: number;
}

interface CareerPathway {
  pathway_title: string;
  description: string;
  steps: string[];
  timeline: string;
  required_skills: string[];
  related_jobs: string[];
  resources: SourceReference[];
}

interface SourceReference {
  title: string;
  url?: string;
  partner_name: string;
  content_type: string;
  relevance_score?: number;
}

interface ActionableItem {
  action: string;
  title: string;
  url?: string;
  description: string;
  partner_name?: string;
}

interface FollowUpQuestion {
  question: string;
  category: string;
  context: string;
}

interface ResumeAnalysisResponse {
  content: string;
  strengths: string[];
  improvement_areas: string[];
  skill_gaps: SkillGap[];
  career_recommendations: CareerRecommendation[];
  upskilling_programs: UpskillingProgram[];
  career_pathways: CareerPathway[];
  sources: SourceReference[];
  actionable_items: ActionableItem[];
  follow_up_questions: FollowUpQuestion[];
  external_resources: SourceReference[];
}

export default function EnhancedResumeAnalysis() {
  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const runAnalysis = async () => {
    if (!userId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/resume-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          analysis_type: 'comprehensive',
          include_social_data: true,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data: ResumeAnalysisResponse = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      'high': 'text-error',
      'medium': 'text-warning',
      'low': 'text-info'
    };
    return colors[urgency as keyof typeof colors] || 'text-base-content';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-error';
  };

  const getProgramTypeIcon = (type: string) => {
    const icons = {
      'certificate': '📜',
      'bootcamp': '🚀',
      'degree': '🎓',
      'online_course': '💻'
    };
    return icons[type as keyof typeof icons] || '📚';
  };

  const getActionIcon = (action: string) => {
    const icons = {
      'apply': '📝',
      'learn_more': '📚',
      'contact': '📞',
      'explore': '🔍'
    };
    return icons[action as keyof typeof icons] || '🔗';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          📊 Enhanced Resume Analysis
        </h1>
        <p className="text-lg text-base-content/70">
          Comprehensive career guidance for the climate economy
        </p>
      </div>

      {/* Input Section */}
      <div className="card bg-base-200 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Start Your Analysis</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">User ID</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter your user ID..."
                className="input input-bordered flex-1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={runAnalysis}
                disabled={loading || !userId.trim()}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  '🔍 Analyze Resume'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          
          {/* Overview */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">📋 Analysis Overview</h2>
              <div className="prose max-w-none">
                <p className="text-lg">{analysis.content}</p>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-success/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-success">💪 Key Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card bg-warning/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-warning">🎯 Improvement Areas</h3>
                <ul className="space-y-2">
                  {analysis.improvement_areas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-warning">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Skill Gaps */}
          {analysis.skill_gaps.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🎯 Skill Gap Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Current Level</th>
                        <th>Target Level</th>
                        <th>Description</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.skill_gaps.map((gap, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{gap.skill}</td>
                          <td>
                            <span className="badge badge-outline">{gap.current_level}</span>
                          </td>
                          <td>
                            <span className="badge badge-primary">{gap.target_level}</span>
                          </td>
                          <td className="text-sm">{gap.gap_description}</td>
                          <td>
                            <span className={`badge ${getUrgencyColor(gap.urgency)}`}>
                              {gap.urgency}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Career Recommendations */}
          {analysis.career_recommendations.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🚀 Career Recommendations</h3>
                <div className="grid gap-4">
                  {analysis.career_recommendations.map((rec, idx) => (
                    <div key={idx} className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-semibold">{rec.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getMatchScoreColor(rec.match_score)}`}>
                              {Math.round(rec.match_score * 100)}% match
                            </span>
                            {rec.partner_name && (
                              <span className="badge badge-outline text-xs">{rec.partner_name}</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-base-content/70 mb-2">{rec.description}</p>
                        {rec.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs font-medium">Skills:</span>
                            {rec.required_skills.map((skill, skillIdx) => (
                              <span key={skillIdx} className="badge badge-xs badge-outline">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {rec.application_url && (
                          <div className="card-actions justify-end mt-2">
                            <a
                              href={rec.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                            >
                              Apply Now
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upskilling Programs */}
          {analysis.upskilling_programs.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">📚 Recommended Training Programs</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.upskilling_programs.map((program, idx) => (
                    <div key={idx} className="card bg-info/10">
                      <div className="card-body">
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{getProgramTypeIcon(program.program_type)}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold">{program.program_name}</h4>
                            <p className="text-sm text-base-content/70">by {program.provider}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge badge-xs badge-info">{program.program_type}</span>
                              <span className="text-xs">
                                {Math.round(program.relevance_score * 100)}% relevance
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {program.skills_covered.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Skills covered:</p>
                            <div className="flex flex-wrap gap-1">
                              {program.skills_covered.map((skill, skillIdx) => (
                                <span key={skillIdx} className="badge badge-xs badge-outline">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {program.application_url && (
                          <div className="card-actions justify-end mt-3">
                            <a
                              href={program.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-info"
                            >
                              Learn More
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Career Pathways */}
          {analysis.career_pathways.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🛤️ Career Pathways</h3>
                <div className="space-y-6">
                  {analysis.career_pathways.map((pathway, idx) => (
                    <div key={idx} className="card bg-primary/10">
                      <div className="card-body">
                        <h4 className="text-lg font-semibold text-primary">{pathway.pathway_title}</h4>
                        <p className="text-sm text-base-content/70 mb-3">{pathway.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">📋 Steps:</h5>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {pathway.steps.map((step, stepIdx) => (
                                <li key={stepIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-2"><strong>Timeline:</strong> {pathway.timeline}</p>
                            <div>
                              <h5 className="font-medium mb-1">Required Skills:</h5>
                              <div className="flex flex-wrap gap-1">
                                {pathway.required_skills.slice(0, 5).map((skill, skillIdx) => (
                                  <span key={skillIdx} className="badge badge-xs badge-primary">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {pathway.resources.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-2">🔗 Related Opportunities:</h5>
                            <div className="flex flex-wrap gap-2">
                              {pathway.resources.map((resource, resIdx) => (
                                <a
                                  key={resIdx}
                                  href={resource.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-outline"
                                >
                                  {resource.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Items */}
          {analysis.actionable_items.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">⚡ Take Action Now</h3>
                <div className="grid gap-3">
                  {analysis.actionable_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                      <span className="text-2xl">{getActionIcon(item.action)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-base-content/70">{item.description}</p>
                        {item.partner_name && (
                          <span className="badge badge-xs badge-outline mt-1">{item.partner_name}</span>
                        )}
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          {item.action === 'apply' ? 'Apply' : 'Learn More'}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {analysis.follow_up_questions.length > 0 && (
            <div className="card bg-warning/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-warning mb-4">🤔 Next Steps & Questions</h3>
                <div className="space-y-3">
                  {analysis.follow_up_questions.map((question, idx) => (
                    <div key={idx} className="p-3 bg-base-100 rounded-lg">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-base-content/70 mt-1">{question.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sources & References */}
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.sources.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">📚 Internal Sources</h3>
                  <div className="space-y-2">
                    {analysis.sources.map((source, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium">{source.title}</div>
                        <div className="text-base-content/70">by {source.partner_name}</div>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary text-xs"
                          >
                            View source →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {analysis.external_resources.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">🌐 External Resources</h3>
                  <div className="space-y-2">
                    {analysis.external_resources.map((resource, idx) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium">{resource.title}</div>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary text-xs"
                          >
                            Visit external source →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
} 