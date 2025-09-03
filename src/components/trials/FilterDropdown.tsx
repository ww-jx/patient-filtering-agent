'use client';

import { useRef, useEffect, useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface Location { country?: string; city?: string; }

interface FilterDropdownProps {
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onApply: (locationType?: 'profile' | 'manual', locationValue?: Location | string) => void;
  patientAddress?: { city: string; country: string };
  isPatient?: boolean;
}

const allowedStatuses = [
  'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION',
  'NOT_YET_RECRUITING', 'RECRUITING', 'AVAILABLE'
];

export const FilterDropdown = ({
  selected, setSelected, onApply, patientAddress, isPatient = false
}: FilterDropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [locationType, setLocationType] = useState<'profile' | 'manual'>('profile');
  const [profileDetail, setProfileDetail] = useState<'country' | 'cityCountry'>('country');
  const [manualLocation, setManualLocation] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = (status: string) => {
    setSelected((prev: string[]) =>
      prev.includes(status)
        ? prev.filter((s: string) => s !== status)
        : [...prev, status]
    );
  };
  const handleApply = () => {
    let locationValue: Location | string | undefined;
    if (isPatient) {
      if (locationType === 'manual') locationValue = manualLocation || undefined;
      else if (locationType === 'profile' && patientAddress) {
        locationValue = profileDetail === 'country'
          ? { country: patientAddress.country }
          : { country: patientAddress.country, city: patientAddress.city };
      }
    }
    onApply(locationType, locationValue);
    setShow(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShow(!show)}
        className="bg-white/90 hover:bg-white border border-white/60 hover:border-primary/30 text-slate-700 hover:text-primary h-12 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm backdrop-blur-sm hover:scale-[1.02]"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>

        {/* Show selected statuses count */}
        {(selected.length > 0 && selected.length < allowedStatuses.length) && (
          <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
            {selected.length}
          </span>
        )}

        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${show ? 'rotate-180' : ''}`} />
      </button>

      {show && (
        <div
          className="absolute z-50 top-full mt-3 w-80 p-6 bg-white/95 backdrop-blur-sm border border-white/60 rounded-2xl shadow-2xl"
          style={{ animation: 'fadeInDown 0.3s ease-out' }}
        >
          <h3 className="font-semibold text-sm mb-2 text-primary">Overall Status</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {allowedStatuses.map(status => {
              const selectedStatus = selected.includes(status);
              const id = `status-${status}`;
              return (
                <div
                  key={status}
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => toggleStatus(status)}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={selectedStatus}
                    onChange={() => toggleStatus(status)}
                    className={`rounded border-secondary focus:ring-2 focus:ring-primary 
              ${selectedStatus ? 'bg-primary text-background border-primary' : 'bg-background'}`}
                  />
                  <label
                    htmlFor={id}
                    className={`text-sm cursor-pointer ${selectedStatus ? 'font-semibold text-primary' : ''}`}
                  >
                    {status.replace(/_/g, ' ')}
                  </label>
                </div>
              );
            })}
          </div>

          {isPatient && patientAddress && (
            <>
              <h3 className="font-semibold text-sm mb-2 text-primary">Location</h3>
              <div className="space-y-2">
                {/* Profile */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="profile"
                    name="locationType"
                    value="profile"
                    checked={locationType === 'profile'}
                    onChange={() => setLocationType('profile')}
                    className={`border-secondary focus:ring-2 focus:ring-primary 
              ${locationType === 'profile' ? 'bg-primary text-background border-primary' : 'bg-background'}`}
                  />
                  <label htmlFor="profile" className={`text-sm cursor-pointer ${locationType === 'profile' ? 'font-semibold text-primary' : ''}`}>
                    Use my profile address (
                    {profileDetail === 'country' ? patientAddress.country : `${patientAddress.city}, ${patientAddress.country}`}
                    )
                  </label>
                </div>

                {locationType === 'profile' && (
                  <div className="ml-6 flex flex-col space-y-1">
                    <label className="text-sm flex items-center">
                      <input
                        type="radio"
                        name="profileDetail"
                        value="country"
                        checked={profileDetail === 'country'}
                        onChange={() => setProfileDetail('country')}
                        className={`mr-2 border-secondary focus:ring-2 focus:ring-primary 
                  ${profileDetail === 'country' ? 'bg-primary text-background border-primary' : 'bg-background'}`}
                      />
                      Country only ({patientAddress.country})
                    </label>
                    <label className="text-sm flex items-center">
                      <input
                        type="radio"
                        name="profileDetail"
                        value="cityCountry"
                        checked={profileDetail === 'cityCountry'}
                        onChange={() => setProfileDetail('cityCountry')}
                        className={`mr-2 border-secondary focus:ring-2 focus:ring-primary 
                  ${profileDetail === 'cityCountry' ? 'bg-primary text-background border-primary' : 'bg-background'}`}
                      />
                      City + Country ({patientAddress.city}, {patientAddress.country})
                    </label>
                  </div>
                )}

                {/* Manual */}
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="manual"
                    name="locationType"
                    value="manual"
                    checked={locationType === 'manual'}
                    onChange={() => setLocationType('manual')}
                    className={`border-secondary focus:ring-2 focus:ring-primary 
              ${locationType === 'manual' ? 'bg-primary text-background border-primary' : 'bg-background'}`}
                  />
                  <label htmlFor="manual" className={`text-sm cursor-pointer ${locationType === 'manual' ? 'font-semibold text-primary' : ''}`}>
                    Enter a location
                  </label>
                </div>

                {locationType === 'manual' && (
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="e.g. Boston, India"
                    className="w-full border border-secondary rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                  />
                )}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleApply}
              className="bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm hover:scale-105"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
