'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDevSettings } from '@/components/providers/DevSettingsProvider'
import { loadInterview, saveEvaluation, type InterviewWithResponses } from '@/lib/services/interviewService'
import { MMI_QUESTIONS } from '@/lib/questions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function InterviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { settings } = useDevSettings()
  const [interview, setInterview] = useState<InterviewWithResponses | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingFeedback, setGeneratingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && params.id) {
      loadInterviewData()
    }
  }, [user, params.id])

  const loadInterviewData = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await loadInterview(params.id)

      if (fetchError || !data) {
        setError('Failed to load interview')
        console.error(fetchError)
      } else {
        setInterview(data)
      }
    } catch (err) {
      setError('An error occurred while loading the interview')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFeedback = async () => {
    if (!interview) return

    setGeneratingFeedback(true)
    setFeedbackError(null)

    try {
      // Convert interview responses to the format expected by the API
      const responses = interview.responses.map(r => ({
        stationId: MMI_QUESTIONS[r.station_number - 1]?.id || r.station_number,
        question: MMI_QUESTIONS[r.station_number - 1]?.prompt || '',
        response: r.response_text || '',
        timeSpent: r.time_spent_seconds || 0,
      }))

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school: { id: 'general', name: interview.school_name || 'PA Program' },
          responses,
          model: settings.claudeModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate feedback')
      }

      const data = await response.json()

      // Calculate estimated cost
      const inputCost = (data.usage.input_tokens / 1_000_000) * 3
      const outputCost = (data.usage.output_tokens / 1_000_000) * 15
      const estimatedCost = inputCost + outputCost

      // Save evaluation to database
      await saveEvaluation(interview.id, {
        feedback_text: data.feedback,
        claude_model: data.model,
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        estimated_cost_usd: estimatedCost,
      })

      // Reload interview to show the new evaluation
      await loadInterviewData()
    } catch (err) {
      console.error('Error generating feedback:', err)
      setFeedbackError('Failed to generate feedback. Please try again.')
    } finally {
      setGeneratingFeedback(false)
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

  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Interview not found'}</p>
          <button onClick={() => router.push('/history')} className="btn-primary">
            Back to Completed Interviews
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/history')}
            className="text-medical-600 hover:text-medical-700 flex items-center space-x-2 mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Completed Interviews</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Details</h1>
              <p className="text-gray-600">
                {new Date((interview.started_at || interview.created_at) ?? new Date()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                interview.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : interview.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {interview.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Evaluation Section */}
        {interview.evaluation ? (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
            <div className="card">
              <div className="prose prose-medical max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {interview.evaluation.feedback_text}
                </ReactMarkdown>
              </div>

              {interview.evaluation.claude_model && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Model: {interview.evaluation.claude_model}</p>
                    {interview.evaluation.input_tokens && interview.evaluation.output_tokens && (
                      <p>
                        Tokens: {interview.evaluation.input_tokens.toLocaleString()} input /{' '}
                        {interview.evaluation.output_tokens.toLocaleString()} output
                      </p>
                    )}
                    {interview.evaluation.estimated_cost_usd && (
                      <p>Estimated cost: ${interview.evaluation.estimated_cost_usd.toFixed(4)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : interview.status === 'completed' ? (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
            <div className="card text-center py-8">
              {feedbackError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {feedbackError}
                </div>
              )}
              <p className="text-gray-600 mb-6">
                {generatingFeedback
                  ? 'Generating feedback...'
                  : 'No feedback available yet. Generate feedback to see personalized insights.'}
              </p>
              <button
                onClick={handleGenerateFeedback}
                disabled={generatingFeedback || !settings.enableClaude}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingFeedback ? 'Generating...' : 'Generate Feedback'}
              </button>
              {!settings.enableClaude && (
                <p className="text-sm text-gray-500 mt-2">
                  Enable Claude in Dev Settings to generate feedback
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Responses */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Responses</h2>

          {interview.responses.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">No responses recorded yet</p>
            </div>
          ) : (
            interview.responses.map((response, idx) => (
              <div key={response.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Station {response.station_number}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Time: {Math.floor((response.time_spent_seconds || 0) / 60)}:
                    {String((response.time_spent_seconds || 0) % 60).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Response:</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {response.response_text || 'No response'}
                      </p>
                    </div>
                  </div>

                  {response.transcription_status && (
                    <p className="text-xs text-gray-500">
                      Transcription status: {response.transcription_status}
                      {response.audio_duration_seconds &&
                        ` • Audio duration: ${Math.floor(response.audio_duration_seconds / 60)}:${String(Math.floor(response.audio_duration_seconds % 60)).padStart(2, '0')}`
                      }
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
