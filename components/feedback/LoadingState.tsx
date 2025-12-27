'use client';

import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Taking your vital signs... of a good candidate...",
  "Checking if you're PA material...",
  "Running your responses through triage...",
  "Prescribing feedback...",
  "Auscultating your answers...",
  "Performing a thorough evaluation...",
  "Stat consult in progress...",
  "Reading your chart...",
  "Scrubbing in to review your responses...",
  "Making rounds on your answers...",
  "Reviewing your differential diagnosis...",
  "Consulting with the attending...",
  "Scoring your empathy response...",
  "Analyzing your clinical reasoning...",
  "Checking your bedside manner..."
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 400);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Hang tight!
          </h1>
          <p className="text-lg text-gray-700">
            Our AI evaluator is reviewing your responses.
            <br />
            <span className="text-medical-600 font-medium">This may take a few minutes...</span>
          </p>
        </div>

        {/* Animated Spinner */}
        <div className="relative py-8">
          <div className="w-24 h-24 border-4 border-medical-200 border-t-medical-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-medical-50 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Rotating Messages */}
        <div className="min-h-[60px] flex items-center justify-center">
          <p
            className={`text-lg text-medical-600 font-medium italic transition-opacity duration-400 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="progress-bar max-w-md mx-auto">
            <div className="progress-fill animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Subtle encouragement */}
        <p className="text-sm text-gray-500 italic">
          Meanwhile, take a deep breath. You&apos;ve got this! 💪
        </p>
      </div>
    </div>
  );
}
