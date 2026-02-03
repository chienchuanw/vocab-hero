'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/features/settings';
import {
  Palette,
  Volume2,
  GraduationCap,
  Target,
  Bell,
  Globe,
  Database,
  ChevronRight,
} from 'lucide-react';

interface SettingsLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function SettingsLink({ href, icon: Icon, title, description }: SettingsLinkProps) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');

  const settingsLinks: SettingsLinkProps[] = [
    {
      href: '/settings/theme',
      icon: Palette,
      title: t('appearance'),
      description: t('appearanceDesc'),
    },
    {
      href: '/settings/audio',
      icon: Volume2,
      title: t('audio'),
      description: t('audioDesc'),
    },
    {
      href: '/settings/study',
      icon: GraduationCap,
      title: t('study'),
      description: t('studyDesc'),
    },
    {
      href: '/settings/goals',
      icon: Target,
      title: t('dailyGoals'),
      description: t('dailyGoalsDesc'),
    },
    {
      href: '/settings/notifications',
      icon: Bell,
      title: t('notifications'),
      description: t('notificationsDesc'),
    },
    {
      href: '/settings/language',
      icon: Globe,
      title: t('language'),
      description: t('languageDesc'),
    },
    {
      href: '/settings/data',
      icon: Database,
      title: t('dataManagement'),
      description: t('dataManagementDesc'),
    },
  ];

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">{t('description')}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-3">
          {settingsLinks.map((link) => (
            <SettingsLink key={link.href} {...link} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
