'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/utils';
import { MMI_QUESTIONS } from '@/lib/questions';

interface StationTimerProps {
  stationIndex: number;
  onTimeUpdate: (seconds: number) => void;
}

export default function StationTimer({ stationIndex, onTimeUpdate }: StationTimerProps) {
  const timeLimit = MMI_QUESTIONS[stationIndex]?.timeLimit || 420;
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(currentElapsed);
      onTimeUpdate(currentElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const remaining = Math.max(0, timeLimit - elapsed);
  const isWarning = remaining <= 60 && remaining > 0;
  const isOvertime = remaining === 0;

  return (
    <div className={`
      card text-center mb-6
      ${isWarning ? 'border-yellow-400 bg-yellow-50' : ''}
      ${isOvertime ? 'border-red-400 bg-red-50' : ''}
    `}>
      <div className="text-sm font-medium text-gray-600 mb-1">Time Remaining</div>
      <div className={`
        text-4xl font-bold
        ${isWarning ? 'text-yellow-600' : ''}
        ${isOvertime ? 'text-red-600' : 'text-medical-500'}
      `}>
        {formatTime(remaining)}
      </div>
      {isWarning && !isOvertime && (
        <div className="text-sm text-yellow-700 mt-2">Less than 1 minute remaining!</div>
      )}
      {isOvertime && (
        <div className="text-sm text-red-700 mt-2">Time&apos;s up! You can still continue.</div>
      )}
    </div>
  );
}
