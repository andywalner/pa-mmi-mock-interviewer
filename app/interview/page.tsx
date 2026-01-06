'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { useDevSettings } from '@/components/providers/DevSettingsProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { MMI_QUESTIONS } from '@/lib/questions';
import ProgressIndicator from '@/components/interview/ProgressIndicator';
import StationTimer from '@/components/interview/StationTimer';
import StationPrompt from '@/components/interview/StationPrompt';
import ResponseInput from '@/components/interview/ResponseInput';
import AudioRecorder from '@/components/interview/AudioRecorder';
import NavigationButtons from '@/components/interview/NavigationButtons';

export default function InterviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { session, saveResponse, saveAudioResponse } = useInterview();
  const { settings } = useDevSettings();
  const [timeSpent, setTimeSpent] = useState(0);
  const [currentResponseText, setCurrentResponseText] = useState('');
  const [currentAudioRecording, setCurrentAudioRecording] = useState<{ blob: Blob; duration: number } | null>(null);
  const [isCurrentlyRecording, setIsCurrentlyRecording] = useState(false);

  const isAudioMode = settings.enableAudioMode;
  const currentQuestion = MMI_QUESTIONS[session.currentStationIndex];
  const savedResponse = session.responses[session.currentStationIndex];

  // Auth check - middleware will redirect, but show loading state
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Redirect to home if no interview session started
  useEffect(() => {
    if (!session.interviewId && session.currentStationIndex === 0 && session.responses.length === 0) {
      router.push('/');
    }
  }, [session.interviewId, session.currentStationIndex, session.responses.length, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  useEffect(() => {
    setTimeSpent(0);
    setIsCurrentlyRecording(false);

    if (isAudioMode) {
      // Audio mode: restore saved recording or clear
      if (savedResponse?.audioBlob) {
        setCurrentAudioRecording({ blob: savedResponse.audioBlob, duration: savedResponse.audioDuration || 0 });
      } else {
        setCurrentAudioRecording(null);
      }
    } else {
      // Text mode: restore saved text
      setCurrentResponseText(savedResponse?.response || '');
      setCurrentAudioRecording(null);
    }
  }, [session.currentStationIndex, savedResponse, isAudioMode]);

  if (!currentQuestion) {
    return null;
  }

  const handleResponseChange = (value: string) => {
    setCurrentResponseText(value);
  };

  const handleAudioRecordingComplete = (blob: Blob, duration: number) => {
    setCurrentAudioRecording({ blob, duration });
    saveAudioResponse(blob, duration, timeSpent);
  };

  const handleAudioRecordingCleared = () => {
    setCurrentAudioRecording(null);
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
          <div className={isAudioMode ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <StationPrompt question={currentQuestion} />
          </div>
          {!isAudioMode && (
            <div>
              <StationTimer
                key={session.currentStationIndex}
                stationIndex={session.currentStationIndex}
                onTimeUpdate={setTimeSpent}
              />
            </div>
          )}
        </div>

        <div className="card">
          {isAudioMode ? (
            <AudioRecorder
              key={session.currentStationIndex}
              onRecordingComplete={handleAudioRecordingComplete}
              onRecordingCleared={handleAudioRecordingCleared}
              currentRecording={currentAudioRecording}
              maxDuration={currentQuestion.timeLimit}
              onRecordingStateChange={setIsCurrentlyRecording}
            />
          ) : (
            <ResponseInput
              value={currentResponseText}
              onChange={handleResponseChange}
            />
          )}
          <NavigationButtons
            currentResponse={currentResponseText}
            currentAudioRecording={currentAudioRecording}
            isAudioMode={isAudioMode}
            isRecording={isCurrentlyRecording}
            timeSpent={timeSpent}
          />
        </div>
      </div>
    </main>
  );
}
