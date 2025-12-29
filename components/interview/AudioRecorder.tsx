'use client';

import { useState, useRef, useEffect } from 'react';
import { formatTime } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingCleared?: () => void;
  currentRecording?: { blob: Blob; duration: number } | null;
  maxDuration?: number; // in seconds
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export default function AudioRecorder({
  onRecordingComplete,
  onRecordingCleared,
  currentRecording,
  maxDuration = 420, // 7 minutes default
  onRecordingStateChange
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0); // Actual recording time
  const [hasRecording, setHasRecording] = useState(!!currentRecording);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pausedTimeRef = useRef<number>(0); // Cumulative paused time
  const recordingStartTimeRef = useRef<number>(0); // When current recording segment started

  useEffect(() => {
    if (currentRecording) {
      setHasRecording(true);
      setAudioUrl(URL.createObjectURL(currentRecording.blob));
      setRecordedDuration(currentRecording.duration);
    } else {
      // Reset state when moving to new station
      setHasRecording(false);
      setAudioUrl(null);
      setRecordedDuration(0);
    }
  }, [currentRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Use WebM with Opus codec for best Deepgram compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });

        setHasRecording(true);
        setAudioUrl(URL.createObjectURL(blob));
        onRecordingComplete(blob, recordedDuration);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      onRecordingStateChange?.(true);
      recordingStartTimeRef.current = Date.now();

      // Start timer - only counts when actively recording
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        const totalRecorded = pausedTimeRef.current + elapsed;
        setRecordedDuration(totalRecorded);

        // Auto-stop at max duration
        if (totalRecorded >= maxDuration) {
          stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      // Save elapsed time before pausing
      const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
      pausedTimeRef.current += elapsed;

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      recordingStartTimeRef.current = Date.now();

      // Restart timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        const totalRecorded = pausedTimeRef.current + elapsed;
        setRecordedDuration(totalRecorded);

        // Auto-stop at max duration
        if (totalRecorded >= maxDuration) {
          stopRecording();
        }
      }, 100);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      // Save final duration
      if (!isPaused) {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        pausedTimeRef.current += elapsed;
        setRecordedDuration(pausedTimeRef.current);
      }

      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      onRecordingStateChange?.(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    // Stop recording if active
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    // Clear everything
    setHasRecording(false);
    setAudioUrl(null);
    setRecordedDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    onRecordingStateChange?.(false);
    onRecordingCleared?.();
    pausedTimeRef.current = 0;
    chunksRef.current = [];

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (permissionDenied) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="text-center space-y-3">
          <div className="text-red-500 text-4xl">🎤❌</div>
          <h3 className="font-semibold text-red-900">Microphone Access Denied</h3>
          <p className="text-sm text-red-700">
            Please enable microphone permissions in your browser settings and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  const remainingTime = maxDuration - recordedDuration;
  const isNearLimit = remainingTime <= 60 && isRecording && !isPaused;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Your Audio Response
          </label>
          <span className="text-sm text-gray-500">
            {hasRecording && !isRecording && !isPaused ? `Recorded: ${formatTime(recordedDuration)}` : ''}
          </span>
        </div>

        {/* Recording Controls */}
        <div className="space-y-4">
          {/* Recording Status */}
          {(isRecording || isPaused) && (
            <div className={`border-l-4 p-4 rounded-r-lg ${isPaused ? 'bg-yellow-50 border-yellow-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className={`font-medium ${isPaused ? 'text-yellow-900' : 'text-red-900'}`}>
                    {isPaused ? 'Recording paused' : 'Recording in progress...'}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${isNearLimit ? 'text-red-600 animate-pulse' : isPaused ? 'text-yellow-700' : 'text-red-700'}`}>
                  {formatTime(recordedDuration)} / {formatTime(maxDuration)}
                </div>
              </div>
              {isNearLimit && (
                <p className="text-sm text-red-600 mt-2">Less than 1 minute remaining!</p>
              )}
              {isPaused && (
                <p className="text-sm text-yellow-700 mt-2">Click Resume to continue recording</p>
              )}
            </div>
          )}

          {/* Playback */}
          {hasRecording && !isRecording && !isPaused && audioUrl && (
            <div className="bg-medical-50 border-l-4 border-medical-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-medical-900">Preview your recording:</span>
                <span className="text-sm text-medical-700">{formatTime(recordedDuration)}</span>
              </div>
              <audio controls className="w-full" src={audioUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isRecording && !isPaused && !hasRecording && (
              <button
                onClick={startRecording}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🎤</span>
                Start Recording
              </button>
            )}

            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">⏸️</span>
                  Pause
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">✓</span>
                  Done
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={resumeRecording}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">▶️</span>
                  Resume
                </button>
                <button
                  onClick={stopRecording}
                  className="bg-medical-600 hover:bg-medical-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">✓</span>
                  Done
                </button>
                <button
                  onClick={clearRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🗑️</span>
                  Clear
                </button>
              </>
            )}

            {hasRecording && !isRecording && !isPaused && (
              <button
                onClick={clearRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🗑️</span>
                Clear & Re-record
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          💡 In a real MMI, you would speak your answer. Click "Start Recording" to begin.
          You can pause and resume as needed. Maximum recording duration: {formatTime(maxDuration)}
        </p>
      </div>
    </div>
  );
}
