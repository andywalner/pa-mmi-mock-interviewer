'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { MMI_QUESTIONS } from '@/lib/questions';

interface NavigationButtonsProps {
  currentResponse: string;
  timeSpent: number;
}

export default function NavigationButtons({ currentResponse, timeSpent }: NavigationButtonsProps) {
  const router = useRouter();
  const { session, saveResponse, nextStation, submitInterview } = useInterview();

  const isLastStation = session.currentStationIndex === MMI_QUESTIONS.length - 1;
  const isResponseEmpty = !currentResponse.trim();

  const handleNext = () => {
    saveResponse(currentResponse, timeSpent);
    nextStation();
  };

  const handleSubmit = () => {
    saveResponse(currentResponse, timeSpent);
    submitInterview();
    router.push('/feedback');
  };

  return (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        {isResponseEmpty ? 'Please provide a response to continue' : 'Response saved automatically'}
      </div>
      <div className="flex gap-4">
        {isLastStation ? (
          <button
            onClick={handleSubmit}
            disabled={isResponseEmpty}
            className="btn-primary"
          >
            Submit Interview
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isResponseEmpty}
            className="btn-primary"
          >
            Next Station →
          </button>
        )}
      </div>
    </div>
  );
}
