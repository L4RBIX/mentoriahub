'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Send } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { createTelegramLink, getTelegramStatus } from '@/lib/telegram';

const TELEGRAM_LINK_STORAGE_KEY = 'mentoria-telegram-link';
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 60000;
const LINK_TTL_MS = 60 * 60 * 1000;

interface StoredTelegramLink {
  code: string;
  botUrl?: string;
  createdAt: number;
}

interface TelegramConnectCardProps {
  variant?: 'full' | 'compact';
  className?: string;
  onConnected?: () => void;
}

type ConnectPhase = 'idle' | 'creating' | 'waiting' | 'connected' | 'error';

function readStoredLink(): StoredTelegramLink | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(TELEGRAM_LINK_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredTelegramLink>;
    if (!parsed.code || !parsed.createdAt || Date.now() - parsed.createdAt > LINK_TTL_MS) {
      window.localStorage.removeItem(TELEGRAM_LINK_STORAGE_KEY);
      return null;
    }

    return {
      code: parsed.code,
      botUrl: parsed.botUrl,
      createdAt: parsed.createdAt,
    };
  } catch {
    window.localStorage.removeItem(TELEGRAM_LINK_STORAGE_KEY);
    return null;
  }
}

function storeLink(link: StoredTelegramLink) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TELEGRAM_LINK_STORAGE_KEY, JSON.stringify(link));
}

function clearStoredLink() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TELEGRAM_LINK_STORAGE_KEY);
}

export function TelegramConnectCard({ variant = 'full', className = '', onConnected }: TelegramConnectCardProps) {
  const { tt, language } = useI18n();
  const compact = variant === 'compact';
  const [phase, setPhase] = useState<ConnectPhase>('idle');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState<string | undefined>();
  const [code, setCode] = useState<string | undefined>();
  const [botUrl, setBotUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);

  const markConnected = useCallback((nextUsername?: string) => {
    setConnected(true);
    setUsername(nextUsername);
    setPhase('connected');
    setError(undefined);
    clearStoredLink();
    onConnected?.();
  }, [onConnected]);

  const checkConnection = useCallback(async (showError = false) => {
    setChecking(true);
    try {
      const result = await getTelegramStatus(code);
      if (result.connected) {
        markConnected(result.username);
        return true;
      }

      if (showError) {
        setPhase('error');
        setError(tt('telegramConnectionError'));
      }
      return false;
    } finally {
      setChecking(false);
    }
  }, [code, markConnected, tt]);

  useEffect(() => {
    const stored = readStoredLink();
    if (stored) {
      setCode(stored.code);
      setBotUrl(stored.botUrl);
      setPhase('waiting');
    }

    getTelegramStatus(stored?.code).then(result => {
      if (result.connected) {
        markConnected(result.username);
      }
    });
  }, [markConnected]);

  useEffect(() => {
    if (phase !== 'waiting' || !code) return;

    let cancelled = false;
    let inFlight = false;
    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      if (cancelled || inFlight) return;

      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setPhase('error');
        setError(tt('telegramConnectionError'));
        window.clearInterval(interval);
        return;
      }

      inFlight = true;
      getTelegramStatus(code).then(result => {
        if (cancelled) return;
        if (result.connected) {
          markConnected(result.username);
          window.clearInterval(interval);
        }
      }).finally(() => {
        inFlight = false;
      });
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [code, markConnected, phase, tt]);

  const startConnection = async () => {
    setPhase('creating');
    setError(undefined);

    const result = await createTelegramLink(language);
    const linkCode = result.code ?? result.token;
    if (!result.ok || !result.botUrl || !linkCode) {
      setPhase('error');
      setError(result.error || tt('telegramConnectionError'));
      return;
    }

    setCode(linkCode);
    setBotUrl(result.botUrl);
    setPhase('waiting');
    storeLink({ code: linkCode, botUrl: result.botUrl, createdAt: Date.now() });
    window.open(result.botUrl, '_blank', 'noopener,noreferrer');
  };

  const steps = [
    tt('telegramStepOpenBot'),
    tt('telegramStepPressStart'),
    tt('telegramStepReturn'),
    tt('telegramStepSave'),
  ];

  return (
    <section className={`rounded-2xl border p-5 ${
      connected
        ? 'border-emerald-500/20 bg-emerald-500/[0.055]'
        : 'border-[#5941ff]/20 bg-[#5941ff]/[0.055]'
    } ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          connected ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-[#8b7fff]/25 bg-[#5941ff]/15 text-[#a49bff]'
        }`}>
          {connected ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-white">{tt('telegramInstructionTitle')}</h2>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              connected
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 bg-white/5 text-white/45'
            }`}>
              {connected ? tt('telegramConnected') : tt('telegramNotConnected')}
            </span>
          </div>

          <p className={`${compact ? 'mt-2' : 'mt-2'} text-xs leading-relaxed text-white/48`}>
            {connected
              ? `${tt('telegramConnected')}${username ? ` · ${username}` : ''}`
              : compact ? tt('telegramConnectOpportunityHint') : tt('telegramInstructionDescription')}
          </p>
        </div>
      </div>

      {!connected && (
        <div className="mt-4 space-y-4">
          {(!compact || phase === 'waiting' || phase === 'error') && (
            <ol className="grid gap-2">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-2 text-xs leading-relaxed text-white/55">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/7 text-[10px] font-semibold text-white/70">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}

          {phase === 'waiting' && (
            <p className="inline-flex items-center gap-2 text-xs text-[#a49bff]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {tt('telegramWaitingForStart')}
            </p>
          )}

          {error && (
            <p className="flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/8 px-3 py-2 text-xs leading-relaxed text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {botUrl ? (
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4730dd]"
              >
                {tt('openTelegramBot')} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={startConnection}
                disabled={phase === 'creating'}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5941ff] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4730dd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {phase === 'creating' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {tt('connectTelegram')}
              </button>
            )}

            {(code || phase === 'waiting' || phase === 'error') && (
              <button
                type="button"
                onClick={() => void checkConnection(true)}
                disabled={checking}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-colors hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {tt('telegramCheckStart')}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
