'use client';

import { useInterview } from '@/components/providers/InterviewProvider';
import { MMI_QUESTIONS } from '@/lib/questions';

export default function ProgressIndicator() {
  const { session } = useInterview();
  const currentStation = session.currentStationIndex + 1;
  const totalStations = MMI_QUESTIONS.length;
  const progress = (currentStation / totalStations) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">
          Station {currentStation} of {totalStations}
        </h2>
        <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
