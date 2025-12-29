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
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-medical-500"></span>
            <span>Model: {settings.claudeModel === 'haiku' ? 'Haiku' : settings.claudeModel === 'opus' ? 'Opus' : 'Sonnet'}</span>
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

              {/* Claude Model Selector */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900">Claude Model</h3>
                  <p className="text-sm text-gray-600">
                    Choose model for evaluation (affects cost and quality)
                  </p>
                </div>
                <select
                  value={settings.claudeModel}
                  onChange={(e) => updateSettings({ claudeModel: e.target.value as 'haiku' | 'sonnet' | 'opus' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 bg-white text-sm text-gray-900"
                >
                  <option value="haiku">Haiku 4.5 (Cheap)</option>
                  <option value="sonnet">Sonnet 4.5 (Default)</option>
                  <option value="opus">Opus 4.5 (Premium)</option>
                </select>
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
