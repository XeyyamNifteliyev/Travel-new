'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { CompanionItem } from '@/types/supabase-helpers';
import { Plus, Trash2, MapPin, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/ui/confirm-dialog';

export function MyCompanions() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const supabase = createClient();
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const [companions, setCompanions] = useState<CompanionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('companions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setCompanions(data as CompanionItem[]);
      setLoading(false);
    };
    fetchCompanions();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: t('deleteCompanionTitle'),
      message: t('deleteCompanionMsg'),
      confirmText: tc('cancel'),
      cancelText: tc('cancel'),
    });
    if (!confirmed) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('companions').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      toast.error(t('deleteFailed'));
    } else {
      setCompanions((prev) => prev.filter((c) => c.id !== id));
      toast.success(t('deleteCompanionSuccess'));
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('statusOpen');
      case 'filled': return t('statusFilled');
      default: return t('statusCancelled');
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-24 bg-bg-surface rounded-xl" /><div className="h-24 bg-bg-surface rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('companionsTitle')}</h2>
        <Link
          href={`/${locale}/companions`}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newCompanion')}
        </Link>
      </div>

      {companions.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-8 border border-border text-center">
          <Users className="w-12 h-12 text-txt-muted mx-auto mb-3" />
          <p className="text-txt-sec mb-4">{t('noCompanions')}</p>
          <Link href={`/${locale}/companions`} className="text-primary hover:underline">
            {t('createFirstCompanion')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {companions.map((companion) => (
            <div key={companion.id} className="bg-bg-surface rounded-xl p-4 border border-border flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    companion.status === 'open' ? 'bg-green-500/10 text-green-400' :
                    companion.status === 'filled' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {statusLabel(companion.status)}
                  </span>
                </div>
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-txt-sec" />
                  {companion.destination_country}
                  {companion.destination_city && `, ${companion.destination_city}`}
                </h3>
                <div className="flex items-center gap-4 text-sm text-txt-sec mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(companion.departure_date)}
                    {companion.return_date && ` → ${formatDate(companion.return_date)}`}
                  </span>
                  {companion.interests?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {companion.interests.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(companion.id)}
                disabled={deleting === companion.id}
                className="p-2 text-txt-sec hover:text-red-400 transition-colors shrink-0 disabled:opacity-50"
                title={t('deleteBtn')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
