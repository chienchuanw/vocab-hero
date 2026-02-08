import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api';

/**
 * GET /api/sentences/:id
 * 取得單一句子卡片的詳細資訊
 * 尚未實作
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return errorResponse('NOT_IMPLEMENTED', 'Not implemented yet', 501);
}

/**
 * PUT /api/sentences/:id
 * 更新句子卡片資料
 * 尚未實作
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return errorResponse('NOT_IMPLEMENTED', 'Not implemented yet', 501);
}

/**
 * DELETE /api/sentences/:id
 * 刪除句子卡片
 * 尚未實作
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return errorResponse('NOT_IMPLEMENTED', 'Not implemented yet', 501);
}
