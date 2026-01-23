'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden p-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <Image
                  src="/NamelessJoseph.png"
                  alt="St. Joseph"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="">
              <h1 className="text-3xl font-[family-name:var(--font-medieval-sharp)] font-bold mb-6 text-center text-gray-800">
                St. Joseph's List
              </h1>
                            <div className="mb-8 text-center text-gray-600 space-y-4">
                              <p className="text-sm">
                                St. Joseph's List is a community-based tool-sharing website. Basically "Craigslist, but for just your local church". The tools you add are only visible to people in the same groups as you. You can be part of multiple groups, and create one if you want.
                              </p>
                              <div className="text-xs bg-yellow-50 border border-yellow-200 p-2 rounded text-yellow-800">
                                <p className="font-bold">🚧 This is an early-alpha. 🚧</p>
                                <p>Expect random changes and for database state to be dropped.</p>
                              </div>
                            </div>
              
                {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required={isSignUp}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 font-medium"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
