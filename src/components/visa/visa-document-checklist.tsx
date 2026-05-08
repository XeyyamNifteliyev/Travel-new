'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BadgeDollarSign, CheckCircle, Circle, FileText, IdCard, Plane, ScrollText } from 'lucide-react';
import type { VisaDocument } from '@/types/country';

interface VisaDocumentChecklistProps {
  documents: VisaDocument[];
  countrySlug: string;
}

const CATEGORY_ICONS = {
  identity: IdCard,
  financial: BadgeDollarSign,
  travel: Plane,
  other: ScrollText,
};

function localizedField(doc: VisaDocument, field: 'document_name' | 'description' | 'notes', locale: string): string {
  return (
    (doc[`${field}_${locale}` as keyof VisaDocument] as string | undefined) ||
    (doc[`${field}_az` as keyof VisaDocument] as string | undefined) ||
    (doc[`${field}_en` as keyof VisaDocument] as string | undefined) ||
    ''
  );
}

export default function VisaDocumentChecklist({ documents, countrySlug }: VisaDocumentChecklistProps) {
  const t = useTranslations('visa');
  const locale = useLocale();
  const storageKey = `visa-checklist-${countrySlug}`;

  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {
      // ignore localStorage errors
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]));
    } catch {
      // ignore localStorage errors
    }
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

      {Object.entries(grouped).map(([category, docs]) => {
        const CategoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.other;

        return (
          <div key={category} className="mb-4 last:mb-0">
            <p className="text-sm font-medium text-txt-sec mb-2 flex items-center gap-1.5">
              <CategoryIcon className="w-4 h-4" />
              {t(`category.${category}` as `category.${'identity' | 'financial' | 'travel' | 'other'}`)}
            </p>
            <div className="space-y-2">
              {docs.map((doc) => {
                const name = localizedField(doc, 'document_name', locale);
                const description = localizedField(doc, 'description', locale);
                const notes = localizedField(doc, 'notes', locale);
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
                          <span className="ml-2 text-xs text-txt-sec">({t('optional')})</span>
                        )}
                      </span>
                      {description && (
                        <p className="text-xs text-txt-sec mt-0.5">{description}</p>
                      )}
                      {notes && (
                        <p className="text-xs text-txt-sec mt-0.5">{notes}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {progress === 100 && totalRequired > 0 && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
          {t('allDocumentsReady')}
        </div>
      )}
    </div>
  );
}
