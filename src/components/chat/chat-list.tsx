'use client';

import type { Conversation } from '@/types/chat';
import { MessageCircle, Trash2, ShieldBan } from 'lucide-react';
import { useState } from 'react';

interface ChatListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onBlock: (userId: string, name: string) => void;
  blockedUsers: string[];
  loading: boolean;
}

export function ChatList({ conversations, activeId, onSelect, onDelete, onBlock, blockedUsers, loading }: ChatListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse p-4 rounded-xl">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-full bg-bg-surface/50" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-bg-surface/50 rounded w-24" />
                <div className="h-3 bg-bg-surface/50 rounded w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-surface/50 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-txt-muted/40" />
        </div>
        <p className="text-txt-sec font-medium">Hələ yazışmanız yoxdur</p>
        <p className="text-txt-muted text-sm mt-1">Elan səhifəsindən mesaj göndərin</p>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    }
    if (days === 1) return 'Dünən';
    if (days < 7) return date.toLocaleDateString('az-AZ', { weekday: 'short' });
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const isActive = activeId === conv.id;
        const initial = conv.other_user?.name?.[0]?.toUpperCase() || 'U';
        const otherId = conv.other_user?.id || '';
        const isBlocked = blockedUsers.includes(otherId);
        const isConfirmingDelete = confirmDelete === conv.id;
        const isConfirmingBlock = confirmBlock === conv.id;

        if (isConfirmingDelete) {
          return (
            <div key={conv.id} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-txt mb-3">Söhbəti silmək istəyirsiniz?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); setConfirmDelete(null); }}
                  className="flex-1 py-2 text-xs bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Sil
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                  className="flex-1 py-2 text-xs bg-bg-surface text-txt-sec rounded-lg font-medium hover:bg-bg-surface-hover transition-colors"
                >
                  Ləğv et
                </button>
              </div>
            </div>
          );
        }

        if (isConfirmingBlock) {
          return (
            <div key={conv.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-txt mb-3">
                {isBlocked
                  ? `${conv.other_user?.name} blokdan çıxarılsın?`
                  : `${conv.other_user?.name} bloklansın?`
                }
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onBlock(otherId, conv.other_user?.name || ''); setConfirmBlock(null); }}
                  className="flex-1 py-2 text-xs bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                >
                  {isBlocked ? 'Çıxar' : 'Blokla'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmBlock(null); }}
                  className="flex-1 py-2 text-xs bg-bg-surface text-txt-sec rounded-lg font-medium hover:bg-bg-surface-hover transition-colors"
                >
                  Ləğv et
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={conv.id}
            className={`relative p-4 rounded-xl transition-all duration-300 group/item ${
              isActive
                ? 'bg-primary/10 border-l-4 border-primary'
                : 'hover:bg-white/5'
            }`}
          >
            <div
              className="flex gap-4 cursor-pointer"
              onClick={() => onSelect(conv.id)}
            >
              <div className="relative flex-shrink-0">
                {conv.other_user?.avatar_url ? (
                  <img
                    src={conv.other_user.avatar_url}
                    alt={conv.other_user?.name || ''}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
                    {initial}
                  </div>
                )}
                {!isBlocked && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-bg-base" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`font-semibold truncate ${isActive ? 'text-primary' : 'text-txt group-hover/item:text-primary'} transition-colors`}>
                    {conv.other_user?.name || 'İstifadəçi'}
                    {isBlocked && (
                      <span className="ml-2 text-[10px] text-amber-400 font-normal">bloklanıb</span>
                    )}
                  </h3>
                  {conv.last_message && (
                    <span className="text-[10px] text-txt-muted shrink-0 ml-2 uppercase tracking-wider">
                      {formatTime(conv.last_message.created_at)}
                    </span>
                  )}
                </div>
                {conv.last_message ? (
                  <p className="text-sm text-txt-sec truncate">
                    {conv.last_message.sender_id === conv.user_id && (
                      <span className="text-primary/70">Siz: </span>
                    )}
                    {conv.last_message.text}
                  </p>
                ) : (
                  <p className="text-xs text-txt-muted">Yeni yazışma</p>
                )}
              </div>
            </div>

            {/* Action buttons - visible on hover */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmBlock(conv.id); }}
                className={`p-1.5 rounded-lg transition-colors ${isBlocked ? 'text-amber-400 hover:bg-amber-500/20' : 'text-txt-muted hover:text-amber-400 hover:bg-amber-500/10'}`}
                title={isBlocked ? 'Blokdan çıxar' : 'Blokla'}
              >
                <ShieldBan className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(conv.id); }}
                className="p-1.5 rounded-lg text-txt-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Söhbəti sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
