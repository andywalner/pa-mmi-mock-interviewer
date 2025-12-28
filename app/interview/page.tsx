'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { MMI_QUESTIONS } from '@/lib/questions';
import ProgressIndicator from '@/components/interview/ProgressIndicator';
import StationTimer from '@/components/interview/StationTimer';
import StationPrompt from '@/components/interview/StationPrompt';
import ResponseInput from '@/components/interview/ResponseInput';
import NavigationButtons from '@/components/interview/NavigationButtons';

export default function InterviewPage() {
  const router = useRouter();
  const { session } = useInterview();
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentResponseText, setCurrentResponseText] = useState('');

  const currentQuestion = MMI_QUESTIONS[session.currentStationIndex];
  const savedResponse = session.responses[session.currentStationIndex]?.response || '';

  useEffect(() => {
    if (!session.selectedSchool) {
      router.push('/');
    }
  }, [session.selectedSchool, router]);

  useEffect(() => {
    setTimeSpent(0);
    setCurrentResponseText(savedResponse);
  }, [session.currentStationIndex, savedResponse]);

  if (!session.selectedSchool || !currentQuestion) {
    return null;
  }

  const handleResponseChange = (value: string) => {
    setCurrentResponseText(value);
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MMI Practice Interview
          </h1>
          <p className="text-gray-600">Type your responses to each scenario</p>
        </div>

        <ProgressIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <StationPrompt question={currentQuestion} />
          </div>
          <div>
            <StationTimer
              stationIndex={session.currentStationIndex}
              onTimeUpdate={setTimeSpent}
            />
          </div>
        </div>

        <div className="card">
          <ResponseInput
            value={currentResponseText}
            onChange={handleResponseChange}
          />
          <NavigationButtons
            currentResponse={currentResponseText}
            timeSpent={timeSpent}
          />
        </div>
      </div>
    </main>
  );
}
