'use client';

import Link from 'next/link';
import { Layout } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/features/settings';
import { Palette, Volume2, GraduationCap, Target, Bell, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const settingsLinks: SettingsLinkProps[] = [
  {
    href: '/settings/theme',
    icon: Palette,
    title: 'Appearance',
    description: 'Theme and display settings',
  },
  {
    href: '/settings/audio',
    icon: Volume2,
    title: 'Audio',
    description: 'TTS voice and playback settings',
  },
  {
    href: '/settings/study',
    icon: GraduationCap,
    title: 'Study',
    description: 'Study session preferences',
  },
  {
    href: '/settings/goals',
    icon: Target,
    title: 'Daily Goals',
    description: 'Daily study targets and reminders',
  },
  {
    href: '/settings/notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Notification preferences',
  },
  {
    href: '/settings/language',
    icon: Globe,
    title: 'Language',
    description: 'App language settings',
  },
];

export default function SettingsPage() {
  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your preferences and customize your experience
            </p>
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
