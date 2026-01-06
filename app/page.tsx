'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useInterview } from '@/components/providers/InterviewProvider'
import { getUserInterviews } from '@/lib/services/interviewService'
import { MMI_QUESTIONS } from '@/lib/questions'
import { formatLocalDateTime } from '@/lib/dateUtils'
import StartButton from '@/components/landing/StartButton'
import type { Database } from '@/types/supabase'

type Interview = Database['public']['Tables']['interviews']['Row']

export default function LandingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { resumeInterview } = useInterview()
  const [inProgressInterviews, setInProgressInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadInProgressInterviews()
    }
  }, [user])

  const loadInProgressInterviews = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await getUserInterviews(user.id)
      if (data && !error) {
        const inProgress = data.filter(interview => interview.status === 'in_progress')
        setInProgressInterviews(inProgress)
      }
    } catch (err) {
      console.error('Failed to load in-progress interviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeInterview = async (interviewId: string) => {
    await resumeInterview(interviewId)
    router.push('/interview')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            PA MMI <span className="text-medical-500">Mock Interviewer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice your Physician Assistant Multiple Mini Interview with AI-powered feedback
          </p>
        </div>

        <div className="card max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Complete 5 MMI stations by typing your responses</li>
              <li>Each station has a 7-minute timer (not enforced)</li>
              <li>Get detailed AI feedback on your performance</li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-center">
              <StartButton />
            </div>
          </div>
        </div>

        {user && inProgressInterviews.length > 0 && (
          <div className="card max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Continue Where You Left Off</h2>
            <div className="space-y-3">
              {inProgressInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 cursor-pointer transition-colors"
                  onClick={() => handleResumeInterview(interview.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                          In Progress
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Station {(interview.current_station_index || 0) + 1} of {MMI_QUESTIONS.length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Started {formatLocalDateTime(interview.started_at || interview.created_at, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-medical-600">
                      <svg
                        className="w-5 h-5"
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
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>
            This is a practice tool. Your responses will be evaluated using AI to help you prepare for real MMI interviews.
          </p>
        </div>
      </div>
    </main>
  )
}
