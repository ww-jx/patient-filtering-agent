'use client';

import { useState, useEffect } from 'react';
import type { PatientProfile } from '@/lib/types';

interface Props {
  profile: PatientProfile;
  onUpdate?: (updatedProfile: PatientProfile) => void;
}

export function UpdateProfile({ profile, onUpdate }: Props) {
  const [form, setForm] = useState<PatientProfile>(profile);
  const [loading, setLoading] = useState(false);
  const [newCondition, setNewCondition] = useState('');

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleChange = <K extends keyof PatientProfile>(
    key: K,
    value: PatientProfile[K]
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleConditionChange = (index: number, value: string) => {
    const updated = [...form.conditions];
    updated[index] = value;
    handleChange('conditions', updated);
  };

  const addCondition = () => {
    if (newCondition.trim() === '') return;
    handleChange('conditions', [...form.conditions, newCondition.trim()]);
    setNewCondition('');
  };

  const removeCondition = (index: number) => {
    const updated = [...form.conditions];
    updated.splice(index, 1);
    handleChange('conditions', updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update profile');

      const data = await res.json();
      localStorage.setItem('profile', JSON.stringify(data.user));
      onUpdate?.(data.user);

      alert('Profile updated successfully!');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        alert(err.message || 'An error occurred');
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-bordered w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-heading text-2xl sm:text-3xl font-semibold">Update Profile</h2>

      {/* First and Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">First Name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">Last Name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="text-sm text-muted mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => handleChange('email', e.target.value)}
          className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
        />
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">Date of Birth</label>
          <input
            type="date"
            value={form.dob}
            onChange={e => handleChange('dob', e.target.value)}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={e => handleChange("gender", e.target.value as PatientProfile["gender"])}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Country & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={e => handleChange('country', e.target.value)}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={e => handleChange('city', e.target.value)}
            className="border border-muted rounded px-3 py-2 w-full bg-background text-foreground placeholder:text-muted"
          />
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <label className="text-sm text-muted mb-1">Medical Conditions</label>
        {form.conditions.map((c, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input
              type="text"
              value={c}
              onChange={e => handleConditionChange(i, e.target.value)}
              className="flex-1 border border-muted rounded px-3 py-2 w-full sm:w-auto bg-background text-foreground placeholder:text-muted"
            />
            <button onClick={() => removeCondition(i)} className="btn-danger w-full sm:w-auto">
              Delete
            </button>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="text"
            value={newCondition}
            onChange={e => setNewCondition(e.target.value)}
            placeholder="Add new condition"
            className="flex-1 border border-muted rounded px-3 py-2 w-full sm:w-auto bg-background text-foreground placeholder:text-muted"
          />
          <button onClick={addCondition} className="btn-primary w-full sm:w-auto">
            Add
          </button>
        </div>
      </div>

      <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
