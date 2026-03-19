'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { InterviewSession, InterviewContextType, MMIQuestion, StationResponse } from '@/types';
import { STATION_CONFIG } from '@/lib/questions';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  createInterview,
  saveResponse as saveResponseToDB,
  completeInterview as completeInterviewInDB,
  getDefaultInterviewTypeId,
  updateCurrentStation,
  loadInterview,
  canStartInterview,
  getUserMonthlyInterviewCount,
  getInProgressInterview,
  fetchRandomQuestions,
  fetchQuestionsByIds,
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
  questions: undefined,
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// Build MMIQuestion objects from DB question data
function buildQuestions(
  questionData: { id: string; category: string; prompt: string }[]
): MMIQuestion[] {
  return questionData.map(q => {
    const stationConfig = STATION_CONFIG.find(c => c.category === q.category);
    return {
      id: q.id,
      category: q.category,
      prompt: q.prompt,
      timeLimit: stationConfig?.timeLimit || 420,
    };
  });
}

// Helper to convert DB interview to session state
function convertDbToSession(
  dbInterview: InterviewWithResponses,
  questions: MMIQuestion[]
): InterviewSession {
  // Map DB responses to session responses
  const responses: StationResponse[] = dbInterview.responses.map(dbResponse => {
    // Find the question for this response by matching question_id
    const question = questions.find(q => q.id === dbResponse.question_id);

    return {
      stationId: dbResponse.station_number,
      question: question?.prompt || dbResponse.question?.prompt || '',
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
    questionIds: questions.map(q => q.id),
    questions,
  };
}

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSession>(defaultSession);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();
  // Stable user ID ref — lets us detect actual user changes vs token refreshes
  const lastUserIdRef = useRef<string | null>(null);
  // Incremented by startInterview so loadSession knows not to overwrite
  const sessionVersionRef = useRef(0);

  // Load session state on mount and when user identity changes (not token refreshes)
  useEffect(() => {
    const userId = user?.id ?? null;

    // Skip if same user (token refresh creates new object but same id)
    if (isHydrated && userId === lastUserIdRef.current) return;

    // Capture version at start — if startInterview bumps it while we're loading,
    // we know our data is stale and should not overwrite
    const versionAtStart = sessionVersionRef.current;

    async function loadSession() {
      if (typeof window === 'undefined') return;

      // If user is authenticated, check for in-progress interview in DB
      if (user) {
        lastUserIdRef.current = user.id;
        try {
          const { data: dbInterview } = await getInProgressInterview(user.id);
          console.log('[loadSession] getInProgressInterview result:', dbInterview?.id, 'settings:', JSON.stringify(dbInterview?.settings));

          if (dbInterview) {
            // Abort if startInterview ran while we were fetching
            if (sessionVersionRef.current !== versionAtStart) {
              console.log('[loadSession] aborted — startInterview ran while loading');
              return;
            }

            // Read questionIds from interview settings
            const settings = dbInterview.settings as { questionIds?: string[] } | null;
            const questionIds = settings?.questionIds;
            console.log('[loadSession] questionIds from settings:', questionIds?.length, questionIds);

            let questions: MMIQuestion[] = [];
            if (questionIds && questionIds.length > 0) {
              const { data: questionData } = await fetchQuestionsByIds(questionIds);
              if (questionData) {
                questions = buildQuestions(questionData);
              }
            }

            // Convert DB interview to session state
            const sessionFromDb = convertDbToSession(dbInterview, questions);

            // Check for pending transcriptions (session was interrupted)
            const hasPendingTranscriptions = dbInterview.responses.some(
              r => r.transcription_status === 'pending'
            );

            if (hasPendingTranscriptions) {
              console.log('Found pending transcriptions from interrupted session, marking as incomplete');

              // Update all pending transcriptions to error status in DB
              for (const response of dbInterview.responses) {
                if (response.transcription_status === 'pending') {
                  try {
                    await saveResponseToDB(
                      dbInterview.id,
                      response.station_number,
                      response.question_id,
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
              if (sessionVersionRef.current !== versionAtStart) return;
              const { data: updatedInterview } = await getInProgressInterview(user.id);
              if (updatedInterview) {
                if (sessionVersionRef.current !== versionAtStart) return;
                const updatedSession = convertDbToSession(updatedInterview, questions);
                setSession(updatedSession);
                setIsHydrated(true);
                return;
              }
            }

            // Final check before overwriting
            if (sessionVersionRef.current !== versionAtStart) return;
            setSession(sessionFromDb);
            setIsHydrated(true);
            return;
          }
        } catch (error) {
          console.error('Failed to load in-progress interview from DB:', error);
        }
      } else {
        lastUserIdRef.current = null;
      }

      // Abort if startInterview ran while we were loading
      if (sessionVersionRef.current !== versionAtStart) return;

      // Fall back to sessionStorage
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSession(parsed);
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
    // Signal any pending loadSession to abort — we're taking over
    sessionVersionRef.current++;

    // Create interview in database if user is authenticated
    let interviewId: string | undefined;
    let questionIds: string[] | undefined;
    let questions: MMIQuestion[] | undefined;

    if (user) {
      // CHECK QUOTA FIRST — throw on quota exceeded so StartButton can show the error
      const { allowed, count, limit, error: quotaError } = await canStartInterview(user.id)

      if (quotaError) {
        console.error('Failed to check quota:', quotaError)
        // Continue anyway - don't block on quota check failure
      } else if (!allowed) {
        throw new Error(
          `You've reached your limit of ${limit} interviews this month. ` +
          `Your quota resets on the 1st. For additional interview credits, ` +
          `please contact thepaprep@gmail.com`
        )
      }

      try {
        // Get default interview type
        const { data: interviewTypeId, error: typeError } = await getDefaultInterviewTypeId();
        if (typeError || !interviewTypeId) {
          console.error('Failed to get interview type:', typeError);
        } else {
          // Fetch random questions (one per category)
          const { data: questionData, error: questionsError } = await fetchRandomQuestions(interviewTypeId);
          console.log('[startInterview] fetchRandomQuestions returned:', questionData?.length, 'questions', questionsError ? `error: ${questionsError.message}` : '');
          if (questionsError || !questionData || questionData.length === 0) {
            console.error('Failed to fetch questions:', questionsError);
          } else {
            questionIds = questionData.map(q => q.id);
            questions = buildQuestions(questionData);

            // Create interview record with questionIds in settings
            const { data: interview, error: createError } = await createInterview(
              user.id,
              interviewTypeId,
              undefined,
              { questionIds }
            );

            if (createError || !interview) {
              console.error('Failed to create interview:', createError);
            } else {
              interviewId = interview.id;
            }
          }
        }
      } catch (error) {
        console.error('Error starting interview:', error);
      }
    }

    console.log('[startInterview] setting session:', { interviewId, questionIds: questionIds?.length, questionsCount: questions?.length });
    setSession(s => ({
      ...s,
      selectedSchool: null,
      currentStationIndex: 0,
      responses: [],
      isComplete: false,
      interviewId,
      questionIds,
      questions,
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

      // Read questionIds from interview settings
      const settings = dbInterview.settings as { questionIds?: string[] } | null;
      const questionIds = settings?.questionIds;

      let questions: MMIQuestion[] = [];
      if (questionIds && questionIds.length > 0) {
        const { data: questionData } = await fetchQuestionsByIds(questionIds);
        if (questionData) {
          questions = buildQuestions(questionData);
        }
      }

      // Convert DB interview to session state
      const sessionFromDb = convertDbToSession(dbInterview, questions);
      setSession(sessionFromDb);
    } catch (error) {
      console.error('Error resuming interview:', error);
    }
  };

  const saveResponse = async (response: string, timeSpent: number) => {
    const currentQuestion = session.questions?.[session.currentStationIndex];
    const stationResponse: StationResponse = {
      stationId: session.currentStationIndex + 1,
      question: currentQuestion?.prompt || '',
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
    const currentQuestion = session.questions?.[session.currentStationIndex];
    const stationResponse: StationResponse = {
      stationId: session.currentStationIndex + 1,
      question: currentQuestion?.prompt || '',
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
    console.log('[nextStation] moving to index', newIndex, 'questions array length:', session.questions?.length);

    setSession(s => {
      console.log('[nextStation] updater: s.questions length:', s.questions?.length);
      return { ...s, currentStationIndex: newIndex };
    });

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
    sessionVersionRef.current++;
    setSession(defaultSession);
    lastUserIdRef.current = null; // Allow loadSession to re-run on next user change
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
    resetInterview,
    getUserQuota: async () => {
      if (!user) return { count: 0, limit: 10, error: null }
      return await getUserMonthlyInterviewCount(user.id)
    }
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
