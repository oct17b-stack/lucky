'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ locale, label }: { locale: string; label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="button secondary"
      onClick={async () => {
        await authClient.signOut();
        router.push(`/${locale}`);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
