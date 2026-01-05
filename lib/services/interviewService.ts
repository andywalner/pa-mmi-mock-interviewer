import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Interview = Database['public']['Tables']['interviews']['Row']
type InterviewInsert = Database['public']['Tables']['interviews']['Insert']
type Response = Database['public']['Tables']['responses']['Row']
type ResponseInsert = Database['public']['Tables']['responses']['Insert']
type Evaluation = Database['public']['Tables']['evaluations']['Row']
type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']

export interface InterviewWithResponses extends Interview {
  responses: Response[]
  evaluation?: Evaluation
}

/**
 * Create a new interview session in the database
 */
export async function createInterview(
  userId: string,
  interviewTypeId: string,
  schoolName?: string
): Promise<{ data: Interview | null; error: Error | null }> {
  const supabase = createClient()

  const interviewData: InterviewInsert = {
    user_id: userId,
    interview_type_id: interviewTypeId,
    status: 'in_progress',
    school_name: schoolName,
    current_station_index: 0,
    started_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('interviews')
    .insert(interviewData)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data, error: null }
}

/**
 * Save or update a response for a specific station
 */
export async function saveResponse(
  interviewId: string,
  stationNumber: number,
  questionId: string,
  responseData: {
    response_text: string
    audio_duration_seconds?: number
    transcription_status?: string
    time_spent_seconds?: number
  }
): Promise<{ data: Response | null; error: Error | null }> {
  const supabase = createClient()

  const responseInsert: ResponseInsert = {
    interview_id: interviewId,
    question_id: questionId,
    station_number: stationNumber,
    response_text: responseData.response_text,
    audio_duration_seconds: responseData.audio_duration_seconds || 0,
    transcription_status: responseData.transcription_status,
    time_spent_seconds: responseData.time_spent_seconds || 0,
  }

  // Use upsert to handle both insert and update
  const { data, error } = await supabase
    .from('responses')
    .upsert(responseInsert, {
      onConflict: 'interview_id,station_number',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data, error: null }
}

/**
 * Mark an interview as completed
 */
export async function completeInterview(
  interviewId: string
): Promise<{ data: Interview | null; error: Error | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('interviews')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', interviewId)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data, error: null }
}

/**
 * Load an interview with all its responses
 */
export async function loadInterview(
  interviewId: string
): Promise<{ data: InterviewWithResponses | null; error: Error | null }> {
  const supabase = createClient()

  const { data: interview, error: interviewError } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interviewId)
    .single()

  if (interviewError) {
    return { data: null, error: new Error(interviewError.message) }
  }

  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*')
    .eq('interview_id', interviewId)
    .order('station_number', { ascending: true })

  if (responsesError) {
    return { data: null, error: new Error(responsesError.message) }
  }

  const { data: evaluation } = await supabase
    .from('evaluations')
    .select('*')
    .eq('interview_id', interviewId)
    .single()

  return {
    data: {
      ...interview,
      responses: responses || [],
      evaluation: evaluation || undefined,
    },
    error: null,
  }
}

/**
 * Save an evaluation/feedback for an interview
 */
export async function saveEvaluation(
  interviewId: string,
  feedbackData: {
    feedback_text: string
    claude_model: string
    input_tokens?: number
    output_tokens?: number
    estimated_cost_usd?: number
  }
): Promise<{ data: Evaluation | null; error: Error | null }> {
  const supabase = createClient()

  const evaluationData: EvaluationInsert = {
    interview_id: interviewId,
    feedback_text: feedbackData.feedback_text,
    claude_model: feedbackData.claude_model,
    input_tokens: feedbackData.input_tokens || 0,
    output_tokens: feedbackData.output_tokens || 0,
    estimated_cost_usd: feedbackData.estimated_cost_usd || 0,
  }

  const { data, error } = await supabase
    .from('evaluations')
    .upsert(evaluationData, {
      onConflict: 'interview_id',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data, error: null }
}

/**
 * Get all interviews for a user
 */
export async function getUserInterviews(
  userId: string
): Promise<{ data: Interview[] | null; error: Error | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data, error: null }
}

/**
 * Get the default interview type ID (7-Min PA MMI)
 */
export async function getDefaultInterviewTypeId(): Promise<{
  data: string | null
  error: Error | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('interview_types')
    .select('id')
    .eq('slug', 'pa-mmi-7min')
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: data.id, error: null }
}
