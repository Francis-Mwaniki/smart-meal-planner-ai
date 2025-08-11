'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserPreferences, ApiResponse } from '@/types';

export default function UserPreferencesForm() {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: '',
    userId: '',
    dietaryRestrictions: [],
    allergies: [],
    preferredCuisines: [],
    maxCookingTime: 60,
    maxCalories: 2000,
    maxCost: 50,
    servingSize: 2,
    mealPlanningFrequency: 'weekly',
    notificationPreferences: {
      email: true,
      push: false,
      sms: false,
    },
    healthGoals: [],
    skillLevel: 'intermediate',
    timeOfDay: 'evening',
    spiceTolerance: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dietaryRestrictionOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'shellfish-free',
    'pescatarian', 'keto', 'paleo', 'low-carb', 'low-sodium', 'low-fat'
  ];

  const cuisineOptions = [
    'italian', 'mexican', 'asian', 'american', 'mediterranean', 'indian', 'french',
    'thai', 'japanese', 'chinese', 'greek', 'spanish', 'middle-eastern', 'african'
  ];

  const healthGoalOptions = [
    'weight-loss', 'muscle-gain', 'maintenance', 'heart-health', 'diabetes-management',
    'energy-boost', 'digestive-health', 'immune-support', 'anti-inflammatory'
  ];

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner - Learning basic cooking techniques' },
    { value: 'intermediate', label: 'Intermediate - Comfortable with most recipes' },
    { value: 'advanced', label: 'Advanced - Can create and modify recipes' },
    { value: 'expert', label: 'Expert - Professional-level cooking skills' }
  ];

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { value: 'evening', label: 'Evening (6 PM - 12 AM)' },
    { value: 'late-night', label: 'Late Night (12 AM - 6 AM)' }
  ];

  const spiceToleranceOptions = [
    { value: 'mild', label: 'Mild - Prefer subtle flavors' },
    { value: 'medium', label: 'Medium - Enjoy balanced spiciness' },
    { value: 'hot', label: 'Hot - Love intense flavors' },
    { value: 'extreme', label: 'Extreme - Can handle very spicy food' }
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
    }
  }, [session?.user?.id]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data: ApiResponse<UserPreferences> = await response.json();
        if (data.success) {
          setPreferences(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!session?.user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const data: ApiResponse<UserPreferences> = await response.json();
        if (data.success) {
          setMessage({ type: 'success', text: 'Preferences saved successfully!' });
          setPreferences(data.data);
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to save preferences' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    const currentArray = preferences[field] as string[];
    let newArray: string[];

    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }

    setPreferences(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleNotificationChange = (type: keyof typeof preferences.notificationPreferences, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [type]: checked
      }
    }));
  };

  const addAllergy = (allergy: string) => {
    if (allergy.trim() && !preferences.allergies.includes(allergy.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy.trim()]
      }));
    }
  };

  const removeAllergy = (allergy: string) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const renderArrayField = (
    field: keyof UserPreferences,
    options: string[],
    label: string,
    description?: string
  ) => (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${field}-${option}`}
              checked={preferences[field]?.includes(option)}
              onCheckedChange={(checked) => 
                handleArrayChange(field, option, checked as boolean)
              }
            />
            <Label htmlFor={`${field}-${option}`} className="text-sm capitalize">
              {option.replace('-', ' ')}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dietary Preferences & Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dietary Restrictions */}
          {renderArrayField(
            'dietaryRestrictions',
            dietaryRestrictionOptions,
            'Dietary Restrictions',
            'Select all that apply to your diet'
          )}

          {/* Allergies */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Food Allergies & Intolerances</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Add any food allergies or intolerances you have
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add allergy (e.g., peanuts, shellfish)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllergy((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="allergy"]') as HTMLInputElement;
                  if (input?.value) {
                    addAllergy(input.value);
                    input.value = '';
                  }
                }}
              >
                Add
              </Button>
            </div>

            {preferences.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preferences.allergies.map((allergy) => (
                  <Badge key={allergy} variant="secondary" className="gap-1">
                    {allergy}
                    <button
                      onClick={() => removeAllergy(allergy)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Cuisines */}
          {renderArrayField(
            'preferredCuisines',
            cuisineOptions,
            'Preferred Cuisines',
            'Select cuisines you enjoy most'
          )}

          {/* Health Goals */}
          {renderArrayField(
            'healthGoals',
            healthGoalOptions,
            'Health Goals',
            'What are your primary health objectives?'
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cooking Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Level */}
            <div className="space-y-3">
              <Label htmlFor="skill-level">Cooking Skill Level</Label>
              <Select value={preferences.skillLevel} onValueChange={(value) => setPreferences(prev => ({ ...prev, skillLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Time */}
            <div className="space-y-3">
              <Label htmlFor="time-of-day">Preferred Cooking Time</Label>
              <Select value={preferences.timeOfDay} onValueChange={(value) => setPreferences(prev => ({ ...prev, timeOfDay: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOfDayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spice Tolerance */}
            <div className="space-y-3">
              <Label htmlFor="spice-tolerance">Spice Tolerance</Label>
              <Select value={preferences.spiceTolerance} onValueChange={(value) => setPreferences(prev => ({ ...prev, spiceTolerance: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spiceToleranceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meal Planning Frequency */}
            <div className="space-y-3">
              <Label htmlFor="planning-frequency">Meal Planning Frequency</Label>
              <Select value={preferences.mealPlanningFrequency} onValueChange={(value) => setPreferences(prev => ({ ...prev, mealPlanningFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limits & Constraints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Max Cooking Time */}
            <div className="space-y-3">
              <Label htmlFor="max-cooking-time">Max Cooking Time (minutes)</Label>
              <Input
                id="max-cooking-time"
                type="number"
                min="15"
                max="300"
                value={preferences.maxCookingTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxCookingTime: parseInt(e.target.value) || 60 }))}
              />
            </div>

            {/* Max Calories */}
            <div className="space-y-3">
              <Label htmlFor="max-calories">Max Calories per Meal</Label>
              <Input
                id="max-calories"
                type="number"
                min="100"
                max="2000"
                value={preferences.maxCalories}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxCalories: parseInt(e.target.value) || 2000 }))}
              />
            </div>

            {/* Max Cost */}
            <div className="space-y-3">
              <Label htmlFor="max-cost">Max Cost per Meal ($)</Label>
              <Input
                id="max-cost"
                type="number"
                min="5"
                max="100"
                step="0.50"
                value={preferences.maxCost}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxCost: parseFloat(e.target.value) || 50 }))}
              />
            </div>

            {/* Serving Size */}
            <div className="space-y-3">
              <Label htmlFor="serving-size">Default Serving Size</Label>
              <Input
                id="serving-size"
                type="number"
                min="1"
                max="10"
                value={preferences.servingSize}
                onChange={(e) => setPreferences(prev => ({ ...prev, servingSize: parseInt(e.target.value) || 2 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">How would you like to receive notifications?</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notifications"
                  checked={preferences.notificationPreferences.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked as boolean)}
                />
                <Label htmlFor="email-notifications">Email notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push-notifications"
                  checked={preferences.notificationPreferences.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked as boolean)}
                />
                <Label htmlFor="push-notifications">Push notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms-notifications"
                  checked={preferences.notificationPreferences.sms}
                  onCheckedChange={(checked) => handleNotificationChange('sms', checked as boolean)}
                />
                <Label htmlFor="sms-notifications">SMS notifications</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="additional-notes">
              Any other preferences or special requirements we should know about?
            </Label>
            <Textarea
              id="additional-notes"
              placeholder="E.g., I prefer organic ingredients, I'm training for a marathon, I have a small kitchen..."
              className="min-h-[100px]"
              value={preferences.additionalNotes || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button and Message */}
      <div className="space-y-4">
        {message && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving} size="lg">
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
