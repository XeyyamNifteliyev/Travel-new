'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, Loader2, User, Camera, Video, Link as LinkIcon } from 'lucide-react';

export function ProfileSettings() {
  const params = useParams();
  const locale = params?.locale as string;
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar_url: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    facebook: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          instagram: data.instagram || '',
          youtube: data.youtube || '',
          tiktok: data.tiktok || '',
          facebook: data.facebook || '',
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase.from('profiles').update({
      name: formData.name,
      bio: formData.bio,
      avatar_url: formData.avatar_url,
      instagram: formData.instagram,
      youtube: formData.youtube,
      tiktok: formData.tiktok,
      facebook: formData.facebook,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setSaving(false);
    if (error) {
      setSaveMsg('Xəta baş verdi');
    } else {
      setSaveMsg('Yadda saxlanıldı!');
    }
    setTimeout(() => setSaveMsg(''), 3000);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-10 bg-bg-surface rounded" /><div className="h-10 bg-bg-surface rounded" /><div className="h-10 bg-bg-surface rounded" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tənzimləmələr</h2>

      <div className="bg-bg-surface rounded-xl border border-border divide-y divide-border">
        {/* Profile section */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil Məlumatları
          </h3>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Ad</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Social section */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Sosial Şəbəkələr
          </h3>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Instagram
            </label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@username"
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1 flex items-center gap-1">
              <Video className="w-3.5 h-3.5" /> YouTube
            </label>
            <input
              type="text"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              placeholder="youtube.com/c/..."
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">TikTok</label>
            <input
              type="text"
              value={formData.tiktok}
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
              placeholder="@username"
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-txt-sec mb-1">Facebook</label>
            <input
              type="text"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="facebook.com/..."
              className="w-full bg-bg-base/50 border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Yadda Saxla
      </button>
      {saveMsg && <p className={`text-sm ${saveMsg.includes('Xəta') ? 'text-red-400' : 'text-green-400'}`}>{saveMsg}</p>}
    </div>
  );
}
