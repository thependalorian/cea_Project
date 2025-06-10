/**
 * Education Settings Page - Climate Economy Assistant
 * Admin page for configuring education-related settings and policies
 * Location: app/admin/education-settings/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Settings, 
  BookOpen, 
  Shield, 
  Users,
  Award,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default async function EducationSettingsPage() {
  const supabase = await createClient()

  // Check admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Access denied</div>
  }

  // Verify admin access level
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_content, can_manage_system, full_name')
    .eq('user_id', user.id)
    .single()

  if (!adminProfile || (!adminProfile.can_manage_content && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need content management privileges to access education settings.
          </p>
        </ACTCard>
      </div>
    )
  }

  const settingsCategories = [
    {
      id: 'program-approval',
      title: 'Program Approval Settings',
      description: 'Configure automatic approval rules and review requirements',
      icon: CheckCircle,
      color: 'success',
      settings: [
        {
          key: 'auto_approve_verified_partners',
          label: 'Auto-approve programs from verified partners',
          type: 'toggle',
          value: true,
          description: 'Programs from verified partners are automatically approved'
        },
        {
          key: 'min_program_duration',
          label: 'Minimum program duration (hours)',
          type: 'number',
          value: 8,
          description: 'Minimum duration required for programs to be listed'
        },
        {
          key: 'require_certification_proof',
          label: 'Require certification proof',
          type: 'toggle',
          value: false,
          description: 'Require documentation for certification programs'
        }
      ]
    },
    {
      id: 'content-moderation',
      title: 'Content Moderation',
      description: 'Set guidelines for program content and descriptions',
      icon: Shield,
      color: 'warning',
      settings: [
        {
          key: 'max_description_length',
          label: 'Maximum description length',
          type: 'number',
          value: 2000,
          description: 'Character limit for program descriptions'
        },
        {
          key: 'filter_inappropriate_content',
          label: 'Filter inappropriate content',
          type: 'toggle',
          value: true,
          description: 'Automatically flag content that may be inappropriate'
        },
        {
          key: 'require_climate_relevance',
          label: 'Require climate relevance',
          type: 'toggle',
          value: true,
          description: 'Programs must demonstrate climate relevance'
        }
      ]
    },
    {
      id: 'pricing-policies',
      title: 'Pricing & Access Policies',
      description: 'Configure pricing display and access restrictions',
      icon: DollarSign,
      color: 'info',
      settings: [
        {
          key: 'max_program_cost',
          label: 'Maximum program cost ($)',
          type: 'number',
          value: 5000,
          description: 'Maximum cost allowed for listed programs'
        },
        {
          key: 'highlight_free_programs',
          label: 'Highlight free programs',
          type: 'toggle',
          value: true,
          description: 'Give priority display to free programs'
        },
        {
          key: 'allow_scholarship_info',
          label: 'Allow scholarship information',
          type: 'toggle',
          value: true,
          description: 'Partners can include scholarship availability'
        }
      ]
    },
    {
      id: 'user-experience',
      title: 'User Experience Settings',
      description: 'Configure how users interact with education programs',
      icon: Users,
      color: 'primary',
      settings: [
        {
          key: 'enable_program_ratings',
          label: 'Enable program ratings',
          type: 'toggle',
          value: true,
          description: 'Allow users to rate and review programs'
        },
        {
          key: 'show_enrollment_numbers',
          label: 'Show enrollment numbers',
          type: 'toggle',
          value: false,
          description: 'Display how many users are enrolled'
        },
        {
          key: 'enable_waitlists',
          label: 'Enable waitlists',
          type: 'toggle',
          value: true,
          description: 'Allow users to join waitlists for full programs'
        }
      ]
    },
    {
      id: 'certification-standards',
      title: 'Certification Standards',
      description: 'Set standards for certification programs and credentials',
      icon: Award,
      color: 'accent',
      settings: [
        {
          key: 'require_accreditation_info',
          label: 'Require accreditation information',
          type: 'toggle',
          value: true,
          description: 'Certification programs must provide accreditation details'
        },
        {
          key: 'verify_certification_bodies',
          label: 'Verify certification bodies',
          type: 'toggle',
          value: false,
          description: 'Manually verify all certification authorities'
        },
        {
          key: 'min_certification_hours',
          label: 'Minimum hours for certification',
          type: 'number',
          value: 20,
          description: 'Minimum program hours to offer certification'
        }
      ]
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-moss-green/10 to-settings/10">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-moss-green/20 rounded-full">
                <Settings className="h-8 w-8 text-moss-green" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  Education Settings
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Configure education program policies and platform behavior
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ACTButton variant="outline" size="lg">
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset to Defaults
              </ACTButton>
              <ACTButton variant="primary" size="lg">
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </ACTButton>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-success/10 rounded-full mx-auto w-fit mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="text-2xl font-bold text-success mb-2">Active</div>
          <div className="text-sm text-base-content/70">Settings Status</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-info/10 rounded-full mx-auto w-fit mb-4">
            <Clock className="h-8 w-8 text-info" />
          </div>
          <div className="text-2xl font-bold text-info mb-2">2 min ago</div>
          <div className="text-sm text-base-content/70">Last Updated</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-warning/10 rounded-full mx-auto w-fit mb-4">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning mb-2">0</div>
          <div className="text-sm text-base-content/70">Pending Reviews</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-primary/10 rounded-full mx-auto w-fit mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mb-2">23</div>
          <div className="text-sm text-base-content/70">Settings Configured</div>
        </ACTCard>
      </div>

      {/* Settings Categories */}
      <div className="space-y-6">
        {settingsCategories.map((category) => {
          const IconComponent = category.icon
          return (
            <section key={category.id}>
              <ACTFrameElement variant="brackets" size="lg" className="mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${category.color}/10 rounded-full`}>
                    <IconComponent className={`h-6 w-6 text-${category.color}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-midnight-forest">
                      {category.title}
                    </h2>
                    <p className="text-base-content/70">
                      {category.description}
                    </p>
                  </div>
                </div>
              </ACTFrameElement>

              <ACTCard variant="outlined" className="p-6">
                <div className="space-y-6">
                  {category.settings.map((setting) => (
                    <div key={setting.key} className="border-b border-base-200 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-midnight-forest mb-1">
                            {setting.label}
                          </h3>
                          <p className="text-sm text-base-content/70 mb-3">
                            {setting.description}
                          </p>
                        </div>
                        
                        <div className="ml-6">
                          {setting.type === 'toggle' ? (
                            <div className="form-control">
                              <label className="label cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="toggle toggle-primary" 
                                  defaultChecked={setting.value as boolean}
                                />
                              </label>
                            </div>
                          ) : setting.type === 'number' ? (
                            <input
                              type="number"
                              className="input input-bordered w-32"
                              defaultValue={setting.value as number}
                            />
                          ) : (
                            <input
                              type="text"
                              className="input input-bordered w-48"
                              defaultValue={String(setting.value)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ACTCard>
            </section>
          )
        })}
      </div>

      {/* Advanced Settings */}
      <section>
        <ACTFrameElement variant="open" size="md" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Advanced Configuration
          </h2>
          <p className="text-base-content/70">
            System-level settings requiring elevated privileges
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ACTCard variant="outlined" className="p-6">
            <h3 className="text-xl font-bold text-midnight-forest mb-4">
              API Integration Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">External API Rate Limit</span>
                </label>
                <input type="number" className="input input-bordered w-full" defaultValue={100} />
                <label className="label">
                  <span className="label-text-alt">Requests per minute for education APIs</span>
                </label>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Cache Duration (minutes)</span>
                </label>
                <input type="number" className="input input-bordered w-full" defaultValue={15} />
                <label className="label">
                  <span className="label-text-alt">How long to cache program data</span>
                </label>
              </div>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6">
            <h3 className="text-xl font-bold text-midnight-forest mb-4">
              Data Export Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Export Format</span>
                </label>
                <select className="select select-bordered w-full">
                  <option>CSV</option>
                  <option>JSON</option>
                  <option>Excel</option>
                </select>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Retention Period (days)</span>
                </label>
                <input type="number" className="input input-bordered w-full" defaultValue={90} />
                <label className="label">
                  <span className="label-text-alt">How long to keep exported files</span>
                </label>
              </div>
            </div>
          </ACTCard>
        </div>
      </section>

      {/* Save Actions */}
      <section className="border-t pt-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-base-content/60">
              Changes will be applied immediately and may affect user experience
            </p>
          </div>
          <div className="flex gap-4">
            <ACTButton variant="outline" size="lg" href="/admin/education-programs">
              <BookOpen className="h-5 w-5 mr-2" />
              Manage Programs
            </ACTButton>
            <ACTButton variant="ghost" size="lg">
              <Eye className="h-5 w-5 mr-2" />
              Preview Changes
            </ACTButton>
            <ACTButton variant="primary" size="lg">
              <Save className="h-5 w-5 mr-2" />
              Save All Settings
            </ACTButton>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="secondary" size="lg" href="/admin/settings">
          <Settings className="h-5 w-5 mr-2" />
          Platform Settings
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/dashboard">
          Back to Dashboard
        </ACTButton>
      </section>
    </div>
  )
} 