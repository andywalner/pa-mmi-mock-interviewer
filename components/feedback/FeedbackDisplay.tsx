'use client';

import { useRouter } from 'next/navigation';
import { useInterview } from '@/components/providers/InterviewProvider';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FeedbackDisplayProps {
  feedback: string;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const router = useRouter();
  const { resetInterview } = useInterview();

  const handleNewInterview = () => {
    resetInterview();
    router.push('/');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Interview Feedback
          </h1>
          <p className="text-gray-600">
            Detailed evaluation of your MMI performance
          </p>
        </div>

        <div className="card mb-8">
          <article className="prose prose-lg prose-medical max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {feedback}
            </ReactMarkdown>
          </article>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleNewInterview}
            className="btn-primary"
          >
            Start New Interview
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This feedback is AI-generated and meant for practice purposes.
            Real MMI interviews will be evaluated by human assessors.
          </p>
        </div>
      </div>
    </div>
  );
}
