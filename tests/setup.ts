import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// 啟動 MSW 伺服器
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// 每個測試後重置處理器
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// 測試結束後關閉伺服器
afterAll(() => {
  server.close();
});
