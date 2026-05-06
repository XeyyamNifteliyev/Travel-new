'use client';

import type { Message } from '@/types/chat';
import { useTranslations } from 'next-intl';
import { Send, Loader2, Info, CheckCheck, Trash2, ShieldBan, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  otherUser?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  onSend: (text: string) => void;
  onEditMessage: (msgId: string, newText: string) => Promise<boolean>;
  onDeleteMessage: (msgId: string) => void;
  onDeleteConversation: () => void;
  onBlockUser: (userId: string) => void;
  isBlocked: boolean;
  sending: boolean;
}

export function ChatWindow({
  messages, currentUserId, otherUser, onSend,
  onEditMessage, onDeleteMessage, onDeleteConversation, onBlockUser, isBlocked, sending,
}: ChatWindowProps) {
  const [text, setText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number; isOwn: boolean } | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showConvMenu, setShowConvMenu] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmDeleteConv, setConfirmDeleteConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const otherUserName = otherUser?.name || 'İstifadəçi';
  const t = useTranslations('chat');

  const handleSend = () => {
    if (!text.trim() || sending || isBlocked) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, msgId: string, isOwn: boolean) => {
    e.preventDefault();
    setContextMenu({ msgId, x: e.clientX, y: e.clientY, isOwn });
  };

  const startEditing = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    setEditingMsgId(msgId);
    setEditText(msg.message_text);
    setContextMenu(null);
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const saveEdit = async () => {
    if (!editingMsgId || !editText.trim()) return;
    await onEditMessage(editingMsgId, editText.trim());
    setEditingMsgId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  useEffect(() => {
    const close = () => { setContextMenu(null); setShowConvMenu(false); setConfirmBlock(false); setConfirmDeleteConv(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDivider = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    return date.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' });
  };

  const shouldShowDateDivider = (msg: Message, index: number) => {
    if (index === 0) return true;
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    const currDate = new Date(msg.created_at).toDateString();
    return prevDate !== currDate;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-panel h-20 px-8 flex justify-between items-center border-b border-border/10 shrink-0 relative">
        <div className="flex items-center gap-4">
          {otherUser?.avatar_url ? (
            <Image src={otherUser.avatar_url} alt={otherUserName} width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary">
              {otherUserName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold text-txt leading-tight">{otherUserName}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="text-[11px] text-txt-sec uppercase tracking-widest">
                {isBlocked ? t('statusBlocked') : t('statusActive')}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowConvMenu(!showConvMenu); }}
            className="text-txt-muted hover:text-primary p-2.5 rounded-xl transition-all hover:bg-primary/10"
          >
            <Info className="w-5 h-5" />
          </button>

          {showConvMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-bg-surface border border-border rounded-2xl shadow-2xl py-2 z-50" onClick={e => e.stopPropagation()}>
              {!confirmDeleteConv ? (
                <button
                  onClick={() => setConfirmDeleteConv(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('deleteConversation')}
                </button>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-xs text-txt-sec mb-2">{t('deleteConversationConfirm')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onDeleteConversation(); setShowConvMenu(false); }} className="flex-1 py-1.5 text-xs bg-red-500 text-white rounded-lg font-medium">{t('delete')}</button>
                    <button onClick={() => setConfirmDeleteConv(false)} className="flex-1 py-1.5 text-xs bg-bg-base text-txt-sec rounded-lg font-medium">{t('cancel')}</button>
                  </div>
                </div>
              )}

              {!confirmBlock ? (
                <button
                  onClick={() => setConfirmBlock(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <ShieldBan className="w-4 h-4" />
                  {isBlocked ? t('unblock') : t('blockUser')}
                </button>
              ) : (
                <div className="px-4 py-2">
                  <p className="text-xs text-txt-sec mb-2">{otherUserName} {isBlocked ? t('unblockConfirm', { name: '' }).replace('?', '') : t('blockConfirm', { name: '' }).replace('?', '')}?</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onBlockUser(otherUser?.id || ''); setShowConvMenu(false); }} className="flex-1 py-1.5 text-xs bg-amber-500 text-white rounded-lg font-medium">
                      {isBlocked ? t('unblock') : t('block')}
                    </button>
                    <button onClick={() => setConfirmBlock(false)} className="flex-1 py-1.5 text-xs bg-bg-base text-txt-sec rounded-lg font-medium">{t('cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scrollbar p-8 flex flex-col gap-5">
        {isBlocked && (
          <div className="flex justify-center my-4">
            <span className="px-4 py-2 bg-amber-500/10 text-amber-400 text-xs rounded-full font-medium">
              {t('blockedBanner')}
            </span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-surface/50 flex items-center justify-center">
                <Send className="w-7 h-7 text-txt-muted/30" />
              </div>
              <p className="text-txt-sec font-medium">{t('startConversation')}</p>
              <p className="text-txt-muted text-sm mt-1">{t('startConversationSub')}</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender_id === currentUserId;
            const showDivider = shouldShowDateDivider(msg, index);
            const isEditing = editingMsgId === msg.id;

            return (
              <div key={msg.id}>
                {showDivider && (
                  <div className="flex justify-center items-center gap-4 my-4">
                    <div className="h-px flex-grow bg-border/10" />
                    <span className="text-[10px] text-txt-muted uppercase tracking-[0.2em]">
                      {formatDateDivider(msg.created_at)}
                    </span>
                    <div className="h-px flex-grow bg-border/10" />
                  </div>
                )}

                {isEditing ? (
                  <div className="self-end max-w-[70%] ml-auto">
                    <div className="bg-bg-surface border border-primary/30 p-3 rounded-2xl">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-txt text-sm"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={cancelEdit} className="px-3 py-1 text-xs text-txt-sec hover:text-txt rounded-lg">{t('cancel')}</button>
                        <button onClick={saveEdit} className="px-3 py-1 text-xs bg-primary text-white rounded-lg font-medium">{t('saveEdit')}</button>
                      </div>
                    </div>
                  </div>
                ) : isOwn ? (
                  <div
                    className="flex flex-col items-end gap-1 self-end max-w-[70%] ml-auto group cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, msg.id, true)}
                  >
                    <div className="chat-bubble-sent p-4 rounded-t-[2rem] rounded-bl-[2rem] rounded-br-lg text-sm leading-relaxed shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                      {msg.message_text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 mr-1">
                      <span className="text-[10px] text-txt-muted">{formatTime(msg.created_at)}</span>
                      {msg.is_edited && (
                        <span className="text-[10px] text-primary/60">{t('edited')}</span>
                      )}
                      <CheckCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-end gap-3 max-w-[70%] group cursor-pointer"
                    onContextMenu={(e) => handleContextMenu(e, msg.id, false)}
                  >
                    {otherUser?.avatar_url ? (
                      <Image src={otherUser.avatar_url} alt={otherUserName} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {otherUserName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="chat-bubble-received p-4 rounded-t-[2rem] rounded-br-[2rem] rounded-bl-lg text-txt text-sm leading-relaxed">
                        {msg.message_text}
                      </div>
                      <span className="text-[10px] text-txt-muted mt-1 ml-1 block">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[60] bg-bg-surface border border-border rounded-2xl shadow-2xl py-1 min-w-[160px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 180), top: Math.min(contextMenu.y, window.innerHeight - 120) }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.isOwn && (
            <button
              onClick={() => startEditing(contextMenu.msgId)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-txt-sec hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {t('edit')}
            </button>
          )}
          <button
            onClick={() => { onDeleteMessage(contextMenu.msgId); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t('delete')}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="glass-panel p-6 border-t border-border/10 shrink-0">
        <div className="flex items-center gap-3 bg-bg-surface/50 p-2 pl-4 rounded-full border border-border/20 focus-within:border-primary/50 transition-all duration-300">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isBlocked ? t('placeholderBlocked') : t('placeholderDefault')}
            disabled={isBlocked}
            className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none text-txt placeholder:text-txt-muted text-sm py-3 min-w-0 disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending || isBlocked}
            className="bg-primary hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 shrink-0"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
