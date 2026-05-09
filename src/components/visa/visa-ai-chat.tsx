'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Lock, MessageCircle, Send } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VisaAIChat({
  countrySlug,
  countryName,
  requirementType,
}: {
  countrySlug: string;
  countryName: string;
  requirementType: string;
}) {
  const t = useTranslations('visa');
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setIsAuthLoading(false);
    });
  }, []);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading || !isLoggedIn || remaining === 0) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/visa/ai-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, country_slug: countrySlug, locale }),
      });
      const data = await res.json();
      if (typeof data.remaining === 'number') setRemaining(data.remaining);
      if (typeof data.limit === 'number') setLimit(data.limit);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || data.error || t('aiError') }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('aiError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const typeKey = requirementType === 'not_required' || requirementType === 'on_arrival' ? requirementType : 'required';
  const rawQuestions = t.raw(`aiQuestions.${typeKey}`) as string[];
  const questions = Array.isArray(rawQuestions) ? rawQuestions : (t.raw('aiQuestions.required') as string[]);

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5 mt-6">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        {countryName} - {t('askAI')}
      </h3>
      {limit !== null && remaining !== null && (
        <p className="text-xs text-txt-sec mb-3">{t('aiRemaining', { remaining, limit })}</p>
      )}

      {messages.length === 0 && isLoggedIn && (
        <div className="mb-4">
          <p className="text-xs text-txt-sec mb-2">{t('aiQuickQuestions')}</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isLoading || remaining === 0}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 min-h-[40px] max-h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-bg-base border border-border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg-base border border-border rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-txt-sec">{t('aiSending')}</span>
            </div>
          </div>
        )}
      </div>

      {isAuthLoading ? (
        <div className="flex items-center gap-2 text-sm text-txt-sec">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          {t('aiAuthChecking')}
        </div>
      ) : isLoggedIn ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={remaining === 0 ? t('aiLimitReached') : t('aiPlaceholder')}
            className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-bg-base focus:outline-none focus:border-primary"
            disabled={isLoading || remaining === 0}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || remaining === 0}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-bg-base p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{t('aiLoginTitle')}</p>
              <p className="text-xs text-txt-sec mt-1">{t('aiLoginDesc')}</p>
            </div>
          </div>
          <Link href={`/${locale}/auth/login`} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground text-center">
            {t('aiLoginCta')}
          </Link>
        </div>
      )}
    </div>
  );
}
