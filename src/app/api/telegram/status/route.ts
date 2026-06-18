import { NextRequest, NextResponse } from 'next/server';
import { getTelegramStatus, getTelegramStatusByCode } from '@/lib/server/telegramStore';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? req.nextUrl.searchParams.get('token');
  if (code) {
    const status = await getTelegramStatusByCode(code);
    return NextResponse.json({ ok: true, ...status });
  }

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Missing userId or code' }, { status: 400 });
  }

  const status = await getTelegramStatus(userId);
  return NextResponse.json({ ok: true, ...status });
}
