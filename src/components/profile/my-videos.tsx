'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Video, ExternalLink, Loader2 } from 'lucide-react';

export function MyVideos() {
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', youtubeUrl: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('youtube_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setVideos(data);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const videoId = extractVideoId(formData.youtubeUrl);
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

    const { error } = await supabase.from('youtube_links').insert({
      user_id: user.id,
      youtube_url: formData.youtubeUrl,
      title: formData.title,
      description: formData.description || null,
      thumbnail_url: thumbnail,
      language: locale as 'az' | 'ru' | 'en',
      status: 'active',
      views: 0,
      likes: 0,
    });

    if (!error) {
      const { data } = await supabase.from('youtube_links').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data) setVideos(data);
      setShowForm(false);
      setFormData({ title: '', youtubeUrl: '', description: '' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu videonu silmək istədiyinizə əminsiniz?')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('youtube_links').delete().eq('id', id).eq('user_id', user?.id);
    if (error) {
      alert('Silmək alınmadı');
    } else {
      setVideos((prev) => prev.filter((v) => v.id !== id));
    }
    setDeleting(null);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-48 bg-bg-surface rounded-xl" /><div className="h-48 bg-bg-surface rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Videolarım</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Video Əlavə Et
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-surface rounded-xl p-6 border border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Başlıq</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Video başlığı"
              required
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">YouTube Linki</label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Açıqlama (opsional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Video haqqında qısa məlumat"
              rows={2}
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Yadda Saxla
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-txt-sec hover:text-white transition-colors"
            >
              Ləğv Et
            </button>
          </div>
        </form>
      )}

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-8 border border-border text-center">
          <Video className="w-12 h-12 text-txt-muted mx-auto mb-3" />
          <p className="text-txt-sec mb-4">Hələ videonuz yoxdur</p>
          <button onClick={() => setShowForm(true)} className="text-primary hover:underline">
            İlk videonuzu əlavə edin →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video) => {
            const videoId = extractVideoId(video.youtube_url);
            return (
              <div key={video.id} className="bg-bg-surface rounded-xl border border-border overflow-hidden">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-bg-base/50 flex items-center justify-center">
                    <Video className="w-10 h-10 text-txt-muted" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  {video.description && <p className="text-sm text-txt-sec mt-1 line-clamp-2">{video.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      YouTube-da bax
                    </a>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={deleting === video.id}
                       className="p-1.5 text-txt-sec hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
