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
} from '@/lib/services/interviewService';
import { createClient } from '@/lib/supabase/client';

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

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSession>(defaultSession);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []);

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

  const setSelectedSchool = (school: School) => {
    setSession(s => ({ ...s, selectedSchool: school }));
  };

  const startInterview = async () => {
    // Set generic school for API compatibility
    const genericSchool: School = { id: 'general', name: 'PA Program' };

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
            genericSchool.name
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
      selectedSchool: genericSchool,
      currentStationIndex: 0,
      responses: [],
      isComplete: false,
      interviewId,
      questionIds,
    }));
  };

  const saveResponse = (response: string, timeSpent: number) => {
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

  const updateTranscription = async (stationIndex: number, transcription: string, error?: string) => {
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
      const response = session.responses[stationIndex];
      if (response && session.questionIds[stationIndex]) {
        try {
          await saveResponseToDB(
            session.interviewId,
            stationIndex + 1, // Station number is 1-indexed in DB
            session.questionIds[stationIndex],
            {
              response_text: transcription,
              audio_duration_seconds: response.audioDuration || 0,
              transcription_status: 'completed',
              time_spent_seconds: response.timeSpent,
            }
          );
        } catch (err) {
          console.error('Failed to save response to database:', err);
        }
      }
    }
  };

  const nextStation = () => {
    setSession(s => ({
      ...s,
      currentStationIndex: s.currentStationIndex + 1
    }));
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
    setSelectedSchool,
    startInterview,
    saveResponse,
    saveAudioResponse,
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
