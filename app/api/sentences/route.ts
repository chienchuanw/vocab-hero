import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api';

/**
 * GET /api/sentences
 * 取得句子卡片列表
 * 尚未實作
 */
export async function GET(request: NextRequest) {
  return errorResponse('NOT_IMPLEMENTED', 'Not implemented yet', 501);
}

/**
 * POST /api/sentences
 * 新增句子卡片
 * 尚未實作
 */
export async function POST(request: NextRequest) {
  return errorResponse('NOT_IMPLEMENTED', 'Not implemented yet', 501);
}
