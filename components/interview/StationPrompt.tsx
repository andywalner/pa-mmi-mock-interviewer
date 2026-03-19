'use client';

import { MMIQuestion } from '@/types';
import { CATEGORY_LABELS } from '@/lib/questions';

interface StationPromptProps {
  question: MMIQuestion;
}

export default function StationPrompt({ question }: StationPromptProps) {
  return (
    <div className="station-prompt">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-medical-700 uppercase tracking-wide">
          Question
        </h3>
        <p className="text-sm text-gray-500">
          Category: {CATEGORY_LABELS[question.category] || question.category}
        </p>
      </div>
      <p className="text-lg text-gray-900 leading-relaxed">
        {question.prompt}
      </p>
    </div>
  );
}
