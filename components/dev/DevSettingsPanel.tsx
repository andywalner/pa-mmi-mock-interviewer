'use client';

import { useState } from 'react';
import { useDevSettings } from '@/components/providers/DevSettingsProvider';

export default function DevSettingsPanel() {
  const { settings, updateSettings, isDevMode } = useDevSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!isDevMode) return null;

  return (
    <>
      {/* Dev Settings Status Panel - Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white/90 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg shadow-sm text-xs transition-all"
        title="Click to change settings"
      >
        <div className="font-semibold mb-1 text-gray-800">Settings:</div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${settings.enableAudioMode ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
            <span>Audio: {settings.enableAudioMode ? 'On' : 'Off'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${settings.enableDeepgram ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
            <span>Deepgram: {settings.enableDeepgram ? 'On' : 'Off'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${settings.enableClaude ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
            <span>Claude: {settings.enableClaude ? 'On' : 'Off'}</span>
          </div>
        </div>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Dev Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                title="Close"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {/* Dev Mode Info */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dev Mode Active</strong> - Control input mode and API calls during testing.
                  Changes persist for this session only.
                </p>
              </div>

              {/* Audio Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Audio Recording Mode</h3>
                  <p className="text-sm text-gray-600">
                    Record spoken responses (vs. typing text)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAudioMode}
                    onChange={(e) => updateSettings({ enableAudioMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
                </label>
              </div>

              {/* Deepgram Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Deepgram Transcription</h3>
                  <p className="text-sm text-gray-600">
                    Transcribe audio recordings to text
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableDeepgram}
                    onChange={(e) => updateSettings({ enableDeepgram: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
                </label>
              </div>

              {/* Claude Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Claude AI Feedback</h3>
                  <p className="text-sm text-gray-600">
                    Get AI-powered evaluation of responses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableClaude}
                    onChange={(e) => updateSettings({ enableClaude: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-medical-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-600"></div>
                </label>
              </div>

              {/* Current Status Summary */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Current Settings:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.enableAudioMode ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
                    Audio Mode: {settings.enableAudioMode ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.enableDeepgram ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
                    Deepgram: {settings.enableDeepgram ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${settings.enableClaude ? 'bg-medical-500' : 'bg-gray-400'}`}></span>
                    Claude: {settings.enableClaude ? 'Enabled' : 'Disabled'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full btn-primary"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
