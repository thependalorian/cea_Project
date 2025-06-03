'use client';

import { useState } from 'react';

/**
 * Skills Translation Component - Climate Economy Assistant
 * 
 * KEY SELLING POINT: AI-powered skills translation for climate economy careers
 * 
 * Features:
 * - Individual skill transferability scoring
 * - Skills clustering for career pathways
 * - Climate career readiness assessment
 * - Strategic positioning advice
 * - Success stories and examples
 * - Actionable skill development recommendations
 * 
 * Location: /components/skills-translation.tsx
 */

interface SkillTranslation {
  original_skill: string;
  original_domain: string;
  climate_equivalent: string;
  climate_domain: string;
  transferability_score: number;
  translation_explanation: string;
  examples: string[];
  positioning_advice: string;
}

interface SkillCluster {
  cluster_name: string;
  original_skills: string[];
  climate_applications: string[];
  complementary_skills_needed: string[];
  recommended_roles: string[];
  sample_projects: string[];
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

interface SkillTranslationResponse {
  content: string;
  skill_translations: SkillTranslation[];
  skill_clusters: SkillCluster[];
  high_transferability_skills: string[];
  skills_needing_development: string[];
  climate_career_readiness_score: number;
  recommended_positioning: string;
  actionable_items: ActionableItem[];
  sources: SourceReference[];
  follow_up_questions: FollowUpQuestion[];
  success_stories: string[];
}

export default function SkillsTranslation() {
  const [translation, setTranslation] = useState<SkillTranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [targetSector, setTargetSector] = useState('general');
  const [currentIndustry, setCurrentIndustry] = useState('');

  const runTranslation = async () => {
    if (!userId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/skills-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          target_climate_sector: targetSector,
          current_industry: currentIndustry || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to translate skills');
      }

      const data: SkillTranslationResponse = await response.json();
      setTranslation(data);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Error translating skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTransferabilityColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.6) return 'text-warning';
    return 'text-error';
  };

  const getTransferabilityBadge = (score: number) => {
    if (score >= 0.8) return 'badge-success';
    if (score >= 0.6) return 'badge-warning';
    return 'badge-error';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 0.7) return 'text-success';
    if (score >= 0.5) return 'text-warning';
    return 'text-error';
  };

  const climateSecors = [
    { value: 'general', label: 'General Climate Economy' },
    { value: 'solar', label: 'Solar Energy' },
    { value: 'wind', label: 'Wind Energy' },
    { value: 'efficiency', label: 'Energy Efficiency' },
    { value: 'storage', label: 'Energy Storage' },
    { value: 'policy', label: 'Climate Policy' },
    { value: 'finance', label: 'Climate Finance' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          🔄 AI Skills Translation
        </h1>
        <p className="text-lg text-base-content/70 mb-2">
          Discover how your existing skills translate to climate economy opportunities
        </p>
        <div className="badge badge-primary badge-lg">KEY SELLING POINT</div>
      </div>

      {/* Input Section */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-primary">🎯 Skills Translation Analysis</h2>
          <p className="mb-4">Get AI-powered insights into how your skills transfer to climate careers</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">User ID</span>
              </label>
              <input
                type="text"
                placeholder="Enter your user ID..."
                className="input input-bordered"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Target Climate Sector</span>
              </label>
              <select
                className="select select-bordered"
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                disabled={loading}
              >
                {climateSecors.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Current Industry (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g., tech, finance, consulting..."
                className="input input-bordered"
                value={currentIndustry}
                onChange={(e) => setCurrentIndustry(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="card-actions justify-center mt-6">
            <button
              className="btn btn-primary btn-lg"
              onClick={runTranslation}
              disabled={loading || !userId.trim()}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                '🔄 Translate My Skills'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Translation Results */}
      {translation && (
        <div className="space-y-8">
          
          {/* Overview & Readiness Score */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl">📊 Translation Analysis</h2>
                <div className="prose max-w-none">
                  <p className="text-lg">{translation.content}</p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl">
              <div className="card-body text-center">
                <h3 className="card-title justify-center text-primary">🎯 Climate Readiness</h3>
                <div className="text-6xl font-bold mb-2">
                  <span className={getReadinessColor(translation.climate_career_readiness_score)}>
                    {Math.round(translation.climate_career_readiness_score * 100)}%
                  </span>
                </div>
                <p className="text-sm text-base-content/70">
                  Your overall climate career readiness score
                </p>
                <div className="mt-4">
                  <div className={`progress ${translation.climate_career_readiness_score >= 0.7 ? 'progress-success' : translation.climate_career_readiness_score >= 0.5 ? 'progress-warning' : 'progress-error'}`}>
                    <div 
                      className="progress-bar" 
                      style={{width: `${translation.climate_career_readiness_score * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Translations */}
          {translation.skill_translations.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🔄 Individual Skill Translations</h3>
                <div className="space-y-4">
                  {translation.skill_translations.map((skill, idx) => (
                    <div key={idx} className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold">{skill.original_skill}</span>
                              <span className="text-sm text-base-content/70">({skill.original_domain})</span>
                              <span className="text-lg">→</span>
                              <span className="text-lg font-semibold text-primary">{skill.climate_equivalent}</span>
                              <span className="text-sm text-base-content/70">({skill.climate_domain})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${getTransferabilityBadge(skill.transferability_score)}`}>
                              {Math.round(skill.transferability_score * 100)}% transferable
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-base-content/80 mb-3">{skill.translation_explanation}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-1">💡 Examples:</h5>
                            <ul className="text-xs space-y-1">
                              {skill.examples.map((example, exampleIdx) => (
                                <li key={exampleIdx} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">🎯 Positioning Advice:</h5>
                            <p className="text-xs text-base-content/70">{skill.positioning_advice}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skill Clusters */}
          {translation.skill_clusters.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🎯 Skills Clusters & Career Pathways</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {translation.skill_clusters.map((cluster, idx) => (
                    <div key={idx} className="card bg-info/10">
                      <div className="card-body">
                        <h4 className="text-lg font-semibold text-info mb-3">{cluster.cluster_name}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-1">🔧 Your Skills:</h5>
                            <div className="flex flex-wrap gap-1">
                              {cluster.original_skills.map((skill, skillIdx) => (
                                <span key={skillIdx} className="badge badge-xs badge-outline">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">🌱 Climate Applications:</h5>
                            <ul className="text-xs space-y-1">
                              {cluster.climate_applications.map((app, appIdx) => (
                                <li key={appIdx} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{app}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-sm mb-1">📈 Recommended Roles:</h5>
                            <div className="flex flex-wrap gap-1">
                              {cluster.recommended_roles.map((role, roleIdx) => (
                                <span key={roleIdx} className="badge badge-xs badge-info">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {cluster.complementary_skills_needed.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-1">🎓 Skills to Develop:</h5>
                              <div className="flex flex-wrap gap-1">
                                {cluster.complementary_skills_needed.map((skill, skillIdx) => (
                                  <span key={skillIdx} className="badge badge-xs badge-warning">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* High Transferability & Development Needs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-success/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-success">💪 Highly Transferable Skills</h3>
                <p className="text-sm text-base-content/70 mb-3">These skills give you immediate advantage in climate roles:</p>
                <div className="space-y-2">
                  {translation.high_transferability_skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-success">✓</span>
                      <span className="font-medium">{skill}</span>
                      <span className="badge badge-success badge-xs">High Value</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card bg-warning/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-warning">🎯 Skills to Develop</h3>
                <p className="text-sm text-base-content/70 mb-3">Strategic skill development for climate transition:</p>
                <div className="space-y-2">
                  {translation.skills_needing_development.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-warning">→</span>
                      <span className="font-medium">{skill}</span>
                      <span className="badge badge-warning badge-xs">Priority</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Positioning */}
          {translation.recommended_positioning && (
            <div className="card bg-primary/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-primary">🎯 Strategic Positioning Advice</h3>
                <div className="prose max-w-none">
                  <p className="text-base-content/80">{translation.recommended_positioning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Stories */}
          {translation.success_stories.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">✨ Success Stories</h3>
                <p className="text-sm text-base-content/70 mb-4">Real examples of similar career transitions:</p>
                <div className="space-y-3">
                  {translation.success_stories.map((story, idx) => (
                    <div key={idx} className="p-3 bg-base-200 rounded-lg">
                      <p className="text-sm">{story}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Items */}
          {translation.actionable_items.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">⚡ Next Steps</h3>
                <div className="grid gap-3">
                  {translation.actionable_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                      <span className="text-2xl">
                        {item.action === 'explore' ? '🔍' : item.action === 'learn_more' ? '📚' : '📝'}
                      </span>
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
                          Take Action
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {translation.follow_up_questions.length > 0 && (
            <div className="card bg-warning/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-warning mb-4">🤔 Personalize Your Strategy</h3>
                <div className="space-y-3">
                  {translation.follow_up_questions.map((question, idx) => (
                    <div key={idx} className="p-3 bg-base-100 rounded-lg">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-base-content/70 mt-1">{question.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
} 