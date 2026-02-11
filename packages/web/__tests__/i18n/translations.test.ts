import { describe, it, expect } from 'vitest';
import enMessages from '../../messages/en.json';
import zhTWMessages from '../../messages/zh-TW.json';

describe('Translation Files', () => {
  describe('Key Parity', () => {
    it('should have matching top-level namespaces', () => {
      const enKeys = Object.keys(enMessages).sort();
      const zhTWKeys = Object.keys(zhTWMessages).sort();
      expect(enKeys).toEqual(zhTWKeys);
    });

    it('should have matching keys in common namespace', () => {
      const enKeys = Object.keys(enMessages.common).sort();
      const zhTWKeys = Object.keys(zhTWMessages.common).sort();
      expect(enKeys).toEqual(zhTWKeys);
    });

    it('should have matching keys in nav namespace', () => {
      const enKeys = Object.keys(enMessages.nav).sort();
      const zhTWKeys = Object.keys(zhTWMessages.nav).sort();
      expect(enKeys).toEqual(zhTWKeys);
    });

    it('should have matching keys in settings namespace', () => {
      const enKeys = Object.keys(enMessages.settings).sort();
      const zhTWKeys = Object.keys(zhTWMessages.settings).sort();
      expect(enKeys).toEqual(zhTWKeys);
    });
  });

  describe('Content Validation', () => {
    it('should have no empty string values in en.json', () => {
      const checkEmpty = (obj: Record<string, unknown>, path = ''): string[] => {
        const emptyKeys: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(currentPath);
          } else if (typeof value === 'object' && value !== null) {
            emptyKeys.push(...checkEmpty(value as Record<string, unknown>, currentPath));
          }
        }
        return emptyKeys;
      };

      const emptyKeys = checkEmpty(enMessages);
      expect(emptyKeys).toEqual([]);
    });

    it('should have no empty string values in zh-TW.json', () => {
      const checkEmpty = (obj: Record<string, unknown>, path = ''): string[] => {
        const emptyKeys: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(currentPath);
          } else if (typeof value === 'object' && value !== null) {
            emptyKeys.push(...checkEmpty(value as Record<string, unknown>, currentPath));
          }
        }
        return emptyKeys;
      };

      const emptyKeys = checkEmpty(zhTWMessages);
      expect(emptyKeys).toEqual([]);
    });

    it('should have at least 10 namespaces', () => {
      expect(Object.keys(enMessages).length).toBeGreaterThanOrEqual(10);
    });
  });
});
