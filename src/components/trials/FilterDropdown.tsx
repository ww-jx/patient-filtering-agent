'use client';

import { useRef, useEffect, useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  selected: string[];
  setSelected: (val: string[]) => void;
  onApply: (locationType?: "profile" | "manual", locationValue?: string) => void;
  patientAddress?: string; // only relevant for patients
  isPatient?: boolean;     // true if filtering as a patient
}

const allowedStatuses = [
  'ACTIVE_NOT_RECRUITING',
  'ENROLLING_BY_INVITATION',
  'NOT_YET_RECRUITING',
  'RECRUITING',
  'AVAILABLE',
];

export const FilterDropdown = ({
  selected,
  setSelected,
  onApply,
  patientAddress,
  isPatient = false,
}: FilterDropdownProps) => {
  const [show, setShow] = useState(false);
  const [locationType, setLocationType] = useState<"profile" | "manual">("profile");
  const [manualLocation, setManualLocation] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = (status: string) => {
    setSelected(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShow(!show)}
        className="bg-white border border-slate-300 rounded-lg p-3 text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1"
      >
        <Filter className="h-5 w-5" />
        <span>Filters</span>
        {(selected.length > 0 && selected.length < allowedStatuses.length) && (
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>

      {show && (
        <div className="absolute z-10 top-full mt-2 w-72 p-4 bg-white border border-slate-200 rounded-lg shadow-xl animate-fade-in-down">
          {/* Status Filters */}
          <h3 className="font-semibold text-sm mb-2 text-slate-800">Overall Status</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {allowedStatuses.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selected.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="text-sm cursor-pointer">{status.replace(/_/g, ' ')}</label>
              </div>
            ))}
          </div>

          {/* Location filter only for patients */}
          {isPatient && (
            <>
              <h3 className="font-semibold text-sm mb-2 text-slate-800">Location</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="profile"
                    name="locationType"
                    value="profile"
                    checked={locationType === "profile"}
                    onChange={() => setLocationType("profile")}
                  />
                  <label htmlFor="profile" className="text-sm cursor-pointer">
                    Use my profile address {patientAddress && <span className="text-slate-500">({patientAddress})</span>}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="manual"
                    name="locationType"
                    value="manual"
                    checked={locationType === "manual"}
                    onChange={() => setLocationType("manual")}
                  />
                  <label htmlFor="manual" className="text-sm cursor-pointer">Enter a location</label>
                </div>
                {locationType === "manual" && (
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. Boston, India"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            </>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (isPatient) {
                  // Only pass location if the user selected one or typed a manual value
                  const locationToPass =
                    locationType === "manual"
                      ? manualLocation || undefined
                      : locationType === "profile"
                        ? patientAddress
                        : undefined;

                  onApply(locationToPass ? locationType : undefined, locationToPass);
                } else {
                  onApply();
                }
                setShow(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
