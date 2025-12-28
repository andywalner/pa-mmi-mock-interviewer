'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { MMI_QUESTIONS } from '@/lib/questions';

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
  const { session, saveResponse, nextStation, submitInterview } = useInterview();

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
    // Audio is already saved via saveAudioResponse in parent
    nextStation();
  };

  const handleSubmit = () => {
    if (!isAudioMode) {
      saveResponse(currentResponse, timeSpent);
    }
    // Audio is already saved via saveAudioResponse in parent
    submitInterview();
    router.push('/feedback');
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
          <button
            onClick={handleSubmit}
            disabled={!hasResponse}
            className="btn-primary"
          >
            Submit Interview
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasResponse}
            className="btn-primary"
          >
            Next Station →
          </button>
        )}
      </div>
    </div>
  );
}
