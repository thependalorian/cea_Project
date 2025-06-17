/**
 * User Profile Page - Climate Economy Assistant
 * Comprehensive profile management for all user types
 * Location: app/profile/page.tsx
 */

'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { SimpleLayout } from '@/components/SimpleLayout';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Award,
  Upload,
  Download,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  Calendar,
  Target,
  Zap,
  Settings,
  Bell,
  Shield,
  Camera,
  FileText,
  Link,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Bookmark
} from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock profile data based on database schemas
  const [profileData, setProfileData] = useState({
    // Basic info
    full_name: "George Nekwaya",
    email: user?.email || "george@buffr.ai",
    phone: "+1 (617) 555-0123",
    location: "Boston, MA",
    current_title: "Climate Technology Consultant",
    
    // Job seeker specific
    experience_level: "senior",
    climate_focus_areas: ["renewable_energy", "energy_storage", "climate_policy"],
    desired_roles: ["sustainability_director", "climate_analyst", "clean_tech_consultant"],
    preferred_locations: ["Boston, MA", "Cambridge, MA", "Remote"],
    remote_work_preference: "hybrid",
    salary_range_min: 85000,
    salary_range_max: 120000,
    employment_types: ["full_time", "contract"],
    
    // Resume info
    resume_filename: "George_Nekwaya_Climate_Resume.pdf",
    resume_uploaded_at: "2024-01-15T10:30:00Z",
    
    // Profile completion
    profile_completed: 85,
    last_login: "2024-01-20T14:22:00Z"
  });

  const [skills] = useState([
    { name: "Climate Policy Analysis", level: "Expert", verified: true },
    { name: "Renewable Energy Systems", level: "Advanced", verified: true },
    { name: "Carbon Accounting", level: "Advanced", verified: false },
    { name: "Project Management", level: "Expert", verified: true },
    { name: "Stakeholder Engagement", level: "Advanced", verified: true },
    { name: "Data Analysis", level: "Intermediate", verified: false },
    { name: "Sustainability Reporting", level: "Advanced", verified: true },
    { name: "Energy Efficiency", level: "Expert", verified: false }
  ]);

  const [experience] = useState([
    {
      title: "Senior Climate Consultant",
      company: "Buffr Inc",
      location: "Boston, MA",
      start_date: "2022-03",
      end_date: null,
      current: true,
      description: "Leading climate strategy development for Fortune 500 companies, focusing on renewable energy transitions and carbon reduction initiatives."
    },
    {
      title: "Sustainability Analyst",
      company: "Massachusetts Clean Energy Center",
      location: "Boston, MA", 
      start_date: "2020-06",
      end_date: "2022-02",
      current: false,
      description: "Analyzed clean energy market trends and policy impacts, supporting $50M+ in clean energy investments across Massachusetts."
    },
    {
      title: "Environmental Policy Researcher",
      company: "Harvard Kennedy School",
      location: "Cambridge, MA",
      start_date: "2019-01",
      end_date: "2020-05",
      current: false,
      description: "Conducted research on climate policy effectiveness and renewable energy adoption barriers in New England."
    }
  ]);

  const [education] = useState([
    {
      degree: "Master of Public Policy",
      institution: "Harvard Kennedy School",
      location: "Cambridge, MA",
      graduation_year: 2019,
      focus: "Environmental Policy and Climate Change"
    },
    {
      degree: "Bachelor of Science in Environmental Science",
      institution: "University of Massachusetts Amherst",
      location: "Amherst, MA",
      graduation_year: 2017,
      focus: "Climate Science and Renewable Energy"
    }
  ]);

  const [certifications] = useState([
    {
      name: "Certified Energy Manager (CEM)",
      issuer: "Association of Energy Engineers",
      date: "2023-08",
      expires: "2026-08",
      credential_id: "CEM-2023-8947"
    },
    {
      name: "LEED Green Associate",
      issuer: "U.S. Green Building Council",
      date: "2022-11",
      expires: "2025-11",
      credential_id: "LEED-GA-2022-1156"
    },
    {
      name: "Climate Change Mitigation",
      issuer: "MIT Professional Education",
      date: "2021-09",
      expires: null,
      credential_id: "MIT-CCM-2021-445"
    }
  ]);

  const profileCompletionItems = [
    { item: "Basic Information", completed: true, weight: 20 },
    { item: "Work Experience", completed: true, weight: 25 },
    { item: "Education", completed: true, weight: 15 },
    { item: "Skills & Certifications", completed: true, weight: 20 },
    { item: "Resume Upload", completed: true, weight: 15 },
    { item: "Career Preferences", completed: false, weight: 5 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Profile Header */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Profile Sidebar */}
              <div className="lg:col-span-1">
                <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle sticky top-6">
                  
                  {/* Profile Photo */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 bg-gradient-to-br from-spring-green to-moss-green rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <ACTButton 
                        variant="ghost" 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-ios-normal"
                      >
                        <Camera className="w-4 h-4" />
                      </ACTButton>
                    </div>
                    <h2 className="font-helvetica font-bold text-midnight-forest text-xl">
                      {profileData.full_name}
                    </h2>
                    <p className="text-midnight-forest/70 font-inter">
                      {profileData.current_title}
                    </p>
                    <p className="text-sm text-midnight-forest/60 flex items-center justify-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profileData.location}
                    </p>
                  </div>

                  {/* Profile Completion */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-inter font-medium text-midnight-forest">
                        Profile Completion
                      </span>
                      <span className="text-sm font-helvetica font-bold text-spring-green">
                        {profileData.profile_completed}%
                      </span>
                    </div>
                    <div className="w-full bg-sand-gray/20 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-spring-green to-seafoam-blue h-3 rounded-full transition-all duration-300"
                        style={{ width: `${profileData.profile_completed}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-midnight-forest/60 mt-2">
                      Complete your profile to unlock more opportunities
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <ACTButton 
                      variant="primary" 
                      fullWidth
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </ACTButton>
                    <ACTButton 
                      variant="outline" 
                      fullWidth
                      icon={<Download className="w-4 h-4" />}
                    >
                      Download Resume
                    </ACTButton>
                    <ACTButton 
                      variant="outline" 
                      fullWidth
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Preview Public Profile
                    </ACTButton>
                  </div>

                  {/* Profile Stats */}
                  <div className="mt-6 pt-6 border-t border-sand-gray/20">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-helvetica font-bold text-midnight-forest">
                          156
                        </div>
                        <div className="text-xs text-midnight-forest/60">Profile Views</div>
                      </div>
                      <div>
                        <div className="text-2xl font-helvetica font-bold text-spring-green">
                          23
                        </div>
                        <div className="text-xs text-midnight-forest/60">Connections</div>
                      </div>
                    </div>
                  </div>
                </ACTCard>
              </div>

              {/* Main Profile Content */}
              <div className="lg:col-span-3">
                
                {/* Tab Navigation */}
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                      <ACTButton
                        key={tab.id}
                        variant={activeTab === tab.id ? "primary" : "ghost"}
                        size="sm"
                        icon={<tab.icon className="w-4 h-4" />}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? "" : "hover:bg-spring-green/10"}
                      >
                        {tab.label}
                      </ACTButton>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    
                    {/* Basic Information */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                          Basic Information
                        </h3>
                        {isEditing && (
                          <ACTButton variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                            Edit
                          </ACTButton>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.full_name}
                              className="w-full px-4 py-3 rounded-xl border border-sand-gray/30 focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green"
                            />
                          ) : (
                            <p className="text-midnight-forest font-inter">{profileData.full_name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Email Address
                          </label>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-midnight-forest/40" />
                            <p className="text-midnight-forest font-inter">{profileData.email}</p>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={profileData.phone}
                              className="w-full px-4 py-3 rounded-xl border border-sand-gray/30 focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-midnight-forest/40" />
                              <p className="text-midnight-forest font-inter">{profileData.phone}</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Location
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.location}
                              className="w-full px-4 py-3 rounded-xl border border-sand-gray/30 focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-midnight-forest/40" />
                              <p className="text-midnight-forest font-inter">{profileData.location}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Current Title
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={profileData.current_title}
                              className="w-full px-4 py-3 rounded-xl border border-sand-gray/30 focus:outline-none focus:ring-2 focus:ring-spring-green/50 focus:border-spring-green"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-midnight-forest/40" />
                              <p className="text-midnight-forest font-inter">{profileData.current_title}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ACTCard>

                    {/* Climate Focus Areas */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                          Climate Focus Areas
                        </h3>
                        {isEditing && (
                          <ACTButton variant="ghost" size="sm" icon={<Plus className="w-4 h-4" />}>
                            Add Area
                          </ACTButton>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {profileData.climate_focus_areas.map((area, index) => (
                          <div key={index} className="flex items-center space-x-2 px-4 py-2 bg-spring-green/10 text-spring-green rounded-full">
                            <span className="font-inter font-medium capitalize">
                              {area.replace('_', ' ')}
                            </span>
                            {isEditing && (
                              <X className="w-4 h-4 cursor-pointer hover:text-red-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ACTCard>

                    {/* Resume Section */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                          Resume
                        </h3>
                        <ACTButton variant="outline" size="sm" icon={<Upload className="w-4 h-4" />}>
                          Update Resume
                        </ACTButton>
                      </div>
                      
                      {profileData.resume_filename ? (
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-green-600" />
                            <div>
                              <p className="font-inter font-medium text-green-800">
                                {profileData.resume_filename}
                              </p>
                              <p className="text-sm text-green-600">
                                Uploaded {new Date(profileData.resume_uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <ACTButton variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                              Preview
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                              Download
                            </ACTButton>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-sand-gray/30 rounded-xl">
                          <Upload className="w-12 h-12 text-midnight-forest/40 mx-auto mb-4" />
                          <p className="text-midnight-forest/60 font-inter mb-4">
                            Upload your resume to get better job matches
                          </p>
                          <ACTButton variant="primary" icon={<Upload className="w-4 h-4" />}>
                            Upload Resume
                          </ACTButton>
                        </div>
                      )}
                    </ACTCard>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                        Work Experience
                      </h3>
                      <ACTButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Add Experience
                      </ACTButton>
                    </div>
                    
                    {experience.map((exp, index) => (
                      <ACTCard key={index} variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-helvetica font-semibold text-midnight-forest text-lg">
                              {exp.title}
                            </h4>
                            <p className="text-spring-green font-inter font-medium">
                              {exp.company}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-midnight-forest/60 mt-1">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {exp.location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <ACTButton variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                            <ACTButton variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                          </div>
                        </div>
                        <p className="text-midnight-forest/70 font-inter leading-relaxed">
                          {exp.description}
                        </p>
                      </ACTCard>
                    ))}
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                        Education & Certifications
                      </h3>
                      <ACTButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Add Education
                      </ACTButton>
                    </div>
                    
                    {/* Education */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest">Education</h4>
                      {education.map((edu, index) => (
                        <ACTCard key={index} variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <GraduationCap className="w-6 h-6 text-spring-green mt-1" />
                              <div>
                                <h5 className="font-helvetica font-semibold text-midnight-forest">
                                  {edu.degree}
                                </h5>
                                <p className="text-spring-green font-inter font-medium">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-midnight-forest/60">
                                  {edu.location} • Class of {edu.graduation_year}
                                </p>
                                <p className="text-sm text-midnight-forest/70 mt-1">
                                  Focus: {edu.focus}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <ACTButton variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                              <ACTButton variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                            </div>
                          </div>
                        </ACTCard>
                      ))}
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest">Certifications</h4>
                      {certifications.map((cert, index) => (
                        <ACTCard key={index} variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <Award className="w-6 h-6 text-yellow-500 mt-1" />
                              <div>
                                <h5 className="font-helvetica font-semibold text-midnight-forest">
                                  {cert.name}
                                </h5>
                                <p className="text-spring-green font-inter font-medium">
                                  {cert.issuer}
                                </p>
                                <p className="text-sm text-midnight-forest/60">
                                  Issued: {new Date(cert.date).toLocaleDateString()}
                                  {cert.expires && ` • Expires: ${new Date(cert.expires).toLocaleDateString()}`}
                                </p>
                                <p className="text-xs text-midnight-forest/50 mt-1">
                                  ID: {cert.credential_id}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <ACTButton variant="ghost" size="sm" icon={<Link className="w-4 h-4" />} />
                              <ACTButton variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                            </div>
                          </div>
                        </ACTCard>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                        Skills & Expertise
                      </h3>
                      <ACTButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                        Add Skill
                      </ACTButton>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <ACTCard key={index} variant="default" className="p-4 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-helvetica font-semibold text-midnight-forest">
                              {skill.name}
                            </h5>
                            <div className="flex items-center space-x-2">
                              {skill.verified && (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              <ACTButton variant="ghost" size="sm" icon={<Edit className="w-3 h-3" />} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              skill.level === 'Expert' ? 'bg-green-100 text-green-700' :
                              skill.level === 'Advanced' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {skill.level}
                            </span>
                            <span className="text-xs text-midnight-forest/60">
                              {skill.verified ? 'Verified' : 'Self-assessed'}
                            </span>
                          </div>
                        </ACTCard>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                      Career Preferences
                    </h3>
                    
                    {/* Job Preferences */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest mb-6">
                        Job Search Preferences
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Desired Roles
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {profileData.desired_roles.map((role, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                {role.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Employment Types
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {profileData.employment_types.map((type, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                {type.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Salary Range
                          </label>
                          <p className="text-midnight-forest font-inter">
                            ${profileData.salary_range_min.toLocaleString()} - ${profileData.salary_range_max.toLocaleString()}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-inter font-medium text-midnight-forest mb-2">
                            Remote Work Preference
                          </label>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full capitalize">
                            {profileData.remote_work_preference}
                          </span>
                        </div>
                      </div>
                    </ACTCard>

                    {/* Notification Preferences */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest mb-6">
                        Notification Preferences
                      </h4>
                      
                      <div className="space-y-4">
                        {[
                          { label: "Job Match Alerts", description: "Get notified when new jobs match your preferences" },
                          { label: "Application Updates", description: "Receive updates on your job applications" },
                          { label: "Partner Messages", description: "Allow partner organizations to contact you" },
                          { label: "Newsletter", description: "Weekly climate career insights and opportunities" },
                          { label: "Event Invitations", description: "Invitations to climate career events and webinars" }
                        ].map((pref, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border border-sand-gray/20 rounded-xl">
                            <div>
                              <h5 className="font-inter font-medium text-midnight-forest">
                                {pref.label}
                              </h5>
                              <p className="text-sm text-midnight-forest/60">
                                {pref.description}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-spring-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spring-green"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ACTCard>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                      Privacy & Security
                    </h3>
                    
                    {/* Profile Visibility */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest mb-6">
                        Profile Visibility
                      </h4>
                      
                      <div className="space-y-4">
                        {[
                          { label: "Public Profile", description: "Allow your profile to be visible to partner organizations" },
                          { label: "Contact Information", description: "Show your email and phone to verified partners" },
                          { label: "Resume Access", description: "Allow partners to view your uploaded resume" },
                          { label: "Activity Status", description: "Show when you were last active on the platform" }
                        ].map((setting, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border border-sand-gray/20 rounded-xl">
                            <div>
                              <h5 className="font-inter font-medium text-midnight-forest">
                                {setting.label}
                              </h5>
                              <p className="text-sm text-midnight-forest/60">
                                {setting.description}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-spring-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spring-green"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ACTCard>

                    {/* Account Security */}
                    <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                      <h4 className="text-lg font-helvetica font-semibold text-midnight-forest mb-6">
                        Account Security
                      </h4>
                      
                      <div className="space-y-4">
                        <ACTButton variant="outline" fullWidth className="justify-start">
                          <Shield className="w-4 h-4 mr-3" />
                          Change Password
                        </ACTButton>
                        <ACTButton variant="outline" fullWidth className="justify-start">
                          <Zap className="w-4 h-4 mr-3" />
                          Enable Two-Factor Authentication
                        </ACTButton>
                        <ACTButton variant="outline" fullWidth className="justify-start">
                          <Download className="w-4 h-4 mr-3" />
                          Download My Data
                        </ACTButton>
                        <ACTButton variant="outline" fullWidth className="justify-start text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-3" />
                          Delete Account
                        </ACTButton>
                      </div>
                    </ACTCard>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
} 