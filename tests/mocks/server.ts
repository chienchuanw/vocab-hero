import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * 設定 MSW 測試伺服器
 * 用於在 Node.js 環境中攔截 HTTP 請求
 */
export const server = setupServer(...handlers);

