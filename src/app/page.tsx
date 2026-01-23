'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) return null; // Will redirect

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Dashboard />
    </main>
  );
}
