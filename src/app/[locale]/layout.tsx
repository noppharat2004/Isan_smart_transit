import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { LocaleProvider } from '@/contexts/LocaleContext';

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <LocaleProvider locale={locale as any}>
      {children}
    </LocaleProvider>
  );
}
