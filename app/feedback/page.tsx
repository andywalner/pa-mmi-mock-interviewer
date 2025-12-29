'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { useDevSettings } from '@/components/providers/DevSettingsProvider';
import LoadingState from '@/components/feedback/LoadingState';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import ConfirmSubmission from '@/components/feedback/ConfirmSubmission';
import AudioRecordingsList from '@/components/feedback/AudioRecordingsList';
import { generateMockFeedback } from '@/lib/mockFeedback';

export default function FeedbackPage() {
  const router = useRouter();
  const { session } = useInterview();
  const { settings } = useDevSettings();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const isAudioMode = process.env.NEXT_PUBLIC_ENABLE_AUDIO_MODE === 'true';
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

  // Auto-submit if confirmation not required (text mode only)
  useEffect(() => {
    if (!isAudioMode && !requiresConfirmation && !confirmed && session.isComplete && session.selectedSchool) {
      handleConfirm(false);
    }
  }, [isAudioMode, requiresConfirmation, confirmed, session]);

  // Auto-submit for audio mode if Claude is enabled
  useEffect(() => {
    if (isAudioMode && settings.enableClaude && !confirmed && session.isComplete && !feedback && !loading) {
      // Check if all responses have transcriptions
      const allTranscribed = session.responses.every(r => r.transcription || !r.audioBlob);
      if (allTranscribed) {
        if (requiresConfirmation) {
          setConfirmed(false); // Will show confirmation dialog
        } else {
          handleConfirm(false); // Auto-submit
        }
      }
    }
  }, [isAudioMode, settings.enableClaude, confirmed, session, feedback, loading, requiresConfirmation]);

  // In audio mode with Claude disabled, just show recordings list
  if (isAudioMode && !settings.enableClaude) {
    return <AudioRecordingsList responses={session.responses} />;
  }

  // In audio mode with Claude enabled but no transcriptions yet, show recordings
  if (isAudioMode && settings.enableClaude && !confirmed && !feedback && !loading) {
    const hasTranscriptions = session.responses.some(r => r.transcription);
    if (!hasTranscriptions) {
      return <AudioRecordingsList responses={session.responses} />;
    }
  }

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
