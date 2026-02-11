import { NextResponse } from 'next/server';
import { getDefaultUserId } from '@/lib/db/default-user';

export async function GET() {
  try {
    const userId = await getDefaultUserId();
    return NextResponse.json({ userId });
  } catch (error) {
    console.error('Failed to get default user ID:', error);
    return NextResponse.json({ error: 'Failed to get default user ID' }, { status: 500 });
  }
}
