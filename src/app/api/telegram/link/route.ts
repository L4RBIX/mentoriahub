import { NextRequest, NextResponse } from 'next/server';
import { createTelegramLink } from '@/lib/server/telegramStore';
import type { AppLanguage } from '@/types/mentoria';

interface LinkRequest {
  userId?: string;
  lang?: AppLanguage;
}

export async function POST(req: NextRequest) {
  let body: LinkRequest;
  try {
    body = await req.json() as LinkRequest;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.userId) {
    return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 });
  }

  try {
    const link = await createTelegramLink(body.userId, body.lang);
    return NextResponse.json({ ok: true, ...link });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Telegram link creation failed',
    }, { status: 500 });
  }
}
