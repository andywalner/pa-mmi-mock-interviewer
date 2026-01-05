'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { useDevSettings } from '@/components/providers/DevSettingsProvider';
import { MMI_QUESTIONS } from '@/lib/questions';
import { transcribeAudio } from '@/lib/transcriptionService';

interface NavigationButtonsProps {
  currentResponse: string;
  currentAudioRecording?: { blob: Blob; duration: number } | null;
  isAudioMode: boolean;
  isRecording: boolean;
  timeSpent: number;
}

export default function NavigationButtons({
  currentResponse,
  currentAudioRecording,
  isAudioMode,
  isRecording,
  timeSpent
}: NavigationButtonsProps) {
  const router = useRouter();
  const { session, saveResponse, updateTranscription, nextStation, submitInterview } = useInterview();
  const { settings } = useDevSettings();

  const isLastStation = session.currentStationIndex === MMI_QUESTIONS.length - 1;

  // Check if response is provided based on mode
  // In audio mode: must have recording AND not currently recording (i.e., preview showing)
  const hasResponse = isAudioMode
    ? (!!currentAudioRecording && !isRecording)
    : !!currentResponse.trim();

  const handleNext = () => {
    if (!isAudioMode) {
      saveResponse(currentResponse, timeSpent);
    }

    // Trigger async transcription if audio mode AND Deepgram is enabled
    if (isAudioMode && currentAudioRecording && settings.enableDeepgram) {
      const stationIndex = session.currentStationIndex;

      // Mark as pending immediately
      updateTranscription(stationIndex, '');

      // Fire-and-forget async transcription
      transcribeAudio(stationIndex, currentAudioRecording.blob)
        .then(transcription => {
          if (transcription) {
            updateTranscription(stationIndex, transcription);
          } else {
            updateTranscription(stationIndex, '', 'Transcription failed');
          }
        });
    }

    // Move to next station (don't wait for transcription)
    nextStation();
  };

  const handleSubmit = async () => {
    if (!isAudioMode) {
      saveResponse(currentResponse, timeSpent);
    }

    // Trigger async transcription for last station if audio mode AND Deepgram is enabled
    if (isAudioMode && currentAudioRecording && settings.enableDeepgram) {
      const stationIndex = session.currentStationIndex;

      // Mark as pending immediately
      updateTranscription(stationIndex, '');

      // Fire-and-forget async transcription
      transcribeAudio(stationIndex, currentAudioRecording.blob)
        .then(transcription => {
          if (transcription) {
            updateTranscription(stationIndex, transcription);
          } else {
            updateTranscription(stationIndex, '', 'Transcription failed');
          }
        });
    }

    // Submit interview and navigate to interview detail page (don't wait for transcription)
    await submitInterview();

    // Redirect to the interview detail page
    if (session.interviewId) {
      router.push(`/interview/${session.interviewId}`);
    } else {
      // Fallback to home if no interview ID
      router.push('/');
    }
  };

  const statusMessage = isAudioMode
    ? (isRecording
        ? 'Complete your recording to continue'
        : (currentAudioRecording ? 'Recording saved automatically' : 'Please record your response to continue'))
    : (hasResponse ? 'Response saved automatically' : 'Please provide a response to continue');

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {statusMessage}
      </div>
      <div className="flex gap-4">
        {isLastStation ? (
          <div className="relative group">
            <button
              onClick={handleSubmit}
              disabled={!hasResponse}
              className="btn-primary"
            >
              Submit Interview
            </button>
            {!hasResponse && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {statusMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="relative group">
            <button
              onClick={handleNext}
              disabled={!hasResponse}
              className="btn-primary"
            >
              Next Station →
            </button>
            {!hasResponse && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {statusMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
