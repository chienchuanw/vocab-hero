import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每個測試後清理 React 組件
afterEach(() => {
  cleanup();
});
