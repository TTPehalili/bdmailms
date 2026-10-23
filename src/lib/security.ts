import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter
const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up stale IPs periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequestMap.entries()) {
      if (now > record.resetTime) {
        ipRequestMap.delete(ip);
      }
    }
  }, 60000);
}

/**
 * Extracts client IP from standard Next.js request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Rate limit checker for Next.js API routes.
 * Returns null if allowed, or a NextResponse 429 if limit exceeded.
 */
export function applyRateLimit(
  req: NextRequest,
  options: { maxRequests?: number; windowMs?: number } = {}
): NextResponse | null {
  const maxRequests = options.maxRequests ?? 30; // 30 requests
  const windowMs = options.windowMs ?? 60000;    // per 60 seconds
  const ip = getClientIp(req);
  const now = Date.now();

  const current = ipRequestMap.get(ip);

  if (!current || now > current.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    console.warn(`[Security Rate Limit] IP ${ip} exceeded ${maxRequests} requests/min limit.`);
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(current.resetTime / 1000))
        }
      }
    );
  }

  current.count += 1;
  return null;
}

/**
 * Validates text payload to prevent quota exhaustion from abusive oversized payloads
 */
export function validateTextPayload(text: unknown, maxChars: number = 1000): { valid: boolean; error?: string } {
  if (typeof text !== 'string') {
    return { valid: false, error: 'Payload must be a valid text string.' };
  }
  if (text.trim().length === 0) {
    return { valid: false, error: 'Payload cannot be empty.' };
  }
  if (text.length > maxChars) {
    return { valid: false, error: `Payload exceeds maximum character limit of ${maxChars} characters.` };
  }
  return { valid: true };
}
