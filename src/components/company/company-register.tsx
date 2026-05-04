'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/supabase-helpers';
import { Building2, CheckCircle, Loader2, Phone, Mail, Globe, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyRegister() {
  const t = useTranslations('company');
  const supabase = createBrowserClient();

  const [user, setUser] = useState<User | null>(null);
  const [existingCompany, setExistingCompany] = useState<{
    company_name: string;
    status: string;
    is_verified: boolean;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    plan_type: string;
    plan_expires_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    licenseNumber: '',
    description: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    email: '',
    website: '',
    planType: 'starter',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const res = await fetch(`/api/companies?userId=${user.id}`);
    const data = await res.json();
    if (data.companies?.length > 0) {
      setExistingCompany(data.companies[0]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setSubmitting(false);

    if (res.ok) {
      checkAuth();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Xəta baş verdi');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-base via-bg-surface to-bg-base flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  if (existingCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-base via-bg-surface to-bg-base">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-sky-400" />
              <div>
                <h1 className="text-2xl font-bold text-txt">{existingCompany.company_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    existingCompany.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : existingCompany.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {existingCompany.status === 'active' ? t('active') : existingCompany.status === 'pending' ? t('pending') : t('suspended')}
                  </span>
                  {existingCompany.is_verified && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      {t('verified')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {existingCompany.phone && (
                <div className="flex items-center gap-2 text-txt-sec">
                  <Phone className="w-4 h-4 text-txt-muted" />
                  {existingCompany.phone}
                </div>
              )}
              {existingCompany.whatsapp && (
                <div className="flex items-center gap-2 text-txt-sec">
                  <MessageCircle className="w-4 h-4 text-txt-muted" />
                  {existingCompany.whatsapp}
                </div>
              )}
              {existingCompany.email && (
                <div className="flex items-center gap-2 text-txt-sec">
                  <Mail className="w-4 h-4 text-txt-muted" />
                  {existingCompany.email}
                </div>
              )}
              {existingCompany.website && (
                <div className="flex items-center gap-2 text-txt-sec">
                  <Globe className="w-4 h-4 text-txt-muted" />
                  {existingCompany.website}
                </div>
              )}
            </div>

            <div className="bg-bg-surface/50 rounded-xl p-4">
              <p className="text-txt-sec text-sm">
                <span className="text-txt-muted">Plan:</span> {existingCompany.plan_type}
              </p>
              {existingCompany.plan_expires_at && (
                <p className="text-txt-sec text-sm mt-1">
                  <span className="text-txt-muted">Bitmə tarixi:</span> {new Date(existingCompany.plan_expires_at).toLocaleDateString('az-AZ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-base via-bg-surface to-bg-base">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-txt flex items-center gap-3">
            <Building2 className="w-8 h-8 text-sky-400" />
            {t('title')}
          </h1>
          <p className="text-txt-sec mt-1">{t('subtitle')}</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { key: 'starter', price: '50 AZN/ay', tours: '5 aktiv elan' },
            { key: 'pro', price: '120 AZN/ay', tours: '20 aktiv elan' },
            { key: 'premium', price: '250 AZN/ay', tours: 'Limitsiz elan' },
          ].map(plan => (
            <button
              key={plan.key}
              onClick={() => setFormData(prev => ({ ...prev, planType: plan.key as 'starter' | 'pro' | 'premium' }))}
              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                formData.planType === plan.key
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-border bg-card-bg hover:border-border'
              }`}
            >
              <h3 className="text-txt font-semibold capitalize">{t(plan.key)}</h3>
              <p className="text-sky-400 font-bold text-xl mt-2">{plan.price}</p>
              <p className="text-txt-sec text-sm mt-1">{plan.tours}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-2">{t('companyName')}</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-2">{t('licenseNumber')}</label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={e => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-sec mb-2">{t('phone')}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-sec mb-2">{t('whatsapp')}</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-sec mb-2">{t('telegram')}</label>
              <input
                type="text"
                value={formData.telegram}
                onChange={e => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-sec mb-2">{t('email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-2">{t('website')}</label>
            <input
              type="url"
              value={formData.website}
              onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-2">{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('pending')}...
              </>
            ) : (
              t('register')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
