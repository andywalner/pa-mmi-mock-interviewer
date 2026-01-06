'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserInterviews } from '@/lib/services/interviewService'
import type { Database } from '@/types/supabase'

type Interview = Database['public']['Tables']['interviews']['Row']

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadInterviews()
    }
  }, [user])

  const loadInterviews = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getUserInterviews(user.id)

      if (fetchError || !data) {
        setError('Failed to load interview history')
        console.error(fetchError)
      } else {
        // Filter to only show completed interviews
        const completedInterviews = data.filter(interview => interview.status === 'completed')
        setInterviews(completedInterviews)
      }
    } catch (err) {
      setError('An error occurred while loading interviews')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completed Interviews
          </h1>
          <p className="text-gray-600">
            View your completed practice interviews and feedback
          </p>
        </div>

        {interviews.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Completed Interviews
            </h2>
            <p className="text-gray-600 mb-6">
              Complete a practice interview to see it here
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/interview/${interview.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          interview.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : interview.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {interview.status === 'completed'
                          ? 'Completed'
                          : interview.status === 'in_progress'
                          ? 'In Progress'
                          : interview.status}
                      </span>
                      {interview.school_name && (
                        <span className="text-sm text-gray-600">
                          {interview.school_name}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        Started:{' '}
                        {new Date((interview.started_at || interview.created_at) ?? new Date()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {interview.completed_at && (
                        <p>
                          Completed:{' '}
                          {new Date(interview.completed_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-medical-600 hover:text-medical-700">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
