'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Circle, FileText } from 'lucide-react';
import type { VisaDocument } from '@/types/country';

interface VisaDocumentChecklistProps {
  documents: VisaDocument[];
  countrySlug: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  identity: '🪪',
  financial: '💰',
  travel: '✈️',
  other: '📄',
};

export default function VisaDocumentChecklist({ documents, countrySlug }: VisaDocumentChecklistProps) {
  const t = useTranslations('visa');
  const locale = useLocale();
  const storageKey = `visa-checklist-${countrySlug}`;

  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch { /* ignore */ }
  }, [checked, storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const grouped = documents.reduce<Record<string, VisaDocument[]>>((acc, doc) => {
    const cat = doc.document_category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  const totalRequired = documents.filter((d) => d.is_required).length;
  const totalChecked = [...checked].filter((id) => documents.find((d) => d.id === id && d.is_required)).length;
  const progress = totalRequired > 0 ? Math.round((totalChecked / totalRequired) * 100) : 0;

  return (
    <div className="bg-bg-surface rounded-xl p-5 border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t('documents')}
        </h3>
        <span className="text-sm text-txt-sec">
          {totalChecked}/{totalRequired} {t('ready')}
        </span>
      </div>

      <div className="w-full bg-secondary rounded-full h-2 mb-5">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {Object.entries(grouped).map(([category, docs]) => (
        <div key={category} className="mb-4 last:mb-0">
          <p className="text-sm font-medium text-txt-sec mb-2 flex items-center gap-1.5">
            <span>{CATEGORY_ICONS[category] || CATEGORY_ICONS.other}</span>
            {t(`category.${category}` as `category.${'identity' | 'financial' | 'travel' | 'other'}`)}
          </p>
          <div className="space-y-2">
            {docs.map((doc) => {
              const name = (doc[`document_name_${locale}` as keyof VisaDocument] as string) || doc.document_name_az;
              const isChecked = checked.has(doc.id);
              return (
                <label key={doc.id} className="flex items-start gap-3 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => toggle(doc.id)}
                    className="mt-0.5 shrink-0"
                  >
                    {isChecked ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-txt-sec group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <span className={`text-sm ${isChecked ? 'line-through text-txt-sec' : ''}`}>
                      {name}
                      {!doc.is_required && (
                        <span className="ml-2 text-xs text-txt-sec">(isteğe bağlı)</span>
                      )}
                    </span>
                    {doc.notes_az && (
                      <p className="text-xs text-txt-sec mt-0.5">{doc.notes_az}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {progress === 100 && totalRequired > 0 && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
          {t('allDocumentsReady')}
        </div>
      )}
    </div>
  );
}
