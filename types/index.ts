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
  response: string;
  timeSpent: number;
}

export interface InterviewSession {
  selectedSchool: School | null;
  currentStationIndex: number;
  responses: StationResponse[];
  isComplete: boolean;
}

export interface InterviewContextType {
  session: InterviewSession;
  setSelectedSchool: (school: School) => void;
  startInterview: () => void;
  saveResponse: (response: string, timeSpent: number) => void;
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
