'use client';

import { Layout } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages } from 'lucide-react';

export default function LanguageSettingsPage() {
  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Language</h1>
          <p className="text-muted-foreground mt-2">App language and localization settings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>App Language</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription>
              Select your preferred language for the application interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Languages className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">Multi-language Support</h3>
              <p className="text-muted-foreground max-w-md">
                We&apos;re working on adding support for multiple interface languages. Currently,
                the app is available in English.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Planned Languages</h4>
              <div className="flex flex-wrap gap-2">
                <LanguageTag code="en" name="English" isActive />
                <LanguageTag code="zh-TW" name="繁體中文" />
                <LanguageTag code="ja" name="日本語" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface LanguageTagProps {
  code: string;
  name: string;
  isActive?: boolean;
}

function LanguageTag({ code, name, isActive }: LanguageTagProps) {
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border
        ${isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/50 border-transparent text-muted-foreground'}
      `}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs opacity-60">({code})</span>
      {isActive && (
        <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
          Active
        </Badge>
      )}
    </div>
  );
}
