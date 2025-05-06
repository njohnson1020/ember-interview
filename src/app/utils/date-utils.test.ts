import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  now,
  isValidDate,
  getTimeDifferenceInMinutes,
  formatTime,
} from './date-utils';

describe('date-utils', () => {
  describe('now', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-05-05T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns current date', () => {
      const result = now();
      expect(result.toISOString()).toBe('2025-05-05T10:00:00.000Z');
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid date strings', () => {
      expect(isValidDate('2025-05-05T10:00:00Z')).toBe(true);
      expect(isValidDate('2025-05-05')).toBe(true);
      expect(isValidDate('2025/05/05')).toBe(true);
    });

    it('returns false for invalid date strings', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2025-13-45')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });
  });

  describe('getTimeDifferenceInMinutes', () => {
    it('calculates positive difference correctly', () => {
      const target = new Date('2025-05-05T10:30:00Z');
      const comparable = new Date('2025-05-05T10:00:00Z');
      expect(getTimeDifferenceInMinutes(target, comparable)).toBe(30);
    });

    it('calculates negative difference correctly', () => {
      const target = new Date('2025-05-05T10:00:00Z');
      const comparable = new Date('2025-05-05T10:30:00Z');
      expect(getTimeDifferenceInMinutes(target, comparable)).toBe(-30);
    });

    it('handles same time', () => {
      const target = new Date('2025-05-05T10:00:00Z');
      const comparable = new Date('2025-05-05T10:00:00Z');
      expect(getTimeDifferenceInMinutes(target, comparable)).toBe(0);
    });

    it('rounds to nearest minute', () => {
      const target = new Date('2025-05-05T10:00:30Z');
      const comparable = new Date('2025-05-05T10:00:00Z');
      expect(getTimeDifferenceInMinutes(target, comparable)).toBe(1);
    });
  });

  describe('formatTime', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2025-05-05T10:00:00Z'));
    });

    it('formats time in 12-hour format', () => {
      expect(formatTime('2025-05-05T10:00')).toBe('10:00 AM');
      expect(formatTime('2025-05-05 15:30')).toBe('03:30 PM');
    });
  });
});
