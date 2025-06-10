"use client";

import { useState, useEffect } from 'react';
import { ACTCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Briefcase, Target, DollarSign, Clock, Save } from 'lucide-react';

interface CareerPreferencesSectionProps {
  userId: string;
  currentPreferences?: Record<string, unknown>;
}

const EMPLOYMENT_TYPES = [
  'full_time',
  'part_time', 
  'contract',
  'freelance',
  'internship'
];

const EXPERIENCE_LEVELS = [
  'entry_level',
  'mid_level',
  'senior_level',
  'executive',
  'student'
];

const CLIMATE_FOCUS_AREAS = [
  'renewable_energy',
  'sustainability',
  'climate_policy',
  'green_technology',
  'environmental_science',
  'carbon_markets',
  'clean_transportation',
  'sustainable_agriculture',
  'circular_economy',
  'climate_finance'
];

export function CareerPreferencesSection({ userId, currentPreferences }: CareerPreferencesSectionProps) {
  const [preferences, setPreferences] = useState({
    preferred_locations: (currentPreferences?.preferred_locations as string[]) || [],
    employment_types: (currentPreferences?.employment_types as string[]) || [],
    experience_level: (currentPreferences?.experience_level as string) || '',
    climate_focus_areas: (currentPreferences?.climate_focus_areas as string[]) || [],
    salary_range_min: (currentPreferences?.salary_range_min as string) || '',
    salary_range_max: (currentPreferences?.salary_range_max as string) || '',
    remote_work_preference: (currentPreferences?.remote_work_preference as string) || 'hybrid',
    career_goals: (currentPreferences?.career_goals as string) || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const { toast } = useToast();
  const supabase = createClient();

  const handleAddLocation = () => {
    if (newLocation.trim() && !preferences.preferred_locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((l: string) => l !== location)
    }));
  };

  const handleToggleEmploymentType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      employment_types: prev.employment_types.includes(type)
        ? prev.employment_types.filter((t: string) => t !== type)
        : [...prev.employment_types, type]
    }));
  };

  const handleToggleClimateFocus = (area: string) => {
    setPreferences(prev => ({
      ...prev,
      climate_focus_areas: prev.climate_focus_areas.includes(area)
        ? prev.climate_focus_areas.filter((a: string) => a !== area)
        : [...prev.climate_focus_areas, area]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('job_seeker_profiles')
        .upsert({
          user_id: userId,
          ...preferences,
          preferences_updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Preferences saved",
        description: "Your career preferences have been updated successfully",
      });

    } catch (error) {
      console.error('Save preferences error:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ACTCard
      variant="outlined"
      title="Career Preferences"
      className="w-full"
    >
      <div className="space-y-8">
        {/* Location Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-spring-green" />
            <Label className="text-base font-medium">Preferred Locations</Label>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Add a location (e.g., San Francisco, Remote)"
              onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
            />
            <Button type="button" onClick={handleAddLocation} variant="outline">
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {preferences.preferred_locations.map((location: string) => (
              <span
                key={location}
                className="bg-spring-green/10 text-spring-green px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {location}
                <button
                  onClick={() => handleRemoveLocation(location)}
                  className="hover:text-spring-green/70"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Remote Work Preference */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Remote Work Preference</Label>
          <div className="grid grid-cols-3 gap-2">
            {['remote', 'hybrid', 'onsite'].map((type) => (
              <button
                key={type}
                onClick={() => setPreferences(prev => ({ ...prev, remote_work_preference: type }))}
                className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                  preferences.remote_work_preference === type
                    ? 'border-spring-green bg-spring-green/10 text-spring-green'
                    : 'border-midnight-forest/20 hover:border-spring-green/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Employment Types */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-spring-green" />
            <Label className="text-base font-medium">Employment Types</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EMPLOYMENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleToggleEmploymentType(type)}
                className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                  preferences.employment_types.includes(type)
                    ? 'border-spring-green bg-spring-green/10 text-spring-green'
                    : 'border-midnight-forest/20 hover:border-spring-green/50'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-spring-green" />
            <Label className="text-base font-medium">Experience Level</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setPreferences(prev => ({ ...prev, experience_level: level }))}
                className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                  preferences.experience_level === level
                    ? 'border-spring-green bg-spring-green/10 text-spring-green'
                    : 'border-midnight-forest/20 hover:border-spring-green/50'
                }`}
              >
                {level.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Climate Focus Areas */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Climate Focus Areas</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CLIMATE_FOCUS_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => handleToggleClimateFocus(area)}
                className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                  preferences.climate_focus_areas.includes(area)
                    ? 'border-spring-green bg-spring-green/10 text-spring-green'
                    : 'border-midnight-forest/20 hover:border-spring-green/50'
                }`}
              >
                {area.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-spring-green" />
            <Label className="text-base font-medium">Salary Range (USD)</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-midnight-forest/70">Minimum</Label>
              <Input
                type="number"
                value={preferences.salary_range_min}
                onChange={(e) => setPreferences(prev => ({ ...prev, salary_range_min: e.target.value }))}
                placeholder="50,000"
              />
            </div>
            <div>
              <Label className="text-sm text-midnight-forest/70">Maximum</Label>
              <Input
                type="number"
                value={preferences.salary_range_max}
                onChange={(e) => setPreferences(prev => ({ ...prev, salary_range_max: e.target.value }))}
                placeholder="100,000"
              />
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Career Goals</Label>
          <textarea
            value={preferences.career_goals}
            onChange={(e) => setPreferences(prev => ({ ...prev, career_goals: e.target.value }))}
            placeholder="Describe your career goals and aspirations in the climate economy..."
            className="w-full p-3 border border-midnight-forest/20 rounded-lg resize-none h-24 focus:ring-2 focus:ring-spring-green/30 focus:border-spring-green/50"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-midnight-forest/10">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-spring-green hover:bg-spring-green/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </ACTCard>
  );
} 