/**
 * useAI — React hook for the Hotel Insight AI service layer.
 *
 * Usage:
 *   const { classifyMessage, generateReply, generateReviewResponse, extractTask, isLoading, error, isMockMode } = useAI();
 *
 * Each function mirrors the service layer signature but additionally:
 *  - Sets the shared `isLoading` flag while in flight
 *  - Captures any error into `error` state
 *  - Returns null on failure (callers can check error)
 *
 * The hook is safe to call from any component tree; it never throws.
 */

import { useState, useCallback } from 'react';
import {
  classifyMessage as svcClassify,
  generateReply as svcGenerateReply,
  generateReviewResponse as svcReviewResponse,
  extractTask as svcExtractTask,
  isMockMode as _isMockMode,
} from '../services/ai';
import type {
  MessageClassification,
  GeneratedReply,
  GenerateReplyInput,
  ReviewResponseInput,
  ReviewResponseResult,
  ExtractedTask,
} from '../services/ai';

export type { MessageClassification, GeneratedReply, ReviewResponseResult, ExtractedTask };

// ─── Loading state ────────────────────────────────────────────────────────────

// Distinct operation keys so callers can show per-operation spinners
export type AIOperation = 'classify' | 'reply' | 'review' | 'task' | null;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAI() {
  const [loadingOp, setLoadingOp] = useState<AIOperation>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared wrapper: sets loading/error, returns null on failure
  async function run<T>(op: AIOperation, fn: () => Promise<T>): Promise<T | null> {
    setLoadingOp(op);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
      return null;
    } finally {
      setLoadingOp(null);
    }
  }

  /** Classify a guest message — returns intent, urgency, department, language */
  const classifyMessage = useCallback(
    (guestMessage: string): Promise<MessageClassification | null> =>
      run('classify', () => svcClassify(guestMessage)),
    [],
  );

  /** Generate a staff reply draft in the guest's language */
  const generateReply = useCallback(
    (input: GenerateReplyInput): Promise<GeneratedReply | null> =>
      run('reply', () => svcGenerateReply(input)),
    [],
  );

  /** Generate a professional public response to a guest review */
  const generateReviewResponse = useCallback(
    (input: ReviewResponseInput): Promise<ReviewResponseResult | null> =>
      run('review', () => svcReviewResponse(input)),
    [],
  );

  /** Extract a structured task object from a maintenance/housekeeping message */
  const extractTask = useCallback(
    (guestMessage: string): Promise<ExtractedTask | null> =>
      run('task', () => svcExtractTask(guestMessage)),
    [],
  );

  return {
    // Functions
    classifyMessage,
    generateReply,
    generateReviewResponse,
    extractTask,

    // State
    isLoading: loadingOp !== null,
    loadingOp,             // which specific operation is in flight
    error,
    clearError: () => setError(null),

    // Config
    isMockMode: _isMockMode,
  };
}
