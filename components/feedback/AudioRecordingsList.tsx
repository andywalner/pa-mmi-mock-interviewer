'use client';

import { useState, useEffect } from 'react';
import { StationResponse } from '@/types';
import { formatTime } from '@/lib/utils';

interface AudioRecordingsListProps {
  responses: StationResponse[];
}

export default function AudioRecordingsList({ responses }: AudioRecordingsListProps) {
  const [audioUrls, setAudioUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create object URLs for audio blobs
    const urls = responses.map(r =>
      r.audioBlob ? URL.createObjectURL(r.audioBlob) : ''
    );
    setAudioUrls(urls);

    // Cleanup
    return () => {
      urls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [responses]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Audio Recordings Saved! 🎤
          </h1>
          <p className="text-gray-600">
            Prototype mode: Your recordings are stored in memory
          </p>
        </div>

        <div className="card mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
            <h3 className="font-semibold text-yellow-900 mb-1">Prototype Mode</h3>
            <p className="text-sm text-yellow-800">
              Audio recordings are stored in memory for this session only. Refreshing the page will clear all recordings.
              In production, recordings will be uploaded to S3 for permanent storage.
            </p>
          </div>

          <div className="bg-medical-50 border-l-4 border-medical-500 p-4 rounded-r-lg mb-6">
            <h3 className="font-semibold text-medical-900 mb-2">Next Steps (To be implemented):</h3>
            <ol className="text-sm text-medical-800 space-y-1 list-decimal list-inside">
              <li>Upload audio files to S3</li>
              <li>Bulk transcribe using Deepgram API</li>
              <li>Submit transcriptions to Claude for evaluation</li>
            </ol>
          </div>

          <div className="space-y-4">
            {responses.map((response, index) => (
              <div key={response.stationId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Station {response.stationId}</h3>
                    <p className="text-sm text-gray-600 mt-1">{response.question}</p>
                  </div>
                  <span className="bg-medical-100 text-medical-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formatTime(response.audioDuration || 0)}
                  </span>
                </div>

                {response.audioBlob && audioUrls[index] ? (
                  <div className="space-y-2">
                    <audio controls className="w-full" src={audioUrls[index]}>
                      Your browser does not support audio playback.
                    </audio>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Size: {formatBytes(response.audioBlob.size)}</span>
                      <span>Type: {response.audioBlob.type || 'audio/webm'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded text-center text-gray-500 text-sm">
                    No recording available
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  {response.transcriptionStatus === 'pending' && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                      <p className="text-sm text-blue-800">
                        <strong>Transcribing...</strong> Please wait while we process your audio.
                      </p>
                    </div>
                  )}

                  {response.transcriptionStatus === 'completed' && response.transcription && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r">
                      <p className="text-sm font-semibold text-green-900 mb-2">Transcription:</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{response.transcription}</p>
                    </div>
                  )}

                  {response.transcriptionStatus === 'error' && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r">
                      <p className="text-sm text-red-800">
                        <strong>Transcription failed:</strong> {response.transcriptionError || 'Unknown error'}
                      </p>
                    </div>
                  )}

                  {!response.transcriptionStatus && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
                      <p className="text-sm text-yellow-800">
                        <strong>No transcription yet.</strong> Transcription is triggered when you navigate to the next station.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Start New Interview
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>Prototype Status:</strong> Audio recording and local storage ✅
          </p>
          <p>
            <strong>Pending:</strong> S3 upload, Deepgram transcription, Claude evaluation
          </p>
        </div>
      </div>
    </div>
  );
}
