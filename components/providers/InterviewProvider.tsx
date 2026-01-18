'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterviewSession, InterviewContextType, School, StationResponse } from '@/types';
import { MMI_QUESTIONS } from '@/lib/questions';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  createInterview,
  saveResponse as saveResponseToDB,
  completeInterview as completeInterviewInDB,
  getDefaultInterviewTypeId,
  updateCurrentStation,
  loadInterview,
} from '@/lib/services/interviewService';
import { createClient } from '@/lib/supabase/client';
import {
  getInProgressInterview,
  type InterviewWithResponses,
} from '@/lib/services/interviewService';

const STORAGE_KEY = 'mmi_interview_session';

const defaultSession: InterviewSession = {
  selectedSchool: null,
  currentStationIndex: 0,
  responses: [],
  isComplete: false,
  interviewId: undefined,
  questionIds: undefined,
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// Helper to convert DB interview to session state
function convertDbToSession(dbInterview: InterviewWithResponses, questionIds: string[]): InterviewSession {
  // Map DB responses to session responses
  const responses: StationResponse[] = dbInterview.responses.map(dbResponse => {
    const questionIndex = dbResponse.station_number - 1;
    const mmiQuestion = MMI_QUESTIONS[questionIndex];

    return {
      stationId: mmiQuestion?.id || dbResponse.station_number,
      question: mmiQuestion?.prompt || '',
      response: dbResponse.response_text || '',
      transcription: dbResponse.response_text || '',
      transcriptionStatus: dbResponse.transcription_status as 'pending' | 'completed' | 'error' | undefined,
      audioDuration: dbResponse.audio_duration_seconds || 0,
      timeSpent: dbResponse.time_spent_seconds || 0,
    };
  });

  return {
    selectedSchool: null,
    currentStationIndex: dbInterview.current_station_index || 0,
    responses,
    isComplete: dbInterview.status === 'completed',
    interviewId: dbInterview.id,
    questionIds,
  };
}

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSession>(defaultSession);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();

  // Load session state on mount: check DB first, then sessionStorage
  useEffect(() => {
    async function loadSession() {
      if (typeof window === 'undefined') return;

      // If user is authenticated, check for in-progress interview in DB
      if (user) {
        try {
          const { data: dbInterview } = await getInProgressInterview(user.id);

          if (dbInterview) {
            // Load question IDs
            const supabase = createClient();
            const { data: questions } = await supabase
              .from('questions')
              .select('id')
              .eq('interview_type_id', dbInterview.interview_type_id)
              .order('station_number', { ascending: true });

            const questionIds = questions?.map(q => q.id) || [];

            // Convert DB interview to session state
            const sessionFromDb = convertDbToSession(dbInterview, questionIds);

            // Check for pending transcriptions (session was interrupted)
            // Mark them as error since we don't have the audio blob to retry
            const hasPendingTranscriptions = dbInterview.responses.some(
              r => r.transcription_status === 'pending'
            );

            if (hasPendingTranscriptions) {
              console.log('Found pending transcriptions from interrupted session, marking as incomplete');

              // Update all pending transcriptions to error status in DB
              for (const response of dbInterview.responses) {
                if (response.transcription_status === 'pending' && questionIds[response.station_number - 1]) {
                  try {
                    await saveResponseToDB(
                      dbInterview.id,
                      response.station_number,
                      questionIds[response.station_number - 1],
                      {
                        response_text: response.response_text || '',
                        audio_duration_seconds: response.audio_duration_seconds || 0,
                        transcription_status: 'error',
                        time_spent_seconds: response.time_spent_seconds || 0,
                      }
                    );
                  } catch (err) {
                    console.error('Failed to update pending transcription:', err);
                  }
                }
              }

              // Reload interview to get updated statuses
              const { data: updatedInterview } = await getInProgressInterview(user.id);
              if (updatedInterview) {
                const updatedSession = convertDbToSession(updatedInterview, questionIds);
                setSession(updatedSession);
                setIsHydrated(true);
                return;
              }
            }

            setSession(sessionFromDb);
            setIsHydrated(true);
            return;
          }
        } catch (error) {
          console.error('Failed to load in-progress interview from DB:', error);
        }
      }

      // Fall back to sessionStorage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSession(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse stored session:', error);
        }
      }
      setIsHydrated(true);
    }

    loadSession();
  }, [user]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      // Create a serializable version without audio blobs
      const sessionToStore = {
        ...session,
        responses: session.responses.map(r => ({
          ...r,
          audioBlob: undefined // Exclude blobs from storage
        }))
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToStore));
    }
  }, [session, isHydrated]);

  const startInterview = async () => {
    // Create interview in database if user is authenticated
    let interviewId: string | undefined;
    let questionIds: string[] | undefined;

    if (user) {
      try {
        // Get default interview type
        const { data: interviewTypeId, error: typeError } = await getDefaultInterviewTypeId();
        if (typeError || !interviewTypeId) {
          console.error('Failed to get interview type:', typeError);
        } else {
          // Create interview record
          const { data: interview, error: createError } = await createInterview(
            user.id,
            interviewTypeId,
            undefined // No school name needed
          );

          if (createError || !interview) {
            console.error('Failed to create interview:', createError);
          } else {
            interviewId = interview.id;

            // Fetch question IDs from database
            const supabase = createClient();
            const { data: questions } = await supabase
              .from('questions')
              .select('id')
              .eq('interview_type_id', interviewTypeId)
              .order('station_number', { ascending: true });

            if (questions) {
              questionIds = questions.map(q => q.id);
            }
          }
        }
      } catch (error) {
        console.error('Error starting interview:', error);
      }
    }

    setSession(s => ({
      ...s,
      selectedSchool: null,
      currentStationIndex: 0,
      responses: [],
      isComplete: false,
      interviewId,
      questionIds,
    }));
  };

  const resumeInterview = async (interviewId: string) => {
    if (!user) return;

    try {
      const { data: dbInterview, error } = await loadInterview(interviewId);

      if (error || !dbInterview) {
        console.error('Failed to load interview:', error);
        return;
      }

      // Load question IDs
      const supabase = createClient();
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('interview_type_id', dbInterview.interview_type_id)
        .order('station_number', { ascending: true });

      const questionIds = questions?.map(q => q.id) || [];

      // Convert DB interview to session state
      const sessionFromDb = convertDbToSession(dbInterview, questionIds);
      setSession(sessionFromDb);
    } catch (error) {
      console.error('Error resuming interview:', error);
    }
  };

  const saveResponse = async (response: string, timeSpent: number) => {
    const currentQuestion = MMI_QUESTIONS[session.currentStationIndex];
    const stationResponse: StationResponse = {
      stationId: currentQuestion.id,
      question: currentQuestion.prompt,
      response,
      timeSpent
    };

    setSession(s => {
      const updatedResponses = [...s.responses];
      updatedResponses[s.currentStationIndex] = stationResponse;
      return { ...s, responses: updatedResponses };
    });

    // Save to database immediately
    if (user && session.interviewId && session.questionIds) {
      const stationIndex = session.currentStationIndex;
      if (session.questionIds[stationIndex]) {
        try {
          await saveResponseToDB(
            session.interviewId,
            stationIndex + 1, // Station number is 1-indexed in DB
            session.questionIds[stationIndex],
            {
              response_text: response,
              time_spent_seconds: timeSpent,
            }
          );
        } catch (err) {
          console.error('Failed to save text response to database:', err);
        }
      }
    }
  };

  const saveAudioResponse = (audioBlob: Blob, audioDuration: number, timeSpent: number) => {
    const currentQuestion = MMI_QUESTIONS[session.currentStationIndex];
    const stationResponse: StationResponse = {
      stationId: currentQuestion.id,
      question: currentQuestion.prompt,
      response: '', // Empty for audio mode
      audioBlob,
      audioDuration,
      timeSpent
    };

    setSession(s => {
      const updatedResponses = [...s.responses];
      updatedResponses[s.currentStationIndex] = stationResponse;
      return { ...s, responses: updatedResponses };
    });
  };

  const saveAudioResponseToDB = async () => {
    const stationIndex = session.currentStationIndex;
    const response = session.responses[stationIndex];

    if (!response || !user || !session.interviewId || !session.questionIds) {
      return;
    }

    if (!session.questionIds[stationIndex]) {
      console.error('Question ID not found for station:', stationIndex);
      return;
    }

    try {
      await saveResponseToDB(
        session.interviewId,
        stationIndex + 1, // Station number is 1-indexed in DB
        session.questionIds[stationIndex],
        {
          response_text: response.response || response.transcription || '',
          audio_duration_seconds: response.audioDuration || 0,
          transcription_status: response.transcription ? 'completed' : undefined,
          time_spent_seconds: response.timeSpent || 0,
        }
      );
    } catch (err) {
      console.error('Failed to save audio response to database:', err);
    }
  };

  const updateTranscription = async (stationIndex: number, transcription: string, error?: string) => {
    // Capture the current response BEFORE updating state - it has the timeSpent value from saveAudioResponse
    const currentResponse = session.responses[stationIndex];

    setSession(s => {
      const updatedResponses = [...s.responses];
      if (updatedResponses[stationIndex]) {
        updatedResponses[stationIndex] = {
          ...updatedResponses[stationIndex],
          response: transcription || updatedResponses[stationIndex].response, // Copy transcription to response field
          transcription,
          transcriptionStatus: error ? 'error' : (transcription ? 'completed' : 'pending'),
          transcriptionError: error
        };
      }
      return { ...s, responses: updatedResponses };
    });

    // Save to database immediately when transcription is completed
    if (transcription && !error && user && session.interviewId && session.questionIds) {
      if (currentResponse && session.questionIds[stationIndex]) {
        try {
          await saveResponseToDB(
            session.interviewId,
            stationIndex + 1, // Station number is 1-indexed in DB
            session.questionIds[stationIndex],
            {
              response_text: transcription,
              audio_duration_seconds: currentResponse.audioDuration || 0,
              transcription_status: 'completed',
              time_spent_seconds: currentResponse.timeSpent || 0,
            }
          );
        } catch (err) {
          console.error('Failed to save response to database:', err);
        }
      }
    }
  };

  const nextStation = async () => {
    const newIndex = session.currentStationIndex + 1;

    setSession(s => ({
      ...s,
      currentStationIndex: newIndex
    }));

    // Update current station in database
    if (user && session.interviewId) {
      try {
        await updateCurrentStation(session.interviewId, newIndex);
      } catch (err) {
        console.error('Failed to update current station in database:', err);
      }
    }
  };

  const submitInterview = async () => {
    setSession(s => ({ ...s, isComplete: true }));

    // Mark interview as completed in database
    if (user && session.interviewId) {
      try {
        await completeInterviewInDB(session.interviewId);
      } catch (err) {
        console.error('Failed to mark interview as completed:', err);
      }
    }
  };

  const resetInterview = () => {
    setSession(defaultSession);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: InterviewContextType = {
    session,
    startInterview,
    resumeInterview,
    saveResponse,
    saveAudioResponse,
    saveAudioResponseToDB,
    updateTranscription,
    nextStation,
    submitInterview,
    resetInterview
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
}
