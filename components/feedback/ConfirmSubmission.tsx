'use client';

interface ConfirmSubmissionProps {
  onConfirm: (useMock: boolean) => void;
  responseCount: number;
}

export default function ConfirmSubmission({ onConfirm, responseCount }: ConfirmSubmissionProps) {
  const estimatedCost = 0.014; // Haiku cost estimate

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="card space-y-6">
          <div className="text-center space-y-3">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Submit?
            </h2>
            <p className="text-gray-600">
              You&apos;re about to evaluate {responseCount} interview responses.
            </p>
          </div>

          <div className="bg-medical-50 border-l-4 border-medical-500 p-6 rounded-r-lg space-y-3">
            <h3 className="font-semibold text-medical-900">Request Details:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Responses:</strong> {responseCount} stations</li>
              <li>• <strong>Model:</strong> Claude Haiku 3.5 (default)</li>
              <li>• <strong>Estimated cost:</strong> ~${estimatedCost.toFixed(3)} USD</li>
              <li>• <strong>System prompt:</strong> ~5,500 tokens (cached)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onConfirm(false)}
                className="btn-primary py-4"
              >
                💰 Submit Real Request
                <div className="text-xs opacity-90 mt-1">
                  Call Claude API (~${estimatedCost.toFixed(3)})
                </div>
              </button>

              <button
                onClick={() => onConfirm(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                🎭 Use Mock Response
                <div className="text-xs opacity-90 mt-1">
                  Test UI with fake data (free)
                </div>
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 italic">
              💡 Tip: Use mock responses to test the UI without API costs
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This confirmation can be disabled in production by removing <code className="bg-gray-100 px-2 py-1 rounded">ENABLE_API_CONFIRMATION</code> from .env.local
          </p>
        </div>
      </div>
    </div>
  );
}
