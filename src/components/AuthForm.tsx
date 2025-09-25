'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  onSubscribed?: () => void;
}

type StatusType = 'info' | 'success' | 'error';

export default function EmailAuthForm({ onSubscribed }: Props) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<StatusType>('info');
  const [subscribed, setSubscribed] = useState(false);

  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(''); // free text: "City, Country" or just country
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('');
  const [conditions, setConditions] = useState<string[]>(['']);

  const showStatus = (msg: string, type: StatusType = 'info') => {
    setStatusMessage(msg);
    setStatusType(type);
  };

  const inputClass =
    'w-full border rounded p-2 bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--color-muted)]';

  const handleConditionChange = (index: number, value: string) => {
    const updated = [...conditions];
    updated[index] = value;
    setConditions(updated);
  };
  const addCondition = () => setConditions(prev => [...prev, '']);
  const removeCondition = (index: number) => setConditions(prev => prev.filter((_, i) => i !== index));

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: all required
    if (!email || !location || !age || !gender || conditions.some(c => c.trim() === '')) {
      showStatus('Please complete all fields before subscribing.', 'error');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      // Parse location into city/country if possible
      let city = '';
      let country = location.trim();
      if (location.includes(',')) {
        const parts = location.split(',');
        city = parts[0].trim();
        country = parts.slice(1).join(',').trim();
      }

      // Approximate DOB from age to fit existing schema (YYYY-01-01)
      const ageNum = parseInt(age, 10);
      const approxDob = isNaN(ageNum)
        ? ''
        : `${new Date().getFullYear() - ageNum}-01-01`;

      // Store subscriber in existing users table
      await supabase
        .from('users')
        .insert([
          {
            email,
            gender,
            country,
            city,
            dob: approxDob,
            conditions: conditions.map(c => c.trim()).filter(Boolean),
          },
        ]);

      showStatus('🎉 You\'re subscribed! Look out for the weekly newsletter in your inbox.', 'success');
      setSubscribed(true);
      onSubscribed?.();
    } catch (err: unknown) {
      console.error(err);
      showStatus('Subscription failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 text-center bg-white/90 rounded-xl border border-orange-200">
        <div className="text-3xl">✅</div>
        <h3 className="text-lg font-semibold text-[var(--color-success)]">Subscription confirmed</h3>
        <p className="text-sm text-slate-600">Thank you! We will deliver your weekly brief to <span className="font-medium">{email}</span>.</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Important: GiraffeGuru is an informational newsletter only and does not provide
          medical advice, diagnosis, or treatment. Always seek the advice of your physician or
          other qualified provider with any questions about a medical condition. By subscribing,
          you consent to receive emails from us and agree to our terms and privacy practices.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="max-w-md mx-auto p-6 space-y-3">
      {statusMessage && (
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
      )}

      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className={inputClass}
      />

      <input
        type="text"
        placeholder="Location (e.g., Boston, USA)"
        value={location}
        onChange={e => setLocation(e.target.value)}
        required
        className={inputClass}
      />

      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          placeholder="Age"
          value={age}
          onChange={e => setAge(e.target.value)}
          required
          className={inputClass + ' w-1/2'}
        />
        <select
          value={gender}
          onChange={e => setGender(e.target.value)}
          required
          className={inputClass + ' w-1/2'}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {conditions.map((c, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            placeholder="Medical Condition (e.g., Type 2 Diabetes)"
            value={c}
            onChange={e => handleConditionChange(i, e.target.value)}
            required
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
        className="w-full py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)]"
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      <p className="text-xs text-center text-[var(--color-muted)]">
        We\'ll email you a confirmation and deliver your weekly brief.
      </p>
      <p className="text-[10px] text-center text-slate-500 leading-relaxed">
        By subscribing you acknowledge this newsletter is for information only and not a
        substitute for professional medical advice, diagnosis or treatment. You consent to
        receive emails from us and agree to our terms and privacy practices.
      </p>
    </form>
  );
}
