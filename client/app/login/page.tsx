'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';

interface LoginResponse {
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In production, NEXT_PUBLIC_API_URL should be the full API URL (e.g., https://app.vercel.app/api)
      // In dev, it's just the server URL (e.g., http://localhost:4000)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const apiPath = apiUrl.includes('/api') ? '' : '/api';
      const response = await fetch(`${apiUrl}${apiPath}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      try {
        localStorage.setItem('auth-state', 'logged-in');
        window.dispatchEvent(new Event('auth-changed'));
      } catch {
        // Ignore storage access issues.
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
    <PageContainer title="Login" description="Sign in to your account">
      <div className="mx-auto max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-slate-800">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-white/10 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-400 dark:focus:ring-slate-400"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-900 dark:text-slate-100">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-white/10 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-400 dark:focus:ring-slate-400"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-slate-900 hover:underline dark:text-slate-100">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
