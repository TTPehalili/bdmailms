/**
 * Server-only Trouble Ticket File Persistence Layer
 */

import fs from 'fs';
import path from 'path';
import { TroubleTicket, INITIAL_SEED_TICKETS } from '@/lib/ticketTypes';

export * from '@/lib/ticketTypes';

const TICKETS_STORE_FILE = path.join(process.cwd(), '.tickets.json');

/**
 * Server-side: Read tickets from .tickets.json file (falls back to seed tickets)
 */
export function readStoredTicketsServer(): TroubleTicket[] {
  try {
    if (!fs.existsSync(TICKETS_STORE_FILE)) {
      fs.writeFileSync(TICKETS_STORE_FILE, JSON.stringify(INITIAL_SEED_TICKETS, null, 2), 'utf-8');
      return INITIAL_SEED_TICKETS;
    }
    const raw = fs.readFileSync(TICKETS_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      fs.writeFileSync(TICKETS_STORE_FILE, JSON.stringify(INITIAL_SEED_TICKETS, null, 2), 'utf-8');
      return INITIAL_SEED_TICKETS;
    }
    return parsed;
  } catch (err) {
    console.warn('[TicketStore] Failed to read .tickets.json:', err);
    return INITIAL_SEED_TICKETS;
  }
}

/**
 * Server-side: Write tickets to .tickets.json file
 */
export function writeStoredTicketsServer(tickets: TroubleTicket[]): void {
  try {
    fs.writeFileSync(TICKETS_STORE_FILE, JSON.stringify(tickets, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TicketStore] Failed to write .tickets.json:', err);
  }
}
