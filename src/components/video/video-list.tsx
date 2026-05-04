'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { YouTubeLink, YouTubeFormData } from '@/types/youtube';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/supabase-helpers';
import {
  Play, Plus, X, Loader2, MapPin, Calendar, Eye,
  Heart, ExternalLink, Video
} from 'lucide-react';
import { toast } from 'sonner';

const COUNTRIES = [
  'Türkiyə', 'Dubai', 'Rusiya', 'Gürcüstan', 'İran',
  'Tailand', 'Yaponiya', 'Almaniya', 'Fransa', 'İtaliya',
  'İspaniya', 'Misir', 'Maldiv', 'Bali', 'Koreya',
  'Azərbaycan'
];

export default function VideosPage() {
  const t = useTranslations('youtube');
  const supabase = createBrowserClient();

  const [videos, setVideos] = useState<YouTubeLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');

  const [formData, setFormData] = useState<YouTubeFormData>({
    youtubeUrl: '',
    title: '',
    description: '',
    destinationCountry: '',
    destinationCity: '',
    language: 'az',
  });

  useEffect(() => {
    fetchVideos();
    checkAuth();
  }, [filterCountry]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchVideos() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCountry) params.set('country', filterCountry);

    const res = await fetch(`/api/youtube?${params}`);
    const data = await res.json();
    setVideos(data.videos || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowForm(false);
      fetchVideos();
      setFormData({
        youtubeUrl: '',
        title: '',
        description: '',
        destinationCountry: '',
        destinationCity: '',
        language: 'az',
      });
    } else {
      const data = await res.json();
      toast.error(data.error || 'Xəta baş verdi');
    }
  }

  function extractVideoId(url: string | undefined | null): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return match ? match[1] : null;
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-txt flex items-center gap-3">
              <Video className="w-8 h-8 text-red-400" />
              {t('title')}
            </h1>
            <p className="text-txt-sec mt-1">{t('subtitle')}</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {showForm ? t('cancel') : t('addVideo')}
            </button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-txt">{t('addVideo')}</h2>
              <button onClick={() => setShowForm(false)} className="text-txt-sec hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">{t('youtubeUrl')}</label>
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={e => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder={t('urlPlaceholder')}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">{t('videoTitle')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">{t('destination')}</label>
                  <select
                    value={formData.destinationCountry}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
                  >
                    <option value="">Seçin</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-sec mb-2">Dil</label>
                  <select
                    value={formData.language}
                    onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as 'az' | 'ru' | 'en' }))}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt"
                  >
                    <option value="az">AZ</option>
                    <option value="ru">RU</option>
                    <option value="en">EN</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-txt-sec mb-2">Əlavə qeyd</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-txt focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                {t('addVideo')}
              </button>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="bg-bg-input border border-border rounded-xl px-4 py-2.5 text-txt"
          >
            <option value="">Bütün ölkələr</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-txt-muted mx-auto mb-4" />
            <p className="text-txt-sec text-lg">{t('noVideos')}</p>
            <p className="text-txt-muted text-sm mt-1">{t('noVideosSub')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => {
              const videoId = extractVideoId(video.youtubeUrl);
              return (
                <div
                  key={video.id}
                  className="bg-card-bg backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:border-red-500/50 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-bg-input overflow-hidden">
                    <Image
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      fill
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <Play className="w-6 h-6 text-white ml-1" />
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-txt font-semibold mb-2 line-clamp-2">{video.title}</h3>

                    <div className="flex items-center gap-2 text-sm text-txt-sec mb-3">
                      {video.destinationCountry && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {video.destinationCountry}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {video.likes}
                      </span>
                    </div>

                    {video.author && (
                      <div className="flex items-center gap-2 text-sm text-txt-sec mb-3">
                        <div className="w-6 h-6 bg-bg-surface-hover rounded-full flex items-center justify-center text-xs">
                          {video.author.name?.[0] || 'A'}
                        </div>
                        {video.author.name}
                      </div>
                    )}

                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('watch')}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
