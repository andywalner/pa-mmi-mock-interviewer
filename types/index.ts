export interface School {
  id: string;
  name: string;
}

export interface MMIQuestion {
  id: number;
  station: number;
  prompt: string;
  timeLimit: number;
}

export interface StationResponse {
  stationId: number;
  question: string;
  response: string; // Text response (for text mode)
  audioBlob?: Blob; // Audio recording (for audio mode)
  audioDuration?: number; // Duration in seconds
  timeSpent: number;
  transcription?: string; // Transcribed text from Deepgram
  transcriptionStatus?: 'pending' | 'completed' | 'error'; // Transcription status
  transcriptionError?: string; // Error message if transcription failed
}

export interface InterviewSession {
  selectedSchool: School | null;
  currentStationIndex: number;
  responses: StationResponse[];
  isComplete: boolean;
  interviewId?: string; // Database interview ID
  questionIds?: string[]; // Database question IDs for each station
}

export interface InterviewContextType {
  session: InterviewSession;
  setSelectedSchool: (school: School) => void;
  startInterview: () => void;
  resumeInterview: (interviewId: string) => Promise<void>;
  saveResponse: (response: string, timeSpent: number) => void;
  saveAudioResponse: (audioBlob: Blob, audioDuration: number, timeSpent: number) => void;
  updateTranscription: (stationIndex: number, transcription: string, error?: string) => void;
  nextStation: () => void;
  submitInterview: () => void;
  resetInterview: () => void;
}

export interface EvaluationRequest {
  school: School;
  responses: StationResponse[];
}

export interface EvaluationResponse {
  feedback: string;
  timestamp: string;
}
