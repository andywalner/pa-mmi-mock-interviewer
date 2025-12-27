'use client';

import { useState, useEffect, useMemo } from 'react';
import { debounce } from '@/lib/utils';

interface ResponseInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ResponseInput({ value, onChange }: ResponseInputProps) {
  const [localValue, setLocalValue] = useState(value);

  const debouncedOnChange = useMemo(
    () => debounce((val: string) => onChange(val), 500),
    [onChange]
  );

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const wordCount = localValue.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="response" className="block text-sm font-medium text-gray-700">
          Your Response
        </label>
        <span className="text-sm text-gray-500">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>
      <textarea
        id="response"
        value={localValue}
        onChange={handleChange}
        placeholder="Type your response here... (This simulates your spoken answer)"
        className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all resize-none"
        autoFocus
      />
      <p className="text-sm text-gray-500 mt-2">
        In a real MMI, you would speak your answer. For this practice, type what you would say.
      </p>
    </div>
  );
}
