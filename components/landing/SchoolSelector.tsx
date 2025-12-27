'use client';

import { useInterview } from '@/components/providers/InterviewProvider';
import { SCHOOLS } from '@/lib/schools';
import { School } from '@/types';

export default function SchoolSelector() {
  const { session, setSelectedSchool } = useInterview();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = e.target.value;
    const school = SCHOOLS.find(s => s.id === schoolId);
    if (school) {
      setSelectedSchool(school);
    }
  };

  return (
    <div className="w-full max-w-md">
      <label htmlFor="school-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Your PA Program
      </label>
      <select
        id="school-select"
        value={session.selectedSchool?.id || ''}
        onChange={handleChange}
        className="w-full px-4 py-3 border-2 border-medical-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all text-gray-900"
      >
        <option value="">Choose a school...</option>
        {SCHOOLS.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
    </div>
  );
}
