'use client';

import type { Conversation } from '@/types/chat';
import { MessageCircle, Clock } from 'lucide-react';

interface ChatListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function ChatList({ conversations, activeId, onSelect, loading }: ChatListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-bg-surface rounded-xl p-4">
            <div className="h-4 bg-bg-base/50 rounded w-24 mb-2" />
            <div className="h-3 bg-bg-base/50 rounded w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-txt-muted mx-auto mb-3" />
        <p className="text-txt-sec">Hələ yazışmanız yoxdur</p>
        <p className="text-txt-muted text-sm mt-1">Elan səhifəsindən mesaj göndərin</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full text-left p-4 rounded-xl transition-colors ${
            activeId === conv.id
              ? 'bg-primary/10 border border-primary/30'
              : 'bg-bg-surface border border-border hover:border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
              {conv.other_user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">{conv.other_user?.name || 'İstifadəçi'}</span>
                {conv.last_message && (
                  <span className="text-xs text-txt-muted flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.last_message.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
              {conv.last_message ? (
                <p className="text-sm text-txt-sec truncate">
                  {conv.last_message.sender_id === conv.user_id ? 'Siz: ' : ''}{conv.last_message.text}
                </p>
              ) : (
                <p className="text-xs text-txt-muted">Yeni yazışma</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
