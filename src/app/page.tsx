
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold">Redirecting...</h1>
        <p className="mt-4 text-muted-foreground">
          Please wait while we redirect you to the login page.
        </p>
      </div>
    </div>
  );
}
