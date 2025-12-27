'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';

export default function StartButton() {
  const router = useRouter();
  const { session, startInterview } = useInterview();

  const handleStart = () => {
    startInterview();
    router.push('/interview');
  };

  return (
    <button
      onClick={handleStart}
      disabled={!session.selectedSchool}
      className="btn-primary text-lg px-8 py-4"
    >
      Start Practice Interview
    </button>
  );
}
