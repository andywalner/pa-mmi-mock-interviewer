'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import LoadingState from '@/components/feedback/LoadingState';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import ConfirmSubmission from '@/components/feedback/ConfirmSubmission';
import { generateMockFeedback } from '@/lib/mockFeedback';

export default function FeedbackPage() {
  const router = useRouter();
  const { session } = useInterview();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const requiresConfirmation = process.env.NEXT_PUBLIC_ENABLE_API_CONFIRMATION === 'true';

  useEffect(() => {
    if (!session.selectedSchool || session.responses.length === 0) {
      router.push('/');
      return;
    }

    if (!session.isComplete) {
      router.push('/interview');
      return;
    }
  }, [session, router]);

  const handleConfirm = async (useMock: boolean) => {
    setConfirmed(true);
    setLoading(true);

    if (useMock) {
      // Use mock feedback
      setTimeout(() => {
        setFeedback(generateMockFeedback(session.selectedSchool?.name || 'Your School'));
        setLoading(false);
      }, 2000); // Simulate API delay
      return;
    }

    // Real API call
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
  };

  // Auto-submit if confirmation not required
  useEffect(() => {
    if (!requiresConfirmation && !confirmed && session.isComplete && session.selectedSchool) {
      handleConfirm(false);
    }
  }, [requiresConfirmation, confirmed, session]);

  // Show confirmation screen if required and not yet confirmed
  if (requiresConfirmation && !confirmed) {
    return (
      <ConfirmSubmission
        onConfirm={handleConfirm}
        responseCount={session.responses.length}
      />
    );
  }

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
