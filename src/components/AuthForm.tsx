'use client';

import { useState } from 'react';
import type { PatientProfile } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  onSuccess: (profile: PatientProfile) => void;
}

type StatusType = 'info' | 'success' | 'error';

export default function EmailAuthForm({ onSuccess }: Props) {
  const [step, setStep] = useState<'email' | 'profile' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>('info');

  const [email, setEmail] = useState('');
  const [needsProfile, setNeedsProfile] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [conditions, setConditions] = useState<string[]>(['']);

  // OTP
  const [otp, setOtp] = useState('');

  const handleConditionChange = (index: number, value: string) => {
    const updated = [...conditions];
    updated[index] = value;
    setConditions(updated);
  };
  const addCondition = () => setConditions([...conditions, '']);
  const removeCondition = (index: number) =>
    setConditions(conditions.filter((_, i) => i !== index));

  const showStatus = (msg: string, type: StatusType = 'info') => {
    setStatusMessage(msg);
    setStatusType(type);
  };

  // --- Step 1: Email submit - Automatically send OTP ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return showStatus('Enter your email', 'error');
    setLoading(true);
    setStatusMessage(null);

    try {
      // Send OTP immediately - let Supabase handle user creation
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: window.location.origin, 
          shouldCreateUser: true // Automatically create user if they don't exist
        },
      });
      if (otpError) throw otpError;

      setStep('otp');
      showStatus('✅ Verification code sent! Check your email.', 'success');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showStatus(err.message || 'Failed to send verification code', 'error');
      } else {
        showStatus('Failed to send verification code', 'error');
      }
    } finally {
      setLoading(false);
    }
  };



  // --- Step 2: Profile submit ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            firstName,
            lastName,
            dob,
            gender,
            country,
            city,
            conditions: conditions.filter(c => c.trim() !== ''),
          },
        ])
        .select('*')
        .single();
      if (insertError) throw insertError;

      showStatus('✅ Profile created! Logging you in...', 'success');
      setTimeout(() => onSuccess(newProfile as PatientProfile), 1500);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showStatus(err.message || 'Something went wrong', 'error');
      } else {
        showStatus('Something went wrong', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Verify OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !email) return showStatus('Enter verification code', 'error');
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      // Check if user has a profile in our users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (profileError) throw profileError;

      if (!profileData) {
        // New user needs to complete profile
        setNeedsProfile(true);
        setStep('profile');
        showStatus('Welcome! Please complete your profile.', 'info');
      } else {
        // Existing user with complete profile
        showStatus('✅ Verification successful! Logging in...', 'success');
        setTimeout(() => onSuccess(profileData as PatientProfile), 1500);
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showStatus(err.message || 'Failed to verify code', 'error');
      } else {
        showStatus('Failed to verify code', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () =>
    statusMessage && (
      <p
        className={`text-center text-sm ${statusType === 'success'
          ? 'text-[var(--color-success)]'
          : statusType === 'error'
            ? 'text-[var(--color-danger)]'
            : 'text-[var(--color-muted)]'
          }`}
      >
        {statusMessage}
      </p>
    );

  const inputClass =
    'w-full border rounded p-2 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--color-muted)]';

  // --- Step 1 UI ---
  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto p-6 space-y-4">
        {renderStatus()}
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
        >
          {loading ? 'Sending verification code...' : 'Sign In'}
        </button>
        <p className="text-xs text-center text-[var(--color-muted)]">
          We'll send a verification code to your email
        </p>
      </form>
    );
  }

  // --- Profile UI ---
  if (step === 'profile' && needsProfile) {
    return (
      <form onSubmit={handleProfileSubmit} className="max-w-md mx-auto p-6 space-y-3">
        {renderStatus()}
        <h2 className="text-2xl font-bold">Sign Up</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className={inputClass + ' w-1/2'}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className={inputClass + ' w-1/2'}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            placeholder="YYYY-MM-DD"
            className={inputClass + ' w-1/2'}
          />
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className={inputClass + ' w-1/2'}
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
            className={inputClass + ' w-1/2'}
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            className={inputClass + ' w-1/2'}
          />
        </div>
        {conditions.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              placeholder="Medical Condition"
              value={c}
              onChange={e => handleConditionChange(i, e.target.value)}
              className={inputClass + ' w-full'}
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => removeCondition(i)}
                className="px-2 py-1 bg-[var(--color-danger)] text-white rounded"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addCondition}
          className="px-3 py-1 bg-[var(--color-primary)] text-white rounded"
        >
          + Add Condition
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--color-success)] text-white rounded hover:bg-[var(--color-success-hover)]"
        >
          {loading ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </form>
    );
  }

  // --- OTP UI ---
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto p-6 space-y-4">
        {renderStatus()}
        <p className="text-center">Enter the 6-digit verification code sent to:</p>
        <p className="text-center font-semibold">{email}</p>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          required
          className={`${inputClass} text-center text-lg tracking-widest`}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        <p className="text-xs text-center text-[var(--color-muted)]">
          Didn't receive the code? Check your spam folder or try again
        </p>
      </form>
    );
  }

  return null;
}
