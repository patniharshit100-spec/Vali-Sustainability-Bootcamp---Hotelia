// callAI.ts — AI-assisted call suggestions and post-call summaries
// Uses Anthropic API when VITE_ANTHROPIC_API_KEY is set, otherwise returns mock responses.

import type { TranscriptLine } from '../types/call';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
const IS_DEMO = !API_KEY || API_KEY === 'demo';

// ── Live suggestion during a call ─────────────────────────────────────────────

export async function getLiveSuggestion(
  transcript: TranscriptLine[],
  _callerName: string,
): Promise<string> {
  if (IS_DEMO) return getMockSuggestion(transcript);

  const lines = transcript
    .filter((l) => l.speaker !== 'ai')
    .map((l) => `${l.speaker === 'guest' ? 'Guest' : 'Agent'}: ${l.text}`)
    .join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        system:
          'You are an AI assistant helping a hotel agent during a live call. Based on the transcript so far, give ONE concise suggestion (max 20 words) the agent should say or do next. Be practical and guest-focused.',
        messages: [{ role: 'user', content: `Transcript so far:\n${lines}\n\nWhat should the agent do or say next?` }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? 'Stay attentive and listen carefully to the guest.';
  } catch {
    return getMockSuggestion(transcript);
  }
}

// ── Post-call summary ─────────────────────────────────────────────────────────

export async function generateCallSummary(
  transcript: TranscriptLine[],
  callerName: string,
): Promise<{ summary: string; actions: string[] }> {
  if (IS_DEMO) return getMockSummary(callerName);

  const lines = transcript
    .filter((l) => l.speaker !== 'ai')
    .map((l) => `${l.speaker === 'guest' ? 'Guest' : 'Agent'}: ${l.text}`)
    .join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system:
          'You are a hotel operations AI. Summarise the call in 1–2 sentences, then list up to 3 follow-up actions as a JSON object: { "summary": "...", "actions": ["...", "..."] }. Return only valid JSON.',
        messages: [{ role: 'user', content: `Call transcript:\n${lines}` }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    return JSON.parse(text);
  } catch {
    return getMockSummary(callerName);
  }
}

// ── Mock helpers ──────────────────────────────────────────────────────────────

function getMockSuggestion(transcript: TranscriptLine[]): string {
  const last = transcript.filter((l) => l.speaker === 'guest').at(-1)?.text ?? '';
  if (/check.in|early|arrive/i.test(last)) return 'Offer early check-in if available — mention 10:30am slot at no charge.';
  if (/cancel|refund/i.test(last)) return 'Acknowledge empathetically, look up reservation, confirm refund policy.';
  if (/shuttle|transport|taxi/i.test(last)) return 'Quote EUR 35 per ride, ask for flight number to confirm booking.';
  if (/noise|loud|complaint/i.test(last)) return 'Apologise immediately, offer room change or compensation if needed.';
  return 'Listen carefully and confirm details back to the guest before taking action.';
}

function getMockSummary(callerName: string): { summary: string; actions: string[] } {
  return {
    summary: `Call with ${callerName} handled. Issue discussed and resolved by agent.`,
    actions: [
      'Update guest profile with call notes',
      'Follow up by email if action was promised',
    ],
  };
}
