"use client";

import { useState } from "react";
import type { PatientProfile } from "@/lib/types";
import bcrypt from "bcryptjs"; // for hashing password client-side (optional)

interface Props {
  onProfileCreated: (profile: PatientProfile) => void;
}

export default function UserProfileForm({ onProfileCreated }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // new password field
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [conditions, setConditions] = useState<string[]>([""]);

  const handleConditionChange = (index: number, value: string) => {
    const updated = [...conditions];
    updated[index] = value;
    setConditions(updated);
  };

  const addCondition = () => setConditions([...conditions, ""]);
  const removeCondition = (index: number) => setConditions(conditions.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      alert("Please enter a password");
      return;
    }

    // hash password before sending
    const hashedPassword = await bcrypt.hash(password, 10);

    const profile: PatientProfile = {
      name: "", // not collected
      email,
      dob,
      gender: gender as "male" | "female" | "other",
      country,
      city,
      conditions: conditions.filter((c) => c.trim() !== ""),
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, password: hashedPassword }), // send separately
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Error:", result.error);
        alert("❌ Failed to save profile: " + result.error);
        return;
      }

      console.log("✅ Saved user:", result.user);
      onProfileCreated(result.user);
    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Something went wrong.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded-lg p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 w-full border rounded-lg p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Other fields */}
        <div>
          <label className="block text-sm font-medium">Date of Birth</label>
          <input type="date" className="mt-1 w-full border rounded-lg p-2" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Country</label>
          <input type="text" className="mt-1 w-full border rounded-lg p-2" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">City</label>
          <input type="text" className="mt-1 w-full border rounded-lg p-2" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select className="mt-1 w-full border rounded-lg p-2" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Conditions */}
        <div>
          <label className="block text-sm font-medium">Medical Conditions</label>
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center mt-1 gap-2">
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={condition}
                onChange={(e) => handleConditionChange(index, e.target.value)}
                placeholder="e.g. Diabetes, Hypertension"
              />
              {index > 0 && (
                <button type="button" onClick={() => removeCondition(index)} className="px-2 py-1 text-sm bg-red-500 text-white rounded">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addCondition} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded">
            + Add Condition
          </button>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
          Sign Up
        </button>
      </form>
    </div>
  );
}
