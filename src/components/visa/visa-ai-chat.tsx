'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Loader2, MessageCircle, Send } from 'lucide-react';

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

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return;

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
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        {countryName} — {t('askAI')}
      </h3>

      {messages.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-txt-sec mb-2">{t('aiQuickQuestions')}</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
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

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder={t('aiPlaceholder')}
          className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-bg-base focus:outline-none focus:border-primary"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
