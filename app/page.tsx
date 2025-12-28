import StartButton from '@/components/landing/StartButton';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            PA MMI <span className="text-medical-500">Mock Interviewer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice your Physician Assistant Multiple Mini Interview with AI-powered feedback
          </p>
        </div>

        <div className="card max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Complete 5 MMI stations by typing your responses</li>
              <li>Each station has a 7-minute timer (not enforced)</li>
              <li>Get detailed AI feedback on your performance</li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-center">
              <StartButton />
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            This is a practice tool. Your responses will be evaluated using AI to help you prepare for real MMI interviews.
          </p>
        </div>
      </div>
    </main>
  );
}
