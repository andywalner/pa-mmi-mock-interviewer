'use client';

import { MMIQuestion } from '@/types';

interface StationPromptProps {
  question: MMIQuestion;
}

export default function StationPrompt({ question }: StationPromptProps) {
  return (
    <div className="station-prompt">
      <h3 className="text-sm font-semibold text-medical-700 uppercase tracking-wide mb-3">
        Scenario
      </h3>
      <p className="text-lg text-gray-900 leading-relaxed">
        {question.prompt}
      </p>
    </div>
  );
}
