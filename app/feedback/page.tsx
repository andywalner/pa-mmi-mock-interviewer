'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { useDevSettings } from '@/components/providers/DevSettingsProvider';
import LoadingState from '@/components/feedback/LoadingState';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import AudioRecordingsList from '@/components/feedback/AudioRecordingsList';

export default function FeedbackPage() {
  const router = useRouter();
  const { session } = useInterview();
  const { settings } = useDevSettings();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
  }, [session, router]);

  const handleEvaluate = async () => {
    setLoading(true);

    // Real API call
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: session.selectedSchool,
          responses: session.responses,
          model: settings.claudeModel // Pass model selection to API
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

  // Auto-submit if Claude is enabled and all responses are ready
  useEffect(() => {
    if (settings.enableClaude && session.isComplete && !feedback && !loading) {
      // Check if all responses have text (either typed or transcribed)
      const allHaveResponses = session.responses.every(r => r.response.trim().length > 0);
      if (allHaveResponses) {
        handleEvaluate();
      }
    }
  }, [settings.enableClaude, session.isComplete, session.responses, feedback, loading]);

  // If Claude is disabled, show appropriate message
  if (!settings.enableClaude) {
    // If there are audio recordings, show them
    const hasAudioRecordings = session.responses.some(r => r.audioBlob);
    if (hasAudioRecordings) {
      return <AudioRecordingsList responses={session.responses} />;
    }

    // Otherwise show message to enable Claude
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-gray-400 text-5xl mb-4">ℹ️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claude Evaluation Disabled</h2>
          <p className="text-gray-600 mb-6">
            Enable Claude in Dev Settings to get AI feedback on your responses.
          </p>
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

  // If Claude is enabled but responses aren't ready yet (e.g., waiting for transcription)
  if (settings.enableClaude && !feedback && !loading) {
    const allHaveResponses = session.responses.every(r => r.response.trim().length > 0);
    if (!allHaveResponses) {
      // Show recordings list while waiting for transcriptions
      const hasAudioRecordings = session.responses.some(r => r.audioBlob);
      if (hasAudioRecordings) {
        return <AudioRecordingsList responses={session.responses} />;
      }
    }
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
