'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

interface RegisterResponse {
  ok: boolean;
  data?: {
    user: {
      id: number;
      email: string;
      username: string | null;
      role: 'user' | 'admin';
    };
  };
  message?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // In production, NEXT_PUBLIC_API_URL should be the full API URL (e.g., https://app.vercel.app/api)
      // In dev, it's just the server URL (e.g., http://localhost:4000)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const apiPath = apiUrl.includes('/api') ? '' : '/api';
      const response = await fetch(`${apiUrl}${apiPath}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Redirect to movies page on success
      router.push('/movies');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Register" description="Create a new account">
      <div className="mx-auto max-w-md">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-white/10 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-400 dark:focus:ring-slate-400"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-white/10 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-400 dark:focus:ring-slate-400"
              placeholder="johndoe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-white/10 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-400 dark:focus:ring-slate-400"
              placeholder="••••••••"
              disabled={isLoading}
              minLength={8}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-slate-900 hover:underline dark:text-slate-100"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
