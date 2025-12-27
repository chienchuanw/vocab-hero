import { http, HttpResponse } from 'msw';

/**
 * MSW 請求處理器
 * 用於模擬 API 回應
 */
export const handlers = [
  // 範例：模擬 API 端點
  // http.get('/api/vocabulary', () => {
  //   return HttpResponse.json([
  //     { id: '1', word: '勉強', reading: 'べんきょう', meaning: 'study' },
  //   ]);
  // }),
];

