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
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

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

  // --- Step 1: Email submit ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return showStatus('Enter your email', 'error');
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: existing, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) throw error;

      const newUser = !existing;
      setIsNewUser(newUser);

      if (newUser) {
        showStatus('Email does not exist. Create a new profile?', 'info');
      } else {
        showStatus('User found! Send OTP?', 'success');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error summarising trial:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Trigger OTP send for existing users ---
  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
      });
      if (otpError) throw otpError;

      setStep('otp');
      showStatus('✅ OTP sent! Check your email.', 'success');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showStatus(err.message || 'Failed to send OTP', 'error');
      } else {
        showStatus('Failed to send OTP', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Proceed to profile creation for new users ---
  const handleCreateProfileStep = () => {
    setStep('profile');
    setStatusMessage(null);
  };

  // --- Step 2: Profile submit ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      if (!isNewUser) return;

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

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
      });
      if (otpError) throw otpError;

      setStep('otp');
      showStatus('✅ Profile created! OTP sent to your email.', 'success');
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
    if (!otp || !email) return showStatus('Enter OTP', 'error');
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profileData) return showStatus('Profile not found.', 'error');

      showStatus('✅ OTP verified! Logging in...', 'success');
      setTimeout(() => onSuccess(profileData as PatientProfile), 2000);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showStatus(err.message || 'Failed to verify OTP', 'error');
      } else {
        showStatus('Failed to verify OTP', 'error');
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
          placeholder="Email"
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
          {loading ? 'Checking...' : 'Check Email'}
        </button>

        {/* Conditional action buttons */}
        {isNewUser === true && (
          <button
            type="button"
            onClick={handleCreateProfileStep}
            className="w-full mt-2 py-2 bg-[var(--color-success)] text-white rounded hover:bg-[var(--color-success-hover)]"
          >
            Create New Profile
          </button>
        )}
        {isNewUser === false && (
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full mt-2 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
          >
            Send OTP
          </button>
        )}
      </form>
    );
  }

  // --- Profile UI ---
  if (step === 'profile' && isNewUser) {
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
          {loading ? 'Sending OTP...' : 'Create Profile & Send OTP'}
        </button>
      </form>
    );
  }

  // --- OTP UI ---
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto p-6 space-y-4">
        {renderStatus()}
        <p>Enter the 6-digit OTP sent to <strong>{email}</strong>:</p>
        <input
          type="text"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          required
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
        >
          {loading ? 'Verifying OTP...' : 'Verify OTP'}
        </button>
      </form>
    );
  }

  return null;
}
