'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS: Record<string, Record<string, string[]>> = {
  az: {
    required: [
      'Hansı sənədlər tələb olunur?',
      'Viza nə qədər vaxt aparır?',
      'Randevu necə alınır?',
      'Viza haqqı nə qədərdir?',
      'Müraciət rədd edilərsə nə etməli?',
    ],
    not_required: [
      'Qalma müddəti nə qədərdir?',
      'Sərhəddə nə tələb olunur?',
      'Qayıdış bileti lazımdır?',
    ],
    on_arrival: [
      'Gəlişdə viza necə alınır?',
      'Neçə gün qalmaq olar?',
      'Viza haqqı varmı?',
    ],
  },
  en: {
    required: ['What documents are needed?', 'How long does it take?', 'How to get appointment?', 'What is the visa fee?'],
    not_required: ['How long can I stay?', 'What is needed at border?', 'Return ticket required?'],
    on_arrival: ['How to get visa on arrival?', 'How many days can I stay?', 'Is there a fee?'],
  },
  ru: {
    required: ['Какие документы нужны?', 'Сколько времени занимает?', 'Как записаться?', 'Сколько стоит виза?'],
    not_required: ['Сколько можно находиться?', 'Что нужно на границе?', 'Нужен обратный билет?'],
    on_arrival: ['Как получить визу?', 'Сколько дней можно?', 'Есть ли сбор?'],
  },
};

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
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || data.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Xəta baş verdi. Yenidən cəhd edin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const typeKey = requirementType === 'not_required' || requirementType === 'on_arrival' ? requirementType : 'required';
  const questions = (QUICK_QUESTIONS[locale] || QUICK_QUESTIONS.az)[typeKey] || QUICK_QUESTIONS.az.required;

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
