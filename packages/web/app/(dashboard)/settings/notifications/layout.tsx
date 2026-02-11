import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.notifications.title'),
    description: t('settings.notifications.description'),
  };
}

export default function NotificationsSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
