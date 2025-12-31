import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EvaluationRequest } from '@/types';
import { ClaudeModel } from '@/components/providers/DevSettingsProvider';
import { getClaudeModelId } from '@/lib/claudeModels';
import { formatTime } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { school, responses, model }: EvaluationRequest & { model?: ClaudeModel } = await request.json();

    if (!school || !responses || responses.length === 0) {
      return NextResponse.json(
        { error: 'Missing school or responses' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    const instructionsPath = join(process.cwd(), 'instructions.md');
    const systemPrompt = readFileSync(instructionsPath, 'utf-8');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const userMessage = formatResponsesForEvaluation(school.name, responses);

    // Use model from dev settings, fallback to env variable, then default to Sonnet 4.5
    const selectedModel = model ? getClaudeModelId(model) : (process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929');

    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        } as any // Type assertion for prompt caching (API supports it but types don't yet)
      ],
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const feedback = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Unable to generate feedback';

    return NextResponse.json({
      feedback,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate responses. Please try again.' },
      { status: 500 }
    );
  }
}

function formatResponsesForEvaluation(schoolName: string, responses: any[]): string {
  return `
I have completed a practice MMI interview for PA school admission. Please evaluate my responses to all ${responses.length} stations.

${responses.map((r, idx) => `
---
STATION ${idx + 1}

Question/Scenario:
${r.question}

My Response:
${r.response}
${r.audioDuration ? `\n(Spoken response duration: ${formatTime(r.audioDuration)})` : ''}
---
`).join('\n')}

Please provide comprehensive feedback following the evaluation rubric and format specified in your instructions.
  `.trim();
}
