/**
 * AI Service Layer — Hotel Insight
 *
 * Wraps the Anthropic API for four hotel-specific capabilities:
 *  1. classifyMessage   — intent, urgency, department, language
 *  2. generateReply     — drafted staff reply in the guest's language
 *  3. generateReviewResponse — professional response to a review
 *  4. extractTask       — structured task object from a maintenance/housekeeping message
 *
 * Mock mode: automatically engaged when VITE_ANTHROPIC_API_KEY is absent
 * or equals "demo". Safe for demos without leaking keys.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { TaskCategory, TaskPriority } from '../types';

// ─── Model ────────────────────────────────────────────────────────────────────

const MODEL = 'claude-sonnet-4-20250514';

// ─── Runtime config ───────────────────────────────────────────────────────────

const API_KEY: string = (import.meta as ImportMeta & { env: Record<string, string> }).env
  ?.VITE_ANTHROPIC_API_KEY ?? '';

export const isMockMode = !API_KEY || API_KEY === 'demo';

// Lazy singleton — only constructed when real API calls are needed
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }
  return _client;
}

// ─── Hotel context / System prompt ───────────────────────────────────────────

const HOTEL_SYSTEM_PROMPT = `\
You are the AI assistant for The Grand Horizon, a 4-star boutique hotel in Miami Beach, FL.
Your role is to help hotel staff respond to guests, classify inquiries, generate professional
replies, and manage operations efficiently.

HOTEL INFORMATION:
- Name: The Grand Horizon | Location: Miami Beach, FL | Rating: 4-star boutique
- Front Desk: Open 24/7 | General Manager: Maria Santos

FREQUENTLY ASKED QUESTIONS:
Check-in / Check-out:
  • Standard check-in: 14:00 (2:00 PM)
  • Early check-in: Available subject to room availability, no extra charge if room is ready
  • Standard check-out: 11:00 (11:00 AM)
  • Late check-out: Until 13:00 (1:00 PM) subject to occupancy, confirm at reception

Amenities:
  • Parking: On-site at $15/night, reservable in advance
  • Breakfast: Daily 7:00–10:00 AM, Grand Dining Room (ground floor), included in most rates
  • Pool: Outdoor heated pool, 8:00 AM–10:00 PM, poolside towels provided
  • Wi-Fi: Complimentary throughout hotel (password in welcome packet or at front desk)
  • Fitness Center: 24/7 access with room key
  • Room Service: Available 6:00 AM–11:00 PM

Transportation:
  • Airport Shuttle: $25/person, book 24 hours in advance
  • Taxi/Ride-share: Available on request from front desk
  • Beach Access: Direct, complimentary chairs and umbrellas

Policies:
  • Cancellation: 24 hours before arrival (non-refundable rates cannot be cancelled)
  • Pets: Not permitted
  • Smoking: Non-smoking property, outdoor designated areas only
  • Minimum check-in age: 18

TONE GUIDELINES:
  • Professional yet warm — never robotic, never overly casual
  • Concise: 2–4 sentences, no filler phrases ("certainly!", "of course!")
  • Always respond in the guest's detected language
  • Use the guest's name when known
  • Offer a concrete next step or resolution
  • Never over-promise; use "subject to availability" for requests we can't guarantee
  • For complaints: acknowledge → apologise sincerely → offer concrete resolution
  • For maintenance: express urgency, give realistic timeframe

RESPONSE TEMPLATES:
  Early check-in:   "Thank you for letting us know, [Name]! We'll do our best to have your room ready
                     early — we'll message you as soon as it's available."
  Late check-out:   "We'd be happy to arrange a late check-out until 1:00 PM for you, [Name], subject
                     to occupancy. We'll confirm by 9:00 AM on your check-out date."
  Complaint:        "We sincerely apologise for the inconvenience, [Name]. This is not the experience
                     we want for our guests. [Concrete resolution step]."
  Maintenance:      "We're sorry to hear about this, [Name]. Our team will attend to it within
                     [timeframe]. Thank you for your patience."
`;

// ─── Return types ─────────────────────────────────────────────────────────────

export type MessageIntent =
  | 'reservation'
  | 'cancellation'
  | 'refund'
  | 'information'
  | 'complaint'
  | 'maintenance';

export type UrgencyLevel = 'high' | 'medium' | 'low';
export type SuggestedDepartment = 'front_desk' | 'housekeeping' | 'maintenance' | 'management';

export interface MessageClassification {
  intent: MessageIntent;
  urgency: UrgencyLevel;
  suggested_department: SuggestedDepartment;
  language: string;          // BCP-47 tag, e.g. "en", "fr", "de"
  language_name: string;     // Human-readable, e.g. "English", "French"
  confidence: number;        // 0–1
  reasoning: string;         // One-sentence explanation
}

export interface GeneratedReply {
  reply: string;
  tone: string;              // "formal" | "warm" | "apologetic" | "informational"
  notes: string;             // Optional staff notes (e.g. "verify room availability first")
}

export interface ReviewResponseResult {
  response: string;          // The public-facing review response text
  key_points_addressed: string[];
}

export interface ExtractedTask {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  suggested_room?: string;
  suggested_assignee?: string;  // e.g. "maintenance team"
}

// ─── Helper: force tool-use call ─────────────────────────────────────────────

async function callWithTool<T>(
  toolName: string,
  toolDescription: string,
  inputSchema: Anthropic.Tool['input_schema'],
  userMessage: string,
  extraSystem?: string,
): Promise<T> {
  const client = getClient();

  const system = extraSystem
    ? `${HOTEL_SYSTEM_PROMPT}\n\n${extraSystem}`
    : HOTEL_SYSTEM_PROMPT;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    tools: [{ name: toolName, description: toolDescription, input_schema: inputSchema }],
    tool_choice: { type: 'tool', name: toolName },
    messages: [{ role: 'user', content: userMessage }],
  });

  // The forced tool call is always the first content block
  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === toolName) {
      return block.input as T;
    }
  }

  throw new Error(`Expected tool_use block "${toolName}" in response`);
}

// ─── 1. Message Classification ────────────────────────────────────────────────

export async function classifyMessage(
  guestMessage: string,
): Promise<MessageClassification> {
  if (isMockMode) return mockClassifyMessage(guestMessage);

  return callWithTool<MessageClassification>(
    'classify_guest_message',
    'Classify a hotel guest message by intent, urgency, department, and language.',
    {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          enum: ['reservation', 'cancellation', 'refund', 'information', 'complaint', 'maintenance'],
          description: 'The primary intent of the guest message.',
        },
        urgency: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Urgency: high = requires immediate action, medium = today, low = can wait.',
        },
        suggested_department: {
          type: 'string',
          enum: ['front_desk', 'housekeeping', 'maintenance', 'management'],
          description: 'Which hotel department should handle this.',
        },
        language: {
          type: 'string',
          description: 'BCP-47 language tag of the message (e.g. "en", "fr", "de", "es").',
        },
        language_name: {
          type: 'string',
          description: 'Human-readable language name (e.g. "English", "French").',
        },
        confidence: {
          type: 'number',
          description: 'Classification confidence score from 0.0 to 1.0.',
        },
        reasoning: {
          type: 'string',
          description: 'One sentence explaining the classification.',
        },
      },
      required: ['intent', 'urgency', 'suggested_department', 'language', 'language_name', 'confidence', 'reasoning'],
    },
    `Classify the following guest message:\n\n"${guestMessage}"`,
  );
}

// ─── 2. Reply Generation ──────────────────────────────────────────────────────

export interface GenerateReplyInput {
  guestMessage: string;
  conversationHistory?: Array<{ role: 'guest' | 'staff'; content: string }>;
  guestName?: string;
}

export async function generateReply(input: GenerateReplyInput): Promise<GeneratedReply> {
  if (isMockMode) return mockGenerateReply(input);

  const historyBlock = input.conversationHistory?.length
    ? `\nCONVERSATION HISTORY (oldest first):\n${input.conversationHistory
        .map((m) => `  ${m.role === 'guest' ? 'Guest' : 'Hotel'}: ${m.content}`)
        .join('\n')}\n`
    : '';

  const guestLabel = input.guestName ? `Guest name: ${input.guestName}\n` : '';

  return callWithTool<GeneratedReply>(
    'generate_staff_reply',
    'Draft a professional, warm hotel staff reply to a guest message.',
    {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description: 'The full reply text, in the guest\'s language, matching hotel tone guidelines.',
        },
        tone: {
          type: 'string',
          enum: ['formal', 'warm', 'apologetic', 'informational'],
          description: 'The tone of the drafted reply.',
        },
        notes: {
          type: 'string',
          description: 'Optional staff note (e.g. "check room availability before sending").',
        },
      },
      required: ['reply', 'tone', 'notes'],
    },
    `${guestLabel}${historyBlock}New guest message to reply to:\n\n"${input.guestMessage}"`,
  );
}

// ─── 3. Review Response ───────────────────────────────────────────────────────

export interface ReviewResponseInput {
  reviewText: string;
  rating: number;       // 1–5
  platform: string;     // e.g. "TripAdvisor", "Booking.com"
  guestName?: string;
}

export async function generateReviewResponse(
  input: ReviewResponseInput,
): Promise<ReviewResponseResult> {
  if (isMockMode) return mockGenerateReviewResponse(input);

  return callWithTool<ReviewResponseResult>(
    'generate_review_response',
    'Generate a professional public response to a guest review.',
    {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          description: 'The full public-facing review response text.',
        },
        key_points_addressed: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of feedback points explicitly acknowledged in the response.',
        },
      },
      required: ['response', 'key_points_addressed'],
    },
    `Platform: ${input.platform}
Rating: ${input.rating}/5 stars
${input.guestName ? `Guest name: ${input.guestName}` : ''}

Review text:
"${input.reviewText}"

Write a professional, warm response on behalf of The Grand Horizon. Thank the guest, address their points, and invite them back.`,
  );
}

// ─── 4. Task Extraction ───────────────────────────────────────────────────────

export async function extractTask(guestMessage: string): Promise<ExtractedTask> {
  if (isMockMode) return mockExtractTask(guestMessage);

  return callWithTool<ExtractedTask>(
    'extract_maintenance_task',
    'Extract a structured operations task from a guest message about maintenance or housekeeping.',
    {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Short task title (max 60 chars), e.g. "Fix broken AC in Room 204".',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what needs to be done and why.',
        },
        category: {
          type: 'string',
          enum: ['maintenance', 'housekeeping', 'front_desk', 'food_beverage', 'concierge'],
          description: 'Operations category for routing.',
        },
        priority: {
          type: 'string',
          enum: ['urgent', 'high', 'medium', 'low'],
          description: 'Task priority: urgent = safety/comfort impact now, high = today, medium = this week.',
        },
        suggested_room: {
          type: 'string',
          description: 'Room number if mentioned in the message.',
        },
        suggested_assignee: {
          type: 'string',
          description: 'Suggested team to assign to (e.g. "maintenance team", "housekeeping").',
        },
      },
      required: ['title', 'description', 'category', 'priority'],
    },
    `Extract a task from this guest message:\n\n"${guestMessage}"`,
  );
}

// ─── Mock implementations ─────────────────────────────────────────────────────
// Realistic mock responses for demos without API keys.
// Keyword-aware to feel dynamic.

function mockClassifyMessage(msg: string): MessageClassification {
  const lower = msg.toLowerCase();

  let intent: MessageIntent = 'information';
  let urgency: UrgencyLevel = 'low';
  let dept: SuggestedDepartment = 'front_desk';
  let reasoning = 'General information request from guest.';

  if (/\b(ac|air.?cond|heating|broken|leak|flood|smell|noise|wifi|tv|light|toilet|shower|door|lock)\b/.test(lower)) {
    intent = 'maintenance';
    urgency = /\b(broken|flood|leak|no heat|no ac|no hot water)\b/.test(lower) ? 'high' : 'medium';
    dept = 'maintenance';
    reasoning = 'Message describes a physical room issue requiring maintenance.';
  } else if (/\b(clean|towel|linen|bed|pillow|trash|garbage|dirty)\b/.test(lower)) {
    intent = 'maintenance';
    urgency = 'medium';
    dept = 'housekeeping';
    reasoning = 'Message requests housekeeping service or supplies.';
  } else if (/\b(cancel|cancell?ation)\b/.test(lower)) {
    intent = 'cancellation';
    urgency = 'high';
    dept = 'front_desk';
    reasoning = 'Guest is requesting to cancel their booking.';
  } else if (/\b(refund|charge|bill|invoice|payment)\b/.test(lower)) {
    intent = 'refund';
    urgency = 'medium';
    dept = 'management';
    reasoning = 'Guest has a billing or refund concern.';
  } else if (/\b(terrible|horrible|unacceptable|disgusting|worst|disappointed|awful|rude|complaint)\b/.test(lower)) {
    intent = 'complaint';
    urgency = 'high';
    dept = 'management';
    reasoning = 'Message contains strong negative language indicating a complaint.';
  } else if (/\b(book|reserv|room|availab|check.in|check.out|price|rate)\b/.test(lower)) {
    intent = 'reservation';
    urgency = 'medium';
    dept = 'front_desk';
    reasoning = 'Guest is asking about or making a reservation.';
  }

  // Naive language detection
  let language = 'en';
  let language_name = 'English';
  if (/[àâæçéèêëîïôœùûü]/i.test(msg)) { language = 'fr'; language_name = 'French'; }
  else if (/[äöüß]/i.test(msg)) { language = 'de'; language_name = 'German'; }
  else if (/[áéíóúüñ]/i.test(msg)) { language = 'es'; language_name = 'Spanish'; }

  return { intent, urgency, suggested_department: dept, language, language_name, confidence: 0.87, reasoning };
}

function mockGenerateReply(input: GenerateReplyInput): GeneratedReply {
  const lower = input.guestMessage.toLowerCase();
  const name = input.guestName ? `, ${input.guestName}` : '';

  if (/\b(ac|air.?cond|hot|cold|heating|temperature)\b/.test(lower)) {
    return {
      reply: `We're so sorry to hear your room temperature isn't comfortable${name}. Our maintenance team will be with you within 30 minutes to resolve this. Thank you for letting us know — your comfort is our priority.`,
      tone: 'apologetic',
      notes: 'Dispatch maintenance team immediately. Follow up within 15 minutes if no technician is available.',
    };
  }
  if (/\b(check.in|early|arrive|arrival)\b/.test(lower)) {
    return {
      reply: `Thank you for letting us know${name}! We'll do our best to have your room ready early — we'll send you a message as soon as it's available. If you arrive before it's ready, you're welcome to store your luggage with us and enjoy our pool and breakfast in the meantime.`,
      tone: 'warm',
      notes: "Check room availability at 7 AM on the day. Mark as 'early check-in' in PMS.",
    };
  }
  if (/\b(cancel)\b/.test(lower)) {
    return {
      reply: `We've received your cancellation request${name}. Please note our 24-hour cancellation policy applies. We'll send a confirmation email shortly. We hope to welcome you to The Grand Horizon on another occasion.`,
      tone: 'formal',
      notes: 'Verify rate plan cancellation policy in PMS before processing.',
    };
  }
  if (/\b(parking|car|vehicle)\b/.test(lower)) {
    return {
      reply: `Great news${name} — we have on-site parking available at $15 per night. You can reserve a space in advance by replying to this message. Our team will have everything ready for your arrival.`,
      tone: 'informational',
      notes: 'Confirm parking availability for the dates in PMS before replying.',
    };
  }
  // Generic reply
  return {
    reply: `Thank you for your message${name}. Our front desk team is looking into your request and will have an answer for you within the hour. We appreciate your patience and look forward to making your stay exceptional.`,
    tone: 'warm',
    notes: 'Review guest request and follow up personally within 60 minutes.',
  };
}

function mockGenerateReviewResponse(input: ReviewResponseInput): ReviewResponseResult {
  const name = input.guestName ? ` ${input.guestName}` : '';
  const lower = input.reviewText.toLowerCase();

  if (input.rating >= 4) {
    return {
      response: `Dear${name}, thank you so much for taking the time to share your experience at The Grand Horizon! We're thrilled you enjoyed your stay and we'll be sure to share your kind words with our team. We look forward to welcoming you back to Miami Beach very soon.`,
      key_points_addressed: ['Positive experience acknowledged', 'Team recognition', 'Invitation to return'],
    };
  }
  if (input.rating <= 2) {
    const issues: string[] = [];
    if (/\b(room|clean|dirty)\b/.test(lower)) issues.push('Room cleanliness');
    if (/\b(staff|rude|service)\b/.test(lower)) issues.push('Staff service');
    if (/\b(noise|loud)\b/.test(lower)) issues.push('Noise disturbance');
    if (issues.length === 0) issues.push('Overall experience concerns');

    return {
      response: `Dear${name}, thank you for sharing your feedback. We're truly sorry your stay did not meet the standard we hold ourselves to. Your comments have been shared with our leadership team and we are taking immediate steps to address the concerns you raised. We would love the opportunity to make this right — please contact us directly at guestservices@grandhorizon.com. We hope to restore your confidence in us.`,
      key_points_addressed: [...issues, 'Management follow-up', 'Direct contact offered'],
    };
  }
  return {
    response: `Dear${name}, thank you for your feedback and for staying with us. We're glad there were aspects of your visit you enjoyed, and we take your constructive comments seriously. Our team is committed to continuous improvement and your insights help us get there. We hope to welcome you back and deliver an even better experience.`,
    key_points_addressed: ['Mixed feedback acknowledged', 'Improvement commitment', 'Return invitation'],
  };
}

function mockExtractTask(msg: string): ExtractedTask {
  const lower = msg.toLowerCase();

  // Detect room number
  const roomMatch = msg.match(/\b(?:room|rm\.?)\s*(\d{2,4})\b/i) ?? msg.match(/\b(\d{3})\b/);
  const suggested_room = roomMatch?.[1];
  const roomLabel = suggested_room ? ` in Room ${suggested_room}` : '';

  if (/\b(ac|air.?cond|heating|heat|temperature|hot|cold)\b/.test(lower)) {
    return {
      title: `AC / Heating Issue${roomLabel}`,
      description: `Guest reported an HVAC comfort issue${roomLabel}. Technician should inspect and adjust the unit. Guest message: "${msg.slice(0, 150)}${msg.length > 150 ? '…' : ''}"`,
      category: 'maintenance',
      priority: 'urgent',
      suggested_room,
      suggested_assignee: 'maintenance team',
    };
  }
  if (/\b(leak|flood|water|toilet|shower|tap|faucet|pipe|drain)\b/.test(lower)) {
    return {
      title: `Plumbing Issue${roomLabel}`,
      description: `Guest reported a water/plumbing problem${roomLabel}. Inspect immediately to prevent water damage. Guest message: "${msg.slice(0, 150)}${msg.length > 150 ? '…' : ''}"`,
      category: 'maintenance',
      priority: 'urgent',
      suggested_room,
      suggested_assignee: 'maintenance team',
    };
  }
  if (/\b(tv|television|remote|channel|screen)\b/.test(lower)) {
    return {
      title: `TV / Entertainment Issue${roomLabel}`,
      description: `Guest has a TV or remote control issue${roomLabel}. Check device and replace remote if needed.`,
      category: 'maintenance',
      priority: 'medium',
      suggested_room,
      suggested_assignee: 'maintenance team',
    };
  }
  if (/\b(clean|towel|linen|sheet|bed|pillow|trash|garbage|minibar|amenit)\b/.test(lower)) {
    return {
      title: `Housekeeping Request${roomLabel}`,
      description: `Guest has requested housekeeping service or additional supplies${roomLabel}. Guest message: "${msg.slice(0, 150)}${msg.length > 150 ? '…' : ''}"`,
      category: 'housekeeping',
      priority: 'medium',
      suggested_room,
      suggested_assignee: 'housekeeping',
    };
  }
  if (/\b(wifi|wi-fi|internet|connection|network)\b/.test(lower)) {
    return {
      title: `Wi-Fi Connectivity Issue${roomLabel}`,
      description: `Guest is experiencing internet connectivity problems${roomLabel}. Check router/access point and provide password.`,
      category: 'maintenance',
      priority: 'high',
      suggested_room,
      suggested_assignee: 'maintenance team',
    };
  }
  // Generic fallback
  return {
    title: `Guest Issue${roomLabel}`,
    description: `Task created from guest message${roomLabel}: "${msg.slice(0, 200)}${msg.length > 200 ? '…' : ''}"`,
    category: 'maintenance',
    priority: 'medium',
    suggested_room,
    suggested_assignee: 'front desk',
  };
}
