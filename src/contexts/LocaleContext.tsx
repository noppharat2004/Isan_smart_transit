'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Locale, t as tFunction } from '@/lib/translations';

type LocaleContextType = {
  locale: Locale;
  t: (key: string, fallback?: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const t = (key: string, fallback?: string) => {
    return tFunction(locale, key, fallback);
  };

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
