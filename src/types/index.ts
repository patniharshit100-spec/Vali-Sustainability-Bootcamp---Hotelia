// Navigation
export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
};

// Inbox / Messages
export type MessageSource = 'email' | 'whatsapp' | 'booking' | 'expedia' | 'tripadvisor' | 'google';

export type Message = {
  id: string;
  guestName: string;
  guestAvatar?: string;
  source: MessageSource;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isUrgent: boolean;
  tags: string[];
  aiSuggested?: string;
};

// Conversations
export type ConversationStatus = 'open' | 'resolved' | 'pending';

export type ChatMessage = {
  id: string;
  sender: 'guest' | 'staff' | 'ai';
  senderName: string;
  content: string;
  timestamp: string;
};

export type Conversation = {
  id: string;
  guestName: string;
  guestAvatar?: string;
  status: ConversationStatus;
  channel: MessageSource;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
  unreadCount: number;
};

// Operations / Tasks
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'housekeeping' | 'maintenance' | 'front_desk' | 'food_beverage' | 'concierge';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  assignedTo: string;
  roomNumber?: string;
  dueTime?: string;
  createdAt: string;
};

// Intelligence / KPIs
export type KPI = {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down' | 'flat';
};

export type Review = {
  id: string;
  guestName: string;
  platform: string;
  rating: number;
  comment: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  responded: boolean;
};

export type Competitor = {
  id: string;
  name: string;
  stars: number;
  avgRate: number;
  occupancy: number;
  reviewScore: number;
};

// Reservations
export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';

export type Reservation = {
  id: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  status: ReservationStatus;
  source: string;
  specialRequests?: string;
};

// Hotel / App State
export type Hotel = {
  id: string;
  name: string;
  stars: number;
  location: string;
  logoUrl?: string;
};

export type User = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  initials: string;
};
