import thTranslations from '../../messages/th.json';
import enTranslations from '../../messages/en.json';

const translations = {
  th: thTranslations,
  en: enTranslations,
} as const;

export type Locale = keyof typeof translations;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function t(locale: Locale, key: string, fallback?: string): string {
  const translationObj = translations[locale];
  
  // If locale not found, return fallback or key
  if (!translationObj) {
    console.warn(`Locale "${locale}" not found in translations`);
    return fallback || key;
  }
  
  // Handle dot notation keys (e.g., "app.title")
  if (key.includes('.')) {
    const value = translationObj[key as keyof typeof translationObj];
    if (typeof value === 'string') {
      return value;
    }
  }
  
  // Handle nested object keys
  const keys = key.split('.');
  let value: any = translationObj;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  // Return fallback or the key itself if translation not found
  return fallback || key;
}
