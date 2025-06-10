"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IOSContainer, IOSGrid } from "@/components/layout/IOSLayout";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save, 
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Target
} from "lucide-react";

/**
 * Partner Profile Form Component - iOS Design System
 * Modern partner profile form with iOS-inspired design
 * Location: components/partners/partner-profile-form.tsx
 */

interface PartnerProfile {
  organization_name: string;
  organization_type: string;
  industry: string;
  employee_count: string;
  website: string;
  description: string;
  services_offered: string[];
  focus_areas: string[];
  contact_info: {
    contact_person?: string;
    phone?: string;
    address?: string;
  };
  partnership_goals: string;
  created_at?: string;
  updated_at?: string;
}

interface PartnerProfileFormProps {
  initialData?: PartnerProfile;
  onSave?: (data: PartnerProfile) => void;
}

export function PartnerProfileForm({ initialData, onSave }: PartnerProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<PartnerProfile>({
    organization_name: initialData?.organization_name || "",
    organization_type: initialData?.organization_type || "",
    industry: initialData?.industry || "",
    employee_count: initialData?.employee_count || "",
    website: initialData?.website || "",
    description: initialData?.description || "",
    services_offered: initialData?.services_offered || [],
    focus_areas: initialData?.focus_areas || [],
    contact_info: {
      contact_person: initialData?.contact_info?.contact_person || "",
      phone: initialData?.contact_info?.phone || "",
      address: initialData?.contact_info?.address || "",
    },
    partnership_goals: initialData?.partnership_goals || "",
  });

  const handleInputChange = (field: keyof PartnerProfile, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactInfoChange = (field: keyof PartnerProfile['contact_info'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: 'services_offered' | 'focus_areas', values: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.organization_name || !formData.organization_type || !formData.industry) {
        throw new Error("Please fill in all required fields");
      }

      // Here you would typically make an API call
      // await createOrUpdatePartnerProfile(formData);
      
      if (onSave) {
        onSave(formData);
      }

      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/partners");
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const organizationTypes = [
    "Technology Company",
    "Consulting Firm", 
    "Non-Profit Organization",
    "Government Agency",
    "Research Institution",
    "Financial Services",
    "Energy Company",
    "Other"
  ];

  const industries = [
    "Clean Energy",
    "Climate Technology",
    "Environmental Services",
    "Sustainable Finance",
    "Green Building",
    "Transportation",
    "Agriculture",
    "Water Management",
    "Waste Management",
    "Other"
  ];

  const employeeCounts = [
    "1-10",
    "11-50", 
    "51-200",
    "201-500",
    "501-1000",
    "1000+"
  ];

  const serviceOptions = [
    "Climate Risk Assessment",
    "Sustainability Consulting",
    "Carbon Footprint Analysis",
    "Renewable Energy Solutions",
    "ESG Reporting",
    "Green Finance",
    "Environmental Impact Assessment",
    "Climate Adaptation Planning",
    "Energy Efficiency Audits",
    "Emissions Management"
  ];

  const focusAreaOptions = [
    "Climate Adaptation",
    "Mitigation Strategies",
    "Renewable Energy",
    "Energy Efficiency",
    "Sustainable Transportation",
    "Green Infrastructure",
    "Carbon Management",
    "Climate Finance",
    "Policy Development",
    "Community Resilience"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <IOSContainer variant="glass" padding="xl" className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-2xl mx-auto mb-4 flex items-center justify-center shadow-ios-subtle">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-ios-title-1 text-midnight-forest mb-2">
            {initialData ? "Edit Partner Profile" : "Create Partner Profile"}
          </h1>
          <p className="text-ios-subheadline text-midnight-forest/70">
            Complete your organization's profile to join our climate partnership network
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-ios-red/10 border border-ios-red/20 rounded-ios-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-ios-red flex-shrink-0" />
            <span className="text-ios-subheadline text-ios-red">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-ios-green/10 border border-ios-green/20 rounded-ios-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-ios-green flex-shrink-0" />
            <span className="text-ios-subheadline text-ios-green">
              Profile saved successfully! Redirecting to dashboard...
            </span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <IOSContainer variant="frosted" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-spring-green/20 rounded-ios-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-spring-green" />
              </div>
              <h2 className="text-ios-title-3 text-midnight-forest">Basic Information</h2>
            </div>
            
            <IOSGrid columns={2} gap="lg">
              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange("organization_name", e.target.value)}
                  className="input-ios w-full"
                  placeholder="Enter your organization name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Organization Type *
                </label>
                <select
                  value={formData.organization_type}
                  onChange={(e) => handleInputChange("organization_type", e.target.value)}
                  className="input-ios w-full"
                  required
                >
                  <option value="">Select organization type</option>
                  {organizationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  className="input-ios w-full"
                  required
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Employee Count
                </label>
                <select
                  value={formData.employee_count}
                  onChange={(e) => handleInputChange("employee_count", e.target.value)}
                  className="input-ios w-full"
                >
                  <option value="">Select employee count</option>
                  {employeeCounts.map(count => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </IOSGrid>

            <div className="space-y-2 mt-6">
              <label className="text-ios-subheadline text-midnight-forest font-semibold">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-forest/50" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="input-ios w-full pl-11"
                  placeholder="https://www.yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label className="text-ios-subheadline text-midnight-forest font-semibold">
                Organization Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="input-ios w-full h-24 resize-none"
                placeholder="Describe your organization's mission and focus"
              />
            </div>
          </IOSContainer>

          {/* Services & Focus Areas */}
          <IOSContainer variant="frosted" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-moss-green/20 rounded-ios-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-moss-green" />
              </div>
              <h2 className="text-ios-title-3 text-midnight-forest">Services & Focus Areas</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {serviceOptions.map(service => (
                    <label key={service} className="flex items-center gap-3 p-3 bg-white/30 rounded-ios-xl hover:bg-white/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services_offered.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayChange("services_offered", [...formData.services_offered, service]);
                          } else {
                            handleArrayChange("services_offered", formData.services_offered.filter(s => s !== service));
                          }
                        }}
                        className="w-4 h-4 text-spring-green border-ios-gray-300 rounded focus:ring-spring-green"
                      />
                      <span className="text-ios-subheadline text-midnight-forest">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Climate Focus Areas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {focusAreaOptions.map(area => (
                    <label key={area} className="flex items-center gap-3 p-3 bg-white/30 rounded-ios-xl hover:bg-white/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.focus_areas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayChange("focus_areas", [...formData.focus_areas, area]);
                          } else {
                            handleArrayChange("focus_areas", formData.focus_areas.filter(a => a !== area));
                          }
                        }}
                        className="w-4 h-4 text-spring-green border-ios-gray-300 rounded focus:ring-spring-green"
                      />
                      <span className="text-ios-subheadline text-midnight-forest">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </IOSContainer>

          {/* Contact Information */}
          <IOSContainer variant="frosted" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-seafoam-blue/30 rounded-ios-xl flex items-center justify-center">
                <User className="w-5 h-5 text-midnight-forest" />
              </div>
              <h2 className="text-ios-title-3 text-midnight-forest">Contact Information</h2>
            </div>
            
            <IOSGrid columns={2} gap="lg">
              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_info.contact_person || ""}
                  onChange={(e) => handleContactInfoChange("contact_person", e.target.value)}
                  className="input-ios w-full"
                  placeholder="Primary contact name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-ios-subheadline text-midnight-forest font-semibold">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-midnight-forest/50" />
                  <input
                    type="tel"
                    value={formData.contact_info.phone || ""}
                    onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                    className="input-ios w-full pl-11"
                    placeholder="Contact phone number"
                  />
                </div>
              </div>
            </IOSGrid>

            <div className="space-y-2 mt-6">
              <label className="text-ios-subheadline text-midnight-forest font-semibold">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-midnight-forest/50" />
                <textarea
                  value={formData.contact_info.address || ""}
                  onChange={(e) => handleContactInfoChange("address", e.target.value)}
                  className="input-ios w-full h-16 pl-11 resize-none"
                  placeholder="Organization address"
                />
              </div>
            </div>
          </IOSContainer>

          {/* Partnership Goals */}
          <IOSContainer variant="frosted" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ios-blue/20 rounded-ios-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-ios-blue" />
              </div>
              <h2 className="text-ios-title-3 text-midnight-forest">Partnership Goals</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-ios-subheadline text-midnight-forest font-semibold">
                What do you hope to achieve through this partnership?
              </label>
              <textarea
                value={formData.partnership_goals}
                onChange={(e) => handleInputChange("partnership_goals", e.target.value)}
                className="input-ios w-full h-32 resize-none"
                placeholder="Describe your partnership objectives, collaboration interests, and expected outcomes..."
              />
            </div>
          </IOSContainer>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                "btn-ios-primary flex items-center gap-3 px-8 py-4 min-w-[200px]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-ios-body">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span className="text-ios-body">
                    {initialData ? "Update Profile" : "Create Profile"}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </IOSContainer>
    </motion.div>
  );
} 