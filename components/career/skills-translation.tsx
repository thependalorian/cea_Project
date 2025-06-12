'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { API_ENDPOINTS } from "@/lib/config/constants";

/**
 * Skills Translation Component - Climate Economy Assistant
 * 
 * KEY SELLING POINT: AI-powered skills translation for climate economy careers
 * 
 * Features:
 * - Community-specific skills translation (Veterans, Environmental Justice, International Professionals)
 * - Individual skill transferability scoring
 * - Skills clustering for career pathways
 * - Climate career readiness assessment
 * - Strategic positioning advice
 * - Success stories and examples
 * - Actionable skill development recommendations
 * - Community barriers and opportunities analysis
 * 
 * Location: /components/career/skills-translation.tsx
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
  community_specific_guidance?: string;
}

interface SkillCluster {
  cluster_name: string;
  original_skills: string[];
  climate_applications: string[];
  complementary_skills_needed: string[];
  recommended_roles: string[];
  sample_projects: string[];
  community_pathway?: string;
}

interface CommunityBarrier {
  barrier_type: string;
  description: string;
  impact_level: string;
  mitigation_strategies: string[];
  partner_resources: string[];
}

interface CommunityOpportunity {
  opportunity_type: string;
  title: string;
  description: string;
  eligibility_criteria: string[];
  partner_organization: string;
  application_process: string;
  timeline: string;
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

interface User {
  id: string;
  email?: string;
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
  // Community-specific fields
  community_profile?: string;
  community_barriers: CommunityBarrier[];
  community_opportunities: CommunityOpportunity[];
  cultural_assets: string[];
  network_resources: SourceReference[];
  metadata?: {
    analyzed_at: string;
    resume_file: string;
    analysis_type: string;
    community_focused: boolean;
    target_sector: string;
  };
}

export default function SkillsTranslation() {
  const [translation, setTranslation] = useState<SkillTranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [targetSector, setTargetSector] = useState('general');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  
  // Community-specific fields
  const [communityBackground, setCommunityBackground] = useState<'veteran' | 'environmental_justice' | 'international_professional' | ''>('');
  const [militaryBranch, setMilitaryBranch] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');

  const supabase = createClient();

  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  }, [supabase.auth]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const runTranslation = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const requestBody = {
        user_id: currentUser.id,
        target_climate_sector: targetSector,
        current_industry: currentIndustry || undefined,
        experience_level: experienceLevel || undefined,
        community_background: communityBackground || undefined,
        military_branch: militaryBranch || undefined,
        country_of_origin: countryOfOrigin || undefined,
        languages_spoken: languagesSpoken.length > 0 ? languagesSpoken : undefined
      };

      const response = await fetch(API_ENDPOINTS.V1_SKILLS_TRANSLATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate skills');
      }

      const data: SkillTranslationResponse = await response.json();
      setTranslation(data);
    } catch (error) {
      console.error('Translation error:', error);
      alert(`Error translating skills: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const addLanguage = () => {
    if (languageInput.trim() && !languagesSpoken.includes(languageInput.trim())) {
      setLanguagesSpoken([...languagesSpoken, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (language: string) => {
    setLanguagesSpoken(languagesSpoken.filter(lang => lang !== language));
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

  const getImpactLevelColor = (level: string) => {
    if (level.toLowerCase() === 'high') return 'text-error';
    if (level.toLowerCase() === 'medium') return 'text-warning';
    return 'text-info';
  };

  const climateSecors = [
    { value: 'general', label: 'General Climate Economy' },
    { value: 'solar', label: 'Solar Energy' },
    { value: 'wind', label: 'Wind Energy' },
    { value: 'energy_efficiency', label: 'Energy Efficiency' },
    { value: 'renewable_energy', label: 'Renewable Energy' },
    { value: 'climate_policy', label: 'Climate Policy' },
    { value: 'environmental_consulting', label: 'Environmental Consulting' },
    { value: 'green_building', label: 'Green Building' }
  ];

  const communityOptions = [
    { value: '', label: 'General Professional' },
    { value: 'veteran', label: 'Military Veteran' },
    { value: 'environmental_justice', label: 'Environmental Justice Community' },
    { value: 'international_professional', label: 'International Professional' }
  ];

  const militaryBranches = [
    'Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'
  ];

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="card bg-warning/10 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-warning">🔐 Authentication Required</h2>
            <p>Please sign in to access the Skills Translation feature.</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-center gap-2 mb-4">
          <div className="badge badge-primary badge-lg">KEY SELLING POINT</div>
          {communityBackground && (
            <div className="badge badge-secondary badge-lg">
              {communityOptions.find(opt => opt.value === communityBackground)?.label}
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-primary">🎯 Skills Translation Analysis</h2>
          <p className="mb-4">Get AI-powered insights into how your skills transfer to climate careers</p>
          
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
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

          {/* Community Background */}
          <div className="divider">Community Background (Enhanced Analysis)</div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Community Background</span>
                <span className="label-text-alt">Unlock community-specific insights</span>
              </label>
              <select
                className="select select-bordered"
                value={communityBackground}
                onChange={(e) => setCommunityBackground(e.target.value as typeof communityBackground)}
                disabled={loading}
              >
                {communityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Experience Level</span>
              </label>
              <select
                className="select select-bordered"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={loading}
              >
                <option value="">Select experience level...</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-7 years)</option>
                <option value="senior">Senior Level (8+ years)</option>
                <option value="executive">Executive/Leadership</option>
              </select>
            </div>
          </div>

          {/* Veteran-specific fields */}
          {communityBackground === 'veteran' && (
            <div className="card bg-info/10 p-4 mb-4">
              <h4 className="font-medium text-info mb-3">🎖️ Military Background</h4>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Military Branch</span>
                </label>
                <select
                  className="select select-bordered"
                  value={militaryBranch}
                  onChange={(e) => setMilitaryBranch(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select branch...</option>
                  {militaryBranches.map((branch) => (
                    <option key={branch} value={branch.toLowerCase()}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* International Professional fields */}
          {communityBackground === 'international_professional' && (
            <div className="card bg-accent/10 p-4 mb-4">
              <h4 className="font-medium text-accent mb-3">🌍 International Background</h4>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Country of Origin</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Nigeria, Brazil, India..."
                    className="input input-bordered"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Languages Spoken</span>
                  </label>
                  <div className="join">
                    <input
                      type="text"
                      placeholder="Add language..."
                      className="input input-bordered join-item"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-primary join-item"
                      onClick={addLanguage}
                      disabled={loading || !languageInput.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              {languagesSpoken.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {languagesSpoken.map((language) => (
                    <div key={language} className="badge badge-accent gap-2">
                      {language}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => removeLanguage(language)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card-actions justify-center mt-6">
            <button
              className="btn btn-primary btn-lg"
              onClick={runTranslation}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Analyzing Skills...
                </>
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
          
          {/* Metadata & Overview */}
          {translation.metadata && (
            <div className="alert alert-info">
              <span>📊 Analysis completed on {new Date(translation.metadata.analyzed_at).toLocaleDateString()} 
              for {translation.metadata.resume_file} targeting {translation.metadata.target_sector} sector
              {translation.metadata.community_focused ? ' with community-specific insights' : ''}</span>
            </div>
          )}
          
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
                  <progress 
                    className={`progress ${translation.climate_career_readiness_score >= 0.7 ? 'progress-success' : translation.climate_career_readiness_score >= 0.5 ? 'progress-warning' : 'progress-error'}`}
                    value={translation.climate_career_readiness_score * 100} 
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
          </div>

          {/* Community Assets */}
          {translation.cultural_assets && translation.cultural_assets.length > 0 && (
            <div className="card bg-secondary/10 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-secondary">✨ Cultural Assets & Strengths</h3>
                <p className="text-sm text-base-content/70 mb-3">Unique strengths from your community background:</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {translation.cultural_assets.map((asset, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-secondary">🌟</span>
                      <span className="font-medium">{asset}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Community Barriers & Opportunities */}
          {(translation.community_barriers.length > 0 || translation.community_opportunities.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Barriers */}
              {translation.community_barriers.length > 0 && (
                <div className="card bg-error/10 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-error">⚠️ Community Barriers</h3>
                    <div className="space-y-3">
                      {translation.community_barriers.map((barrier, idx) => (
                        <div key={idx} className="card bg-base-100">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{barrier.barrier_type.replace('_', ' ')}</span>
                              <span className={`badge ${getImpactLevelColor(barrier.impact_level)}`}>
                                {barrier.impact_level} impact
                              </span>
                            </div>
                            <p className="text-sm text-base-content/80 mb-2">{barrier.description}</p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">Mitigation strategies:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {barrier.mitigation_strategies.map((strategy, stratIdx) => (
                                  <li key={stratIdx}>{strategy}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {translation.community_opportunities.length > 0 && (
                <div className="card bg-success/10 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-success">🚀 Community Opportunities</h3>
                    <div className="space-y-3">
                      {translation.community_opportunities.map((opportunity, idx) => (
                        <div key={idx} className="card bg-base-100">
                          <div className="card-body p-4">
                            <h4 className="font-medium text-success">{opportunity.title}</h4>
                            <p className="text-sm text-base-content/80 mb-2">{opportunity.description}</p>
                            <div className="text-xs">
                              <p><strong>Organization:</strong> {opportunity.partner_organization}</p>
                              <p><strong>Timeline:</strong> {opportunity.timeline}</p>
                              <p><strong>Application:</strong> {opportunity.application_process}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                            {skill.community_specific_guidance && (
                              <div className="mt-2">
                                <h5 className="font-medium text-sm mb-1">🏘️ Community-Specific Guidance:</h5>
                                <p className="text-xs text-base-content/70 bg-info/10 p-2 rounded">{skill.community_specific_guidance}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Network Resources */}
          {translation.network_resources && translation.network_resources.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🤝 Community Network Resources</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {translation.network_resources.map((resource, idx) => (
                    <div key={idx} className="card bg-primary/10">
                      <div className="card-body p-4">
                        <h4 className="font-medium">{resource.title}</h4>
                        <p className="text-sm text-base-content/70">{resource.partner_name}</p>
                        <span className="badge badge-xs badge-primary">{resource.content_type}</span>
                        {resource.url && (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary mt-2">
                            Connect
                          </a>
                        )}
                      </div>
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