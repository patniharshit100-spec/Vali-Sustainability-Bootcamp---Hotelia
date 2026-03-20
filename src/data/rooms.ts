/**
 * 30-room inventory for The Grand Horizon.
 * Layout: 3 floors — Standard (101–112), Supérieure (201–208),
 * Deluxe/Suite/Familiale (301–310).
 * 23/30 rooms occupied → 76.7% occupancy (dashboard KPI: 78%).
 */
import type { HotelRoom } from './types';

const STD_AMENITIES = ['Wi-Fi', 'Air conditioning', 'Flat-screen TV', 'Safe', 'Minibar', 'Tea/coffee maker'];
const SUP_AMENITIES = [...STD_AMENITIES, 'Bathrobe & slippers', 'Rain shower', 'Seating area'];
const DEL_AMENITIES = [...SUP_AMENITIES, 'Nespresso machine', 'Premium toiletries', 'City view balcony'];
const SUI_AMENITIES = [...DEL_AMENITIES, 'Separate living room', 'Jacuzzi', 'Pillow menu', 'Butler service'];
const FAM_AMENITIES = [...SUP_AMENITIES, 'Bunk beds', 'Children welcome kit', 'Extra bathroom'];

export const rooms: HotelRoom[] = [
  // ── Floor 1: Standard ────────────────────────────────────────────────────
  { id: 'R-101', number: '101', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-001' },
  { id: 'R-102', number: '102', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-002' },
  { id: 'R-103', number: '103', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-003' },
  { id: 'R-104', number: '104', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-004' },
  { id: 'R-105', number: '105', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 105, amenities: STD_AMENITIES, currentGuest: 'RES-005' },
  { id: 'R-106', number: '106', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 105, amenities: STD_AMENITIES, currentGuest: 'RES-006' },
  { id: 'R-107', number: '107', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-007' },
  { id: 'R-108', number: '108', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-008' },
  { id: 'R-109', number: '109', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 105, amenities: STD_AMENITIES, currentGuest: 'RES-009' },
  { id: 'R-110', number: '110', floor: 1, type: 'Standard',   status: 'occupied',     maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES, currentGuest: 'RES-010' },
  { id: 'R-111', number: '111', floor: 1, type: 'Standard',   status: 'available',    maxOccupancy: 2, basePrice: 105, amenities: STD_AMENITIES },
  { id: 'R-112', number: '112', floor: 1, type: 'Standard',   status: 'maintenance',  maxOccupancy: 2, basePrice: 99,  amenities: STD_AMENITIES },

  // ── Floor 2: Supérieure ───────────────────────────────────────────────────
  { id: 'R-201', number: '201', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 2, basePrice: 145, amenities: SUP_AMENITIES, currentGuest: 'RES-011' },
  { id: 'R-202', number: '202', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 2, basePrice: 145, amenities: SUP_AMENITIES, currentGuest: 'RES-012' },
  { id: 'R-203', number: '203', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 2, basePrice: 155, amenities: SUP_AMENITIES, currentGuest: 'RES-013' },
  { id: 'R-204', number: '204', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 2, basePrice: 155, amenities: SUP_AMENITIES, currentGuest: 'RES-014' },
  { id: 'R-205', number: '205', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 3, basePrice: 165, amenities: SUP_AMENITIES, currentGuest: 'RES-015' },
  { id: 'R-206', number: '206', floor: 2, type: 'Supérieure', status: 'occupied',     maxOccupancy: 2, basePrice: 145, amenities: SUP_AMENITIES, currentGuest: 'RES-016' },
  { id: 'R-207', number: '207', floor: 2, type: 'Supérieure', status: 'cleaning',     maxOccupancy: 2, basePrice: 155, amenities: SUP_AMENITIES },
  { id: 'R-208', number: '208', floor: 2, type: 'Supérieure', status: 'available',    maxOccupancy: 2, basePrice: 165, amenities: SUP_AMENITIES },

  // ── Floor 3: Deluxe ───────────────────────────────────────────────────────
  { id: 'R-301', number: '301', floor: 3, type: 'Deluxe',     status: 'occupied',     maxOccupancy: 2, basePrice: 215, amenities: DEL_AMENITIES, currentGuest: 'RES-017' },
  { id: 'R-302', number: '302', floor: 3, type: 'Deluxe',     status: 'occupied',     maxOccupancy: 2, basePrice: 215, amenities: DEL_AMENITIES, currentGuest: 'RES-018' },
  { id: 'R-303', number: '303', floor: 3, type: 'Deluxe',     status: 'occupied',     maxOccupancy: 2, basePrice: 235, amenities: DEL_AMENITIES, currentGuest: 'RES-019' },
  { id: 'R-304', number: '304', floor: 3, type: 'Deluxe',     status: 'available',    maxOccupancy: 2, basePrice: 235, amenities: DEL_AMENITIES },
  { id: 'R-305', number: '305', floor: 3, type: 'Deluxe',     status: 'available',    maxOccupancy: 2, basePrice: 245, amenities: DEL_AMENITIES },

  // ── Floor 3: Suite ────────────────────────────────────────────────────────
  { id: 'R-306', number: '306', floor: 3, type: 'Suite',      status: 'occupied',     maxOccupancy: 3, basePrice: 380, amenities: SUI_AMENITIES, currentGuest: 'RES-020' },
  { id: 'R-307', number: '307', floor: 3, type: 'Suite',      status: 'occupied',     maxOccupancy: 3, basePrice: 420, amenities: SUI_AMENITIES, currentGuest: 'RES-021' },
  { id: 'R-308', number: '308', floor: 3, type: 'Suite',      status: 'available',    maxOccupancy: 3, basePrice: 450, amenities: SUI_AMENITIES },

  // ── Floor 3: Familiale ────────────────────────────────────────────────────
  { id: 'R-309', number: '309', floor: 3, type: 'Familiale',  status: 'occupied',     maxOccupancy: 5, basePrice: 295, amenities: FAM_AMENITIES, currentGuest: 'RES-022' },
  { id: 'R-310', number: '310', floor: 3, type: 'Familiale',  status: 'occupied',     maxOccupancy: 5, basePrice: 315, amenities: FAM_AMENITIES, currentGuest: 'RES-023' },
];
