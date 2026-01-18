'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import { useState, useEffect } from 'react';

export default function StartButton() {
  const router = useRouter();
  const { startInterview, getUserQuota } = useInterview();
  const [quota, setQuota] = useState<{ count: number; limit: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load quota on mount
    getUserQuota().then(({ count, limit, error }) => {
      if (!error) {
        setQuota({ count, limit });
      }
    });
  }, [getUserQuota]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      await startInterview();
      router.push('/interview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setLoading(false);
    }
  };

  const remaining = quota ? quota.limit - quota.count : 10;
  const isLow = remaining <= 2 && remaining > 0;

  return (
    <div className="space-y-2">
      <button
        onClick={handleStart}
        disabled={loading || remaining === 0}
        className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting...' : 'Start Practice Interview'}
      </button>

      {quota && (
        <p className={`text-sm text-center ${isLow ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
          {remaining} interview{remaining !== 1 ? 's' : ''} remaining this month
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
