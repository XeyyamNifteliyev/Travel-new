'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const pathname = window.location.pathname;
      const segments = pathname.split('/').filter(Boolean);
      let currentLocale = 'az';

      if (['az', 'ru', 'en'].includes(segments[0])) {
        currentLocale = segments[0];
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = `/${currentLocale}`;
      }
    };
    handleOAuthCallback();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/${locale}`);
    }
  };

  const handleGoogleLogin = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentLocale = locale || 'az';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${origin}/${currentLocale}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border">
        <h1 className="text-2xl font-bold text-center mb-6">{t('loginTitle')}</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              required
              className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              required
              className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-txt-sec"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('login')}...
              </>
            ) : (
              t('login')
            )}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-dark font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            {t('loginWithGoogle')}
          </button>
        </div>

        <p className="text-center text-txt-sec text-sm mt-6">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}