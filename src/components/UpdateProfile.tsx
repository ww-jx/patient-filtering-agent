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

              // Show success feedback with better UX
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        successMsg.textContent = 'Profile updated successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
          successMsg.classList.add('translate-x-full');
          setTimeout(() => document.body.removeChild(successMsg), 300);
        }, 3000);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        // Show error feedback with better UX
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        errorMsg.textContent = err.message || 'An error occurred';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
          errorMsg.classList.add('translate-x-full');
          setTimeout(() => document.body.removeChild(errorMsg), 300);
        }, 5000);
      } else {
        // Show error feedback with better UX
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        errorMsg.textContent = 'An unexpected error occurred';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
          errorMsg.classList.add('translate-x-full');
          setTimeout(() => document.body.removeChild(errorMsg), 300);
        }, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-orange-200/30 shadow-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Update Profile</h2> */}

        {/* First and Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
              placeholder="Enter last name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
            <input
              type="date"
              value={form.dob}
              onChange={e => handleChange('dob', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Gender</label>
            <select
              value={form.gender}
              onChange={e => handleChange("gender", e.target.value as PatientProfile["gender"])}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMC41OSBMNS45OSA2TDEuNDEgMC40MUwwIDEuODNMNC41OCA2LjQxTDkuMTcgMS44M0wxMC41OSAwLjQxWiIgZmlsbD0iIzY0NzQ4YiIvPgo8L3N2Zz4K')] bg-no-repeat bg-right-3 bg-center pr-10"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Country & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={e => handleChange('country', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
              placeholder="United States"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input
              type="text"
              value={form.city}
              onChange={e => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
              placeholder="San Francisco"
            />
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Medical Conditions</label>
          <div className="space-y-3">
            {form.conditions.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={c}
                  onChange={e => handleConditionChange(i, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
                  placeholder="e.g., Type 2 Diabetes"
                />
                <button 
                  onClick={() => removeCondition(i)} 
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 sm:w-auto w-full"
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                placeholder="Add new condition"
                className="flex-1 px-4 py-3 rounded-xl border border-orange-200 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-200"
                onKeyPress={e => e.key === 'Enter' && addCondition()}
              />
              <button 
                onClick={addCondition} 
                className="px-6 py-3 bg-secondary hover:bg-secondary-hover text-black rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg sm:w-auto w-full"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-orange-200/30">
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full px-6 py-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-black disabled:text-slate-500 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
