'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import LoadingState from '@/components/feedback/LoadingState';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';

export default function FeedbackPage() {
  const router = useRouter();
  const { session } = useInterview();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.selectedSchool || session.responses.length === 0) {
      router.push('/');
      return;
    }

    if (!session.isComplete) {
      router.push('/interview');
      return;
    }

    async function fetchFeedback() {
      try {
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school: session.selectedSchool,
            responses: session.responses
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get feedback');
        }

        const data = await response.json();
        setFeedback(data.feedback);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to get feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [session, router]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return <FeedbackDisplay feedback={feedback} />;
}
