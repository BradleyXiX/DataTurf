'use client';

import { useLinkStatus } from 'next/link';

export function VenueLinkStatus() {
  const { pending } = useLinkStatus();

  return (
    <span className="sr-only" role="status" data-venue-pending={pending || undefined}>
      {pending ? 'Applying venue filter' : ''}
    </span>
  );
}
