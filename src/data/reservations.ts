/**
 * 200 hotel reservations synthesised from European city-hotel booking
 * distributions (Kaggle Hotel Booking Demand dataset, City Hotel subset).
 *
 * Distribution:
 *  - checked-in  : 23  (rooms 101-110, 201-206, 301-303, 306-307, 309-310)
 *  - confirmed   : 120 (future arrivals, next 30 days)
 *  - checked-out : 37  (past 20 days)
 *  - cancelled   : 14
 *  - no-show     :  6
 *
 * Country distribution mirrors dataset: PRT 28%, GBR 15%, FRA 13%,
 * ESP 10%, DEU 8%, ITA 7%, NLD 5%, BEL 4%, other 10%.
 */

import type { HotelReservation } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(3, '0');
}

function isoDate(baseMs: number, offsetDays: number): string {
  const d = new Date(baseMs + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

function isoDatetime(baseMs: number, offsetDays: number, hour = 14): string {
  const d = new Date(baseMs + offsetDays * 86_400_000);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

// "today" = March 20 2026 (demo anchor)
const TODAY = Date.UTC(2026, 2, 20);        // months are 0-indexed
const PAST  = Date.UTC(2026, 1,  1);        // Feb 1 2026

// Room number pool per type (only available/occupied rooms — see rooms.ts)
const ROOM_BY_TYPE: Record<string, string[]> = {
  Standard:    ['101','102','103','104','105','106','107','108','109','110','111'],
  Supérieure:  ['201','202','203','204','205','206','207','208'],
  Deluxe:      ['301','302','303','304','305'],
  Suite:       ['306','307','308'],
  Familiale:   ['309','310'],
};

// ─── Guest profiles (name / email / phone / country) ──────────────────────────

const GUESTS: Array<{
  name: string; email: string; phone: string; country: string;
}> = [
  // Portuguese
  { name: 'João Silva',         email: 'joao.silva@mail.pt',       phone: '+351 912 345 678', country: 'PRT' },
  { name: 'Ana Santos',         email: 'ana.santos@mail.pt',       phone: '+351 922 345 679', country: 'PRT' },
  { name: 'Miguel Ferreira',    email: 'miguel.f@outlook.pt',      phone: '+351 932 456 780', country: 'PRT' },
  { name: 'Carla Pereira',      email: 'carla.pereira@gmail.com',  phone: '+351 913 567 891', country: 'PRT' },
  { name: 'Pedro Costa',        email: 'pedro.costa@sapo.pt',      phone: '+351 963 678 902', country: 'PRT' },
  { name: 'Inês Oliveira',      email: 'ines.oliveira@mail.pt',    phone: '+351 914 789 013', country: 'PRT' },
  { name: 'Rui Rodrigues',      email: 'rui.rodrigues@gmail.com',  phone: '+351 925 890 124', country: 'PRT' },
  // British
  { name: 'James Whitfield',    email: 'j.whitfield@email.co.uk',  phone: '+44 7700 900 001', country: 'GBR' },
  { name: 'Emma Johnson',       email: 'emma.j@hotmail.co.uk',     phone: '+44 7700 900 002', country: 'GBR' },
  { name: 'Oliver Williams',    email: 'o.williams@gmail.com',     phone: '+44 7700 900 003', country: 'GBR' },
  { name: 'Charlotte Brown',    email: 'c.brown@outlook.com',      phone: '+44 7700 900 004', country: 'GBR' },
  { name: 'William Jones',      email: 'w.jones@email.co.uk',      phone: '+44 7700 900 005', country: 'GBR' },
  { name: 'Amelia Davis',       email: 'amelia.d@gmail.com',       phone: '+44 7700 900 006', country: 'GBR' },
  { name: 'Harry Moore',        email: 'harry.moore@gmail.com',    phone: '+44 7700 900 007', country: 'GBR' },
  // French
  { name: 'Marie Dubois',       email: 'marie.dubois@free.fr',     phone: '+33 6 12 34 56 01', country: 'FRA' },
  { name: 'Pierre Martin',      email: 'p.martin@laposte.net',     phone: '+33 6 23 45 67 02', country: 'FRA' },
  { name: 'Sophie Laurent',     email: 'sophie.l@gmail.com',       phone: '+33 6 34 56 78 03', country: 'FRA' },
  { name: 'Jean-Pierre Moreau', email: 'jp.moreau@orange.fr',      phone: '+33 6 45 67 89 04', country: 'FRA' },
  { name: 'Isabelle Bernard',   email: 'i.bernard@free.fr',        phone: '+33 6 56 78 90 05', country: 'FRA' },
  { name: 'François Petit',     email: 'f.petit@gmail.com',        phone: '+33 6 67 89 01 06', country: 'FRA' },
  // Spanish
  { name: 'Carlos García',      email: 'c.garcia@hotmail.es',      phone: '+34 612 345 601', country: 'ESP' },
  { name: 'Ana Martínez',       email: 'ana.martinez@gmail.com',   phone: '+34 623 456 702', country: 'ESP' },
  { name: 'José Rodríguez',     email: 'jose.r@yahoo.es',          phone: '+34 634 567 803', country: 'ESP' },
  { name: 'María López',        email: 'maria.lopez@outlook.es',   phone: '+34 645 678 904', country: 'ESP' },
  { name: 'Francisco Sánchez',  email: 'f.sanchez@gmail.com',      phone: '+34 656 789 005', country: 'ESP' },
  // German
  { name: 'Hans Müller',        email: 'h.mueller@gmail.de',       phone: '+49 151 2345 6001', country: 'DEU' },
  { name: 'Sabine Schmidt',     email: 'sabine.schmidt@web.de',    phone: '+49 152 3456 7002', country: 'DEU' },
  { name: 'Klaus Fischer',      email: 'k.fischer@t-online.de',    phone: '+49 153 4567 8003', country: 'DEU' },
  { name: 'Monika Weber',       email: 'monika.w@gmx.de',          phone: '+49 160 5678 9004', country: 'DEU' },
  { name: 'Thomas Becker',      email: 't.becker@gmail.com',       phone: '+49 170 6789 0005', country: 'DEU' },
  // Italian
  { name: 'Marco Rossi',        email: 'marco.rossi@gmail.it',     phone: '+39 320 123 4501', country: 'ITA' },
  { name: 'Giulia Ferrari',     email: 'giulia.f@libero.it',       phone: '+39 331 234 5602', country: 'ITA' },
  { name: 'Luca Bianchi',       email: 'l.bianchi@gmail.com',      phone: '+39 342 345 6703', country: 'ITA' },
  { name: 'Valentina Romano',   email: 'v.romano@alice.it',        phone: '+39 353 456 7804', country: 'ITA' },
  // Dutch
  { name: 'Jan de Vries',       email: 'j.devries@gmail.nl',       phone: '+31 6 12345601', country: 'NLD' },
  { name: 'Annemiek Bakker',    email: 'a.bakker@hotmail.nl',      phone: '+31 6 23456702', country: 'NLD' },
  { name: 'Pieter Visser',      email: 'p.visser@gmail.com',       phone: '+31 6 34567803', country: 'NLD' },
  // Belgian
  { name: 'Luc Janssen',        email: 'luc.janssen@hotmail.be',   phone: '+32 471 12 34 01', country: 'BEL' },
  { name: 'Nathalie Dupont',    email: 'n.dupont@skynet.be',       phone: '+32 478 23 45 02', country: 'BEL' },
  // Other EU
  { name: 'Aleksander Nowak',   email: 'a.nowak@gmail.pl',         phone: '+48 601 234 501', country: 'POL' },
  { name: 'Elena Popescu',      email: 'e.popescu@yahoo.ro',       phone: '+40 721 234 502', country: 'ROU' },
];

type RoomTypeName = 'Standard' | 'Supérieure' | 'Deluxe' | 'Suite' | 'Familiale';

const ROOM_TYPES: RoomTypeName[] = ['Standard','Standard','Standard','Standard','Supérieure','Supérieure','Supérieure','Deluxe','Deluxe','Suite','Familiale'];

const CHANNELS: HotelReservation['channel'][] = [
  'Booking.com','Booking.com','Booking.com','Expedia','Expedia','Direct','Direct','WhatsApp','Email','Phone',
];

const MEAL_PLANS: HotelReservation['mealPlan'][] = ['BB','BB','BB','HB','HB','FB','SC'];

const SPECIAL_REQUESTS_POOL = [
  'Non-smoking room please',
  'Extra pillows',
  'High floor preferred',
  'Quiet room away from elevator',
  'Early check-in requested',
  'Late check-out requested',
  'Twin beds instead of double',
  'Allergen-free bedding',
  'Baby cot required',
  'Airport transfer needed',
  'Honeymoon setup please',
  'Anniversary — flowers appreciated',
  'Vegetarian breakfast',
  'Gluten-free meals',
  'Ground floor preferred',
];

type ADRMap = { [K in RoomTypeName]: number };
const BASE_PRICE: ADRMap = {
  Standard:   102,
  Supérieure: 152,
  Deluxe:     225,
  Suite:      395,
  Familiale:  305,
};

// Deterministic pseudo-random seeded by index
function seed(i: number, offset = 0) {
  const x = Math.sin(i * 9301 + offset * 49297 + 233) * 1e9;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], i: number, offset = 0): T {
  return arr[Math.floor(seed(i, offset) * arr.length)];
}

function buildRequests(i: number, totalSpecial: number): string[] {
  const count = Math.min(totalSpecial, 3);
  const result: string[] = [];
  for (let k = 0; k < count; k++) {
    const req = pick(SPECIAL_REQUESTS_POOL, i, k + 1);
    if (!result.includes(req)) result.push(req);
  }
  return result;
}

// ─── Generate 200 reservations ────────────────────────────────────────────────

function generate(): HotelReservation[] {
  const reservations: HotelReservation[] = [];

  for (let i = 0; i < 200; i++) {
    const id = `RES-${pad(i + 1)}`;
    const guest = pick(GUESTS, i);
    const roomType = pick(ROOM_TYPES, i, 1) as RoomTypeName;
    const roomPool = ROOM_BY_TYPE[roomType];
    const roomNumber = roomPool[i % roomPool.length];
    const channel = pick(CHANNELS, i, 2);
    const meal = pick(MEAL_PLANS, i, 3);
    const nights = 1 + Math.floor(seed(i, 4) * 6);    // 1–6 nights
    const guests = 1 + Math.floor(seed(i, 5) * 3);    // 1–3 guests
    const specialCount = Math.floor(seed(i, 6) * 4);  // 0–3
    const repeated = seed(i, 7) < 0.18;               // 18% repeat guests
    const adr = Math.round(BASE_PRICE[roomType] * (0.85 + seed(i, 8) * 0.3));
    const totalPrice = adr * nights;

    let status: HotelReservation['status'];
    let checkIn: string;
    let checkOut: string;
    let amountPaid: number;
    let createdAt: string;

    if (i < 23) {
      // checked-in — currently in house (linked to occupied rooms)
      status = 'checked-in';
      const arrivalOffset = -(Math.floor(seed(i, 9) * 3));  // 0-2 days ago
      checkIn  = isoDate(TODAY, arrivalOffset);
      checkOut = isoDate(TODAY, arrivalOffset + nights);
      amountPaid = totalPrice;
      createdAt = isoDatetime(TODAY, arrivalOffset - 30, 10);
    } else if (i < 143) {
      // confirmed — future arrivals (next 30 days)
      status = 'confirmed';
      const daysAhead = 1 + Math.floor(seed(i, 9) * 29);
      checkIn  = isoDate(TODAY, daysAhead);
      checkOut = isoDate(TODAY, daysAhead + nights);
      amountPaid = seed(i, 10) < 0.4 ? 0 : Math.round(totalPrice * 0.3);  // deposit or none
      createdAt = isoDatetime(TODAY, -Math.floor(seed(i, 11) * 60), 9);
    } else if (i < 180) {
      // checked-out — past stays
      status = 'checked-out';
      const daysAgo = 1 + Math.floor(seed(i, 9) * 19);
      checkIn  = isoDate(PAST, Math.floor(seed(i, 12) * 47));
      checkOut = isoDate(TODAY, -daysAgo);
      amountPaid = totalPrice;
      createdAt = isoDatetime(PAST, Math.floor(seed(i, 13) * 20), 11);
    } else if (i < 194) {
      // cancelled
      status = 'cancelled';
      const daysAhead = 1 + Math.floor(seed(i, 9) * 20);
      checkIn  = isoDate(TODAY, daysAhead);
      checkOut = isoDate(TODAY, daysAhead + nights);
      amountPaid = 0;
      createdAt = isoDatetime(TODAY, -Math.floor(seed(i, 11) * 45), 14);
    } else {
      // no-show
      status = 'no-show';
      const daysAgo = 1 + Math.floor(seed(i, 9) * 10);
      checkIn  = isoDate(TODAY, -daysAgo);
      checkOut = isoDate(TODAY, -daysAgo + nights);
      amountPaid = seed(i, 10) < 0.5 ? totalPrice : 0;
      createdAt = isoDatetime(TODAY, -daysAgo - 30, 10);
    }

    reservations.push({
      id,
      guestName:       guest.name,
      guestEmail:      guest.email,
      guestPhone:      guest.phone,
      guestCountry:    guest.country,
      checkIn,
      checkOut,
      roomType,
      roomNumber,
      status,
      channel,
      totalPrice,
      amountPaid,
      numberOfGuests:  guests,
      mealPlan:        meal,
      specialRequests: buildRequests(i, specialCount),
      isRepeatedGuest: repeated,
      notes:           '',
      createdAt,
    });
  }

  return reservations;
}

export const reservations: HotelReservation[] = generate();
