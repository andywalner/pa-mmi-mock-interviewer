'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useInterview } from '@/components/providers/InterviewProvider'
import { getUserInterviews } from '@/lib/services/interviewService'
import { MMI_QUESTIONS } from '@/lib/questions'
import { formatLocalDateTime } from '@/lib/dateUtils'
import StartButton from '@/components/landing/StartButton'
import AuthForm from '@/components/auth/AuthForm'
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

  // Show combined landing/auth page for non-authenticated users
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-medical-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Value Propositions */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  PA Mock Interviewer
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Practice with real PA school interview scenarios and get AI-powered feedback designed by experienced PA advisors
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Practice Real Scenarios</h3>
                      <p className="text-gray-600">
                        Answer MMI questions curated from actual student interviews and common PA program scenarios.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Expert Feedback</h3>
                      <p className="text-gray-600">
                        Receive detailed analysis on your strengths and areas to improve, based on feedback frameworks developed by our advisor team.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Track Your Progress</h3>
                      <p className="text-gray-600">
                        Review past interviews and practice as many times as you need to build confidence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Auth Form */}
            <div className="lg:pl-8">
              <AuthForm />
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show authenticated landing page with start button
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              PA Mock Interviewer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practice speaking your answers and get expert feedback to ace your PA interview
            </p>
          </div>

          {/* Value Props */}
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Point 1: Record */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Record Your Responses</h3>
                <p className="text-sm text-gray-600">
                  Speak your answers out loud to simulate a real interview experience
                </p>
              </div>

              {/* Point 2: Get Feedback */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Get Scored & Tips</h3>
                <p className="text-sm text-gray-600">
                  Our rubric rates your communication, critical thinking, and more with actionable advice on how to improve
                </p>
              </div>

              {/* Point 3: Practice & Improve */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-medical-100 text-medical-700 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">Practice & Improve</h3>
                <p className="text-sm text-gray-600">
                  Review your feedback and practice as often as you'd like to build confidence
                </p>
              </div>
            </div>
          </div>

          {/* Prominent CTA */}
          <div className="flex flex-col items-center">
            <StartButton />
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
      </div>
    </main>
  )
}
