'use client';

import { useEffect, useRef } from 'react';

export const dynamic = 'force-dynamic';

export default function TestErrorPage() {
  const hasThrown = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasThrown.current) {
        hasThrown.current = true;
        throw new Error('Test error for error boundary');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return <div>Loading...</div>;
}
