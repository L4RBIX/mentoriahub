import { headers } from 'next/headers';

function normalizeUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getAppUrl(origin?: string): string {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeUrl(process.env.APP_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeUrl(process.env.VERCEL_URL) ??
    normalizeUrl(origin) ??
    'http://localhost:3000'
  );
}

export async function getRequestAppUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? undefined;
  const proto = headerList.get('x-forwarded-proto') ?? 'https';
  return getAppUrl(host ? `${proto}://${host}` : undefined);
}

export function buildAppLink(pathname = '/'): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getAppUrl()}${path}`;
}

export function buildWebhookUrl(): string {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const webhook = new URL('/api/telegram/webhook', getAppUrl());
  if (secret) webhook.searchParams.set('secret', secret);
  return webhook.toString();
}
