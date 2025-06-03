"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

/**
 * Partner Profile Form Component
 * 
 * Allows partners to create and edit their organization profiles with climate economy specific fields.
 * Includes organization details, climate focus areas, partnership level, and contact information.
 * Located: /components/partner-profile-form.tsx
 */

interface PartnerProfile {
  id?: string;
  organization_name: string;
  organization_type: string;
  website: string;
  description: string;
  partnership_level: string;
  climate_focus: string[];
  verified: boolean;
  contact_info: {
    phone?: string;
    contact_person?: string;
    address?: string;
  };
}

interface PartnerProfileFormProps {
  initialData?: PartnerProfile | null;
  onSave?: (profile: PartnerProfile) => void;
}

const ORGANIZATION_TYPES = [
  { value: "employer", label: "Employer" },
  { value: "education", label: "Education Provider" },
  { value: "community", label: "Community Organization" },
  { value: "government", label: "Government Agency" },
  { value: "nonprofit", label: "Nonprofit Organization" }
];

const PARTNERSHIP_LEVELS = [
  { value: "standard", label: "Standard Partner" },
  { value: "premium", label: "Premium Partner" },
  { value: "founding", label: "Founding Partner" }
];

const CLIMATE_FOCUS_OPTIONS = [
  "solar", "wind", "energy_efficiency", "offshore_wind", "energy_storage",
  "renewable_energy", "technical_education", "workforce_development", 
  "career_guidance", "equity", "immigrant_professionals", "workforce_integration",
  "job_placement", "clean_energy", "climate_action", "community_initiatives"
];

export function PartnerProfileForm({ initialData, onSave }: PartnerProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<PartnerProfile>({
    organization_name: "",
    organization_type: "employer",
    website: "",
    description: "",
    partnership_level: "standard",
    climate_focus: [],
    verified: false,
    contact_info: {}
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        climate_focus: initialData.climate_focus || [],
        contact_info: initialData.contact_info || {}
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof PartnerProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const handleClimateFocusChange = (focus: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      climate_focus: checked 
        ? [...prev.climate_focus, focus]
        : prev.climate_focus.filter(f => f !== focus)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.organization_name.trim()) {
      setError("Organization name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (formData.website && !formData.website.startsWith("http")) {
      setError("Website must be a valid URL starting with http:// or https://");
      return false;
    }
    if (formData.climate_focus.length === 0) {
      setError("Please select at least one climate focus area");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Prepare data for database
      const profileData = {
        organization_name: formData.organization_name.trim(),
        organization_type: formData.organization_type,
        website: formData.website.trim() || null,
        description: formData.description.trim(),
        partnership_level: formData.partnership_level,
        climate_focus: formData.climate_focus,
        contact_info: formData.contact_info,
        updated_at: new Date().toISOString()
      };

      // Update or insert profile
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSuccess(true);
      if (onSave) {
        onSave({ ...formData, id: user.id });
      }

      // Redirect to partner dashboard after successful save
      setTimeout(() => {
        router.push("/protected/partners");
      }, 2000);

    } catch (error: any) {
      console.error("Error saving partner profile:", error);
      setError(error.message || "An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">
            {initialData ? "Edit Partner Profile" : "Create Partner Profile"}
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <span>Profile saved successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Organization Name *</span>
                </label>
                <Input
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange("organization_name", e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter your organization name"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Organization Type *</span>
                </label>
                <select
                  value={formData.organization_type}
                  onChange={(e) => handleInputChange("organization_type", e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  {ORGANIZATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Website</span>
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="https://your-website.com"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Partnership Level</span>
                </label>
                <select
                  value={formData.partnership_level}
                  onChange={(e) => handleInputChange("partnership_level", e.target.value)}
                  className="select select-bordered w-full"
                >
                  {PARTNERSHIP_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description *</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="textarea textarea-bordered h-24"
                placeholder="Describe your organization, mission, and climate economy focus..."
                required
              />
            </div>

            {/* Climate Focus Areas */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Climate Focus Areas * (Select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 border border-base-300 rounded-lg">
                {CLIMATE_FOCUS_OPTIONS.map(focus => (
                  <label key={focus} className="label cursor-pointer justify-start">
                    <input
                      type="checkbox"
                      checked={formData.climate_focus.includes(focus)}
                      onChange={(e) => handleClimateFocusChange(focus, e.target.checked)}
                      className="checkbox checkbox-primary checkbox-sm mr-2"
                    />
                    <span className="label-text text-sm">
                      {focus.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Contact Person</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.contact_info.contact_person || ""}
                      onChange={(e) => handleContactInfoChange("contact_person", e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Primary contact name"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Phone</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.contact_info.phone || ""}
                      onChange={(e) => handleContactInfoChange("phone", e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Contact phone number"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <Textarea
                    value={formData.contact_info.address || ""}
                    onChange={(e) => handleContactInfoChange("address", e.target.value)}
                    className="textarea textarea-bordered h-16"
                    placeholder="Organization address"
                  />
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {initialData && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Verification Status:</span>
                    <div className={`badge ${formData.verified ? 'badge-success' : 'badge-warning'}`}>
                      {formData.verified ? 'Verified Partner' : 'Pending Verification'}
                    </div>
                  </div>
                  {!formData.verified && (
                    <p className="text-sm text-base-content/70 mt-2">
                      Your partner profile is pending admin verification. Once verified, you'll have access to additional features.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="card-actions justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>Save Profile</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 