import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSentences, useDeleteSentence, type SentenceCard } from '@/hooks/useSentences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface SentenceListProps {
  onEdit?: (sentence: SentenceCard) => void;
  onStudy?: () => void;
  className?: string;
}

export function SentenceList({ onEdit, onStudy, className }: SentenceListProps) {
  const t = useTranslations('sentences.list');
  const { data: sentences, isLoading, isError, refetch } = useSentences();
  const deleteSentence = useDeleteSentence();
  const [sentenceToDelete, setSentenceToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteSentence.mutateAsync(id);
      toast.success(t('deleteSuccess'));
      setSentenceToDelete(null);
    } catch (error) {
      console.error('Failed to delete sentence:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="sentence-list-loading">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-semibold">{t('error')}</h3>
        <Button onClick={() => refetch()} variant="outline">
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!sentences || sentences.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-lg"
        data-testid="sentence-empty"
      >
        <div className="bg-muted p-4 rounded-full">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{t('empty')}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">{t('emptyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`} data-testid="sentence-list">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <Button onClick={onStudy} disabled={!sentences.length} data-testid="sentence-study">
          <BookOpen className="mr-2 h-4 w-4" />
          {t('study')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sentences.map((sentence) => (
          <Card key={sentence.id} className="flex flex-col h-full card-shadow card-shadow-hover" data-testid="sentence-item">
            <CardHeader>
              <CardTitle className="text-xl font-medium leading-relaxed">
                {sentence.japanese}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-muted-foreground text-lg">{sentence.english}</p>
              {sentence.notes && (
                <p className="text-sm text-muted-foreground italic border-l-2 pl-3 border-muted">
                  {sentence.notes}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
              <span className="text-xs text-muted-foreground">
                {format(new Date(sentence.createdAt), 'yyyy-MM-dd')}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(sentence)}
                  data-testid="sentence-edit"
                  title={t('edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <AlertDialog
                  open={sentenceToDelete === sentence.id}
                  onOpenChange={(open) => !open && setSentenceToDelete(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setSentenceToDelete(sentence.id)}
                      data-testid="sentence-delete"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('confirmDelete')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{'Cancel'}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(sentence.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
