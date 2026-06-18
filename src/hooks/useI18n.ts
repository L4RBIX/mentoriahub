'use client';

import { useEffect, useState } from 'react';
import { LANGUAGE_CHANGE_EVENT, t } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import type { AppLanguage } from '@/types/mentoria';

export function useI18n() {
  const [language, setLanguage] = useState<AppLanguage>(() => storage.getLanguage());

  useEffect(() => {
    const handleLanguage = (event: Event) => {
      setLanguage((event as CustomEvent<AppLanguage>).detail);
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguage);
    return () => window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguage);
  }, []);

  return {
    language,
    tt: (key: string) => t(language, key),
  };
}
