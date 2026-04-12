'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { BlogFormData } from '@/types/blog';

interface BlogEditorProps {
  onSave: (data: BlogFormData) => void;
}

export function BlogEditor({ onSave }: BlogEditorProps) {
  const t = useTranslations('blog');
  const params = useParams();
  const locale = params?.locale as string;
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: t('writeContent') }),
    ],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePublish = async () => {
    if (!editor || !title) return;
    setSaving(true);
    try {
      const content = editor.getHTML();
      await onSave({
        title,
        content,
        language: locale as 'az' | 'ru' | 'en',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: 'published',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('writeTitle')}
        className="w-full bg-bg-surface border border-border rounded-lg px-4 py-3 text-xl font-semibold focus:border-primary focus:outline-none"
      />
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="w-full bg-bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <div className="bg-bg-surface border border-border rounded-lg p-4 min-h-75">
        <EditorContent editor={editor} className="prose prose-invert max-w-none" />
      </div>
      <button
        onClick={handlePublish}
        disabled={saving || !title}
        className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
      >
        {saving ? 'Publishing...' : t('publish')}
      </button>
    </div>
  );
}
