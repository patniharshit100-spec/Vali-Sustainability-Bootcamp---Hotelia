// vapiService.ts — Voice / Whisper transcription simulation
// In production this would connect to a Whisper ASR endpoint or VAPI.ai.
// For the prototype it simulates real-time transcription with mock utterances.

import { useCallStore } from '../stores/callStore';
import { getLiveSuggestion } from './callAI';

let transcriptionInterval: ReturnType<typeof setInterval> | null = null;

// Sample guest utterances per second offset — simulates Whisper streaming
const MOCK_UTTERANCES: { speaker: 'guest' | 'agent'; text: string; at: number }[] = [
  { speaker: 'agent', text: 'Good morning, The Grand Horizon. How can I help you today?', at: 2 },
  { speaker: 'guest', text: "Hi, I'd like to confirm my reservation for this weekend please.", at: 6 },
  { speaker: 'agent', text: 'Of course! Could I have your name and booking reference?', at: 11 },
  { speaker: 'guest', text: "Sure, it's under John Baxter. Booking reference HG-20482.", at: 16 },
  { speaker: 'agent', text: "Got it. Let me pull that up for you now.", at: 21 },
  { speaker: 'guest', text: "Also, is there any parking available at the hotel?", at: 30 },
  { speaker: 'agent', text: "Yes, we have valet parking at EUR 25 per night.", at: 35 },
  { speaker: 'guest', text: "Perfect, I'll take that. And is breakfast included?", at: 42 },
  { speaker: 'agent', text: "Your package includes daily continental breakfast for two.", at: 47 },
  { speaker: 'guest', text: "Great, that's everything. Thank you!", at: 53 },
];

export function startTranscription(callerName: string): void {
  const store = useCallStore.getState();
  let elapsed = 0;
  let utteranceIndex = 0;

  transcriptionInterval = setInterval(async () => {
    elapsed += 1;

    // Fire next mock utterance if its time has come
    while (
      utteranceIndex < MOCK_UTTERANCES.length &&
      MOCK_UTTERANCES[utteranceIndex].at <= elapsed
    ) {
      const u = MOCK_UTTERANCES[utteranceIndex];
      store.addTranscriptLine(u.speaker, u.text);
      utteranceIndex++;

      // Fetch AI suggestion after each guest utterance
      if (u.speaker === 'guest') {
        const transcript = useCallStore.getState().activeCall?.transcript ?? [];
        const suggestion = await getLiveSuggestion(transcript, callerName);
        useCallStore.getState().setAiSuggestion(suggestion);
      }
    }

    // Stop auto-simulation after all utterances played
    if (utteranceIndex >= MOCK_UTTERANCES.length) {
      stopTranscription();
    }
  }, 1000);
}

export function stopTranscription(): void {
  if (transcriptionInterval !== null) {
    clearInterval(transcriptionInterval);
    transcriptionInterval = null;
  }
}

// Format seconds → mm:ss
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
