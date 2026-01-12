'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-stone-600">Loading...</div>
    </div>
  );
}
