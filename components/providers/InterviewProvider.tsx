'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InterviewSession, InterviewContextType, School, StationResponse } from '@/types';
import { MMI_QUESTIONS } from '@/lib/questions';

const STORAGE_KEY = 'mmi_interview_session';

const defaultSession: InterviewSession = {
  selectedSchool: null,
  currentStationIndex: 0,
  responses: [],
  isComplete: false
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSession>(defaultSession);
  const [isHydrated, setIsHydrated] = useState(false);

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

  const startInterview = () => {
    // Set generic school for API compatibility
    const genericSchool: School = { id: 'general', name: 'PA Program' };
    setSession(s => ({
      ...s,
      selectedSchool: genericSchool,
      currentStationIndex: 0,
      responses: [],
      isComplete: false
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

  const updateTranscription = (stationIndex: number, transcription: string, error?: string) => {
    setSession(s => {
      const updatedResponses = [...s.responses];
      if (updatedResponses[stationIndex]) {
        updatedResponses[stationIndex] = {
          ...updatedResponses[stationIndex],
          transcription,
          transcriptionStatus: error ? 'error' : (transcription ? 'completed' : 'pending'),
          transcriptionError: error
        };
      }
      return { ...s, responses: updatedResponses };
    });
  };

  const nextStation = () => {
    setSession(s => ({
      ...s,
      currentStationIndex: s.currentStationIndex + 1
    }));
  };

  const submitInterview = () => {
    setSession(s => ({ ...s, isComplete: true }));
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
