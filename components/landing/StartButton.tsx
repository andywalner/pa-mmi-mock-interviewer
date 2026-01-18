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
        <div className="flex items-center justify-center gap-1">
          <p className={`text-sm ${isLow ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
            {remaining} interview{remaining !== 1 ? 's' : ''} remaining this month
          </p>
          <div className="relative group">
            <svg
              className={`w-4 h-4 ${isLow ? 'text-yellow-600' : 'text-gray-400'} cursor-help`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Limit resets at the start of each month. Contact thepaprep@gmail.com if you need higher limits.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
