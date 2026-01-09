'use client';

import { Layout } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function DataManagementPage() {
  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your vocabulary data - backup, restore, or reset everything
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <CardTitle>Backup Data</CardTitle>
              </div>
              <CardDescription>
                Download your vocabulary data as a JSON file for safekeeping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Creates a backup of all your vocabulary items, groups, and example sentences.
                Progress data like review schedules and study sessions are not included.
              </p>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <CardTitle>Restore Data</CardTitle>
              </div>
              <CardDescription>
                Upload a backup file to restore your vocabulary data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a previously downloaded backup file. You can choose how to handle duplicate
                vocabulary items.
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Backup File
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions that permanently delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Deleting all data is permanent and cannot be undone. Make sure to create a
                    backup first if you want to keep your vocabulary items.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Delete All Data</p>
                <p className="text-sm text-muted-foreground">
                  Removes all vocabulary items, groups, example sentences, study sessions, progress
                  logs, and review schedules. This action cannot be undone.
                </p>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
