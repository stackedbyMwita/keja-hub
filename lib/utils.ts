import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FormatPhoneOptions {
  spaced?: boolean;
  includePrefix?: boolean;
}

export function normalizeKenyaPhone(raw: string | number | null | undefined): string | null {
  if (!raw) return null;
  let digits = String(raw).trim().replace(/[^\d]/g, '');

  if (digits.startsWith('254')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);

  return /^(?:1|7)\d{8}$/.test(digits) ? digits : null;
}

export function formatKenyaPhone(
  rawPhone: string | number | null | undefined,
  options: FormatPhoneOptions = {}
): string {
  const { spaced = true, includePrefix = true } = options;
  if (!rawPhone) return '';

  const normalized = normalizeKenyaPhone(rawPhone);
  if (!normalized) return String(rawPhone);

  const part1 = normalized.slice(0, 3);
  const part2 = normalized.slice(3, 6);
  const part3 = normalized.slice(6);

  if (spaced) {
    return includePrefix ? `+254 ${part1} ${part2} ${part3}` : `0${part1} ${part2} ${part3}`;
  }

  return includePrefix ? `+254${normalized}` : `0${normalized}`;
}

export function getKenyaPhoneLink(phone: string | number | null | undefined, type: 'tel' | 'wa' = 'tel'): string {
  const normalized = normalizeKenyaPhone(phone);
  if (!normalized) return '#';
  const fullInt = `254${normalized}`;
  return type === 'wa' ? `https://wa.me/${fullInt}` : `tel:+${fullInt}`;
}

export function timeAgo(
  date: string | number | Date | null | undefined,
  fallback = 'Never'
): string {
  if (!date) return fallback;

  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return fallback;

  const diffMs = Date.now() - timestamp;

  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.4375);
  const years = Math.floor(days / 365.25);

  if (seconds < 45) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}