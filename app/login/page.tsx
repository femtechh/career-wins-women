'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-2">
            Check your email
          </h2>
          <p className="text-stone-600 mb-6">
            We sent you a magic link to sign in. It will arrive in a moment.
          </p>
          <p className="text-sm text-stone-500">
            Didn't receive it?{' '}
            <button
              onClick={() => setSent(false)}
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Career Wins Journal
          </h1>
          <p className="text-stone-600">
            Your achievements deserve to be remembered
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700 mb-2"
              >
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </Button>
          </form>

          <p className="text-xs text-stone-500 text-center mt-6">
            No password needed. We'll email you a secure sign-in link.
          </p>
        </div>
      </div>
    </div>
  );
}
