'use client';

import { useQuery } from '@tanstack/react-query';

export function useDefaultUserId() {
  return useQuery({
    queryKey: ['defaultUserId'],
    queryFn: async () => {
      const response = await fetch('/api/user/default');
      if (!response.ok) throw new Error('Failed to fetch default user ID');
      const data = await response.json();
      return data.userId;
    },
  });
}
