import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Sentence Card Interface
 */
export interface SentenceCard {
  id: string;
  japanese: string;
  english: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a sentence
 */
export interface CreateSentenceInput {
  japanese: string;
  english: string;
  notes?: string;
}

/**
 * Input for updating a sentence
 */
export interface UpdateSentenceInput {
  japanese?: string;
  english?: string;
  notes?: string;
}

/**
 * API Response Interface
 */
interface SentenceListResponse {
  success: boolean;
  data: SentenceCard[];
}

/**
 * useSentences Hook
 * Fetches the list of sentence cards
 */
export function useSentences() {
  return useQuery({
    queryKey: ['sentences'],
    queryFn: async () => {
      const response = await fetch('/api/sentences');

      if (!response.ok) {
        throw new Error('Failed to fetch sentences');
      }

      const result: SentenceListResponse = await response.json();
      return result.data;
    },
  });
}

/**
 * useCreateSentence Hook
 * Creates a new sentence card
 */
export function useCreateSentence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSentenceInput) => {
      const response = await fetch('/api/sentences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create sentence');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
    },
  });
}

/**
 * useUpdateSentence Hook
 * Updates an existing sentence card
 */
export function useUpdateSentence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSentenceInput }) => {
      const response = await fetch(`/api/sentences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update sentence');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
    },
  });
}

/**
 * useDeleteSentence Hook
 * Deletes a sentence card
 */
export function useDeleteSentence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sentences/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete sentence');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentences'] });
    },
  });
}
