'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('checkEmail')}</h2>
          <p className="text-txt-sec">{t('confirmSent', { email })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border">
        <h1 className="text-2xl font-bold text-center mb-6">{t('registerTitle')}</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 w-4 h-4 text-txt-sec" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('name')}
              required
              className="w-full bg-bg-base/50 border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
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
              minLength={6}
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
                {t('loading')}...
              </>
            ) : (
              t('register')
            )}
          </button>
        </form>

        <p className="text-center text-txt-sec text-sm mt-6">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
