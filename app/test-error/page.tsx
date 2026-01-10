'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  useEffect(() => {
    setShouldThrow(true);
  }, []);

  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }

  return <div>Loading...</div>;
}
