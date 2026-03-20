/**
 * Extended data types for Hotel Insight.
 * These live in src/data/ and are produced by the mock-data pipeline.
 * They extend or complement the base types in src/types/index.ts.
 */

// ─── Reservations ─────────────────────────────────────────────────────────────

export type BookingChannel =
  | 'Booking.com'
  | 'Expedia'
  | 'Direct'
  | 'WhatsApp'
  | 'Email'
  | 'Phone';

export type BookingStatus =
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled'
  | 'no-show';

export type MealPlan = 'BB' | 'HB' | 'FB' | 'SC';

export interface HotelReservation {
  id: string;                   // "RES-001"
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;         // ISO 3166-1 alpha-3: PRT, GBR, FRA, ESP, DEU, ITA
  checkIn: string;              // ISO date
  checkOut: string;             // ISO date
  roomType: 'Standard' | 'Supérieure' | 'Deluxe' | 'Suite' | 'Familiale';
  roomNumber: string;
  status: BookingStatus;
  channel: BookingChannel;
  totalPrice: number;
  amountPaid: number;
  numberOfGuests: number;
  mealPlan: MealPlan;
  specialRequests: string[];
  isRepeatedGuest: boolean;
  notes: string;
  createdAt: string;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export type RoomType = 'Standard' | 'Supérieure' | 'Deluxe' | 'Suite' | 'Familiale';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

export interface HotelRoom {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  maxOccupancy: number;
  basePrice: number;
  amenities: string[];
  currentGuest?: string;        // reservation ID if occupied
}

// ─── Guest Messages ───────────────────────────────────────────────────────────

export type MessageChannel = 'Email' | 'Booking.com' | 'WhatsApp';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageLanguage = 'fr' | 'en' | 'de' | 'es' | 'pt';
export type MessageCategory =
  | 'reservation'
  | 'cancellation'
  | 'refund'
  | 'information'
  | 'complaint'
  | 'maintenance'
  | 'modification'
  | 'compliment';
export type MessageUrgency = 'high' | 'medium' | 'low';
export type MessageStatus =
  | 'unread'
  | 'read'
  | 'ai-reply-ready'
  | 'replied'
  | 'auto-resolved';

export interface GuestMessage {
  id: string;                   // "MSG-001"
  conversationId: string;       // groups messages into threads
  reservationId?: string;
  guestName: string;
  channel: MessageChannel;
  direction: MessageDirection;
  timestamp: string;
  subject?: string;
  messageText: string;
  language: MessageLanguage;
  category: MessageCategory;
  urgency: MessageUrgency;
  status: MessageStatus;
  aiSuggestedReply?: string;
}

// ─── Operational Tasks ────────────────────────────────────────────────────────

export type TaskCategoryExt = 'maintenance' | 'housekeeping' | 'front-desk' | 'other';
export type TaskPriorityExt = 'urgent' | 'normal' | 'low';
export type TaskStatusExt = 'todo' | 'in-progress' | 'done';
export type TaskSourceExt = 'guest-request' | 'scheduled' | 'manual' | 'ai-detected';

export interface OperationalTask {
  id: string;                   // "TASK-001"
  title: string;
  description: string;
  category: TaskCategoryExt;
  priority: TaskPriorityExt;
  status: TaskStatusExt;
  assignedTo?: string;
  roomNumber?: string;
  sourceType: TaskSourceExt;
  sourceMessageId?: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
}

// ─── Competitor / Intelligence ────────────────────────────────────────────────

export interface CompetitorPricing {
  standardPrice: number;
  superieurePrice: number;
  deluxePrice: number;
  suitePrice: number;
  famillePrice: number;
}

export interface CompetitorServices {
  wifi: boolean;
  breakfast: number;            // 0 = not included, else price in €
  parking: number;              // 0 = not available, else price in €/night
  pool: boolean;
  spa: number;                  // 0 = no spa, else day-pass price
}

export interface CompetitorData {
  id: string;
  hotelName: string;
  stars: number;
  location: string;
  rating: number;               // 1–5
  reviewCount: number;
  pricing: CompetitorPricing;
  services: CompetitorServices;
  occupancy: number;            // 0–100 %
}

// ─── Forecast / Trend ─────────────────────────────────────────────────────────

export interface PriceTrendPoint {
  month: string;                // "Jan 2026"
  ownHotel: number;
  competitorAvg: number;
}

export interface OccupancyForecastPoint {
  month: string;
  actual?: number;
  forecast: number;
}

export interface RevenueForecastPoint {
  month: string;
  actual?: number;
  forecast: number;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export type ReviewSentiment = 'positive' | 'neutral' | 'negative';
export type ReviewPlatform = 'Booking.com' | 'TripAdvisor' | 'Google' | 'Expedia';

export interface GuestReview {
  id: string;
  guestName: string;
  platform: ReviewPlatform;
  rating: number;               // 1–5
  comment: string;
  language: MessageLanguage;
  date: string;
  sentiment: ReviewSentiment;
  responded: boolean;
  managementReply?: string;
}

export interface PlatformRatingAggregate {
  platform: ReviewPlatform;
  avgRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export type StaffRole = 'manager' | 'receptionist' | 'housekeeper' | 'maintenance' | 'porter';

export interface StaffMember {
  id: string;                   // "STF-001"
  name: string;
  role: StaffRole;
  initials: string;
  isOnDuty: boolean;
  phone: string;
  email: string;
  shift?: 'morning' | 'afternoon' | 'night';
}
