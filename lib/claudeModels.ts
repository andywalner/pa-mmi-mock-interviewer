import { ClaudeModel } from '@/components/providers/DevSettingsProvider';

/**
 * Maps dev settings model selection to actual Claude API model IDs
 * Based on Claude API documentation (2025)
 */
export function getClaudeModelId(model: ClaudeModel): string {
  const modelMap: Record<ClaudeModel, string> = {
    haiku: 'claude-haiku-4-5-20251001',      // $1/$5 per million tokens
    sonnet: 'claude-sonnet-4-5-20250929',    // $3/$15 per million tokens
    opus: 'claude-opus-4-5-20251101'         // $15/$75 per million tokens
  };

  return modelMap[model];
}

/**
 * Get model display name for UI
 */
export function getClaudeModelName(model: ClaudeModel): string {
  const nameMap: Record<ClaudeModel, string> = {
    haiku: 'Claude Haiku 4.5',
    sonnet: 'Claude Sonnet 4.5',
    opus: 'Claude Opus 4.5'
  };

  return nameMap[model];
}
