'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@/types/supabase-helpers';
import { useChat } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageCircle, ArrowLeft, Loader2, Search } from 'lucide-react';

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('chat');

  const markConvAsSeen = (convId: string) => {
    try {
      localStorage.setItem(`chat_seen_${convId}`, new Date().toISOString());
      window.dispatchEvent(new Event('travelaz-unread-changed'));
    } catch {}
  };

  const {
    conversations,
    messages,
    activeConversation,
    loading: chatLoading,
    sending,
    error,
    blockedUsers,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteConversation,
    blockUser,
    unblockUser,
    isUserBlocked,
    setActiveConversation,
    setError,
  } = useChat(user?.id ?? null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/auth/login`);
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const convId = searchParams.get('conv');
    if (convId) {
      setActiveConversation(convId);
      fetchMessages(convId);
      setMobileShowChat(true);
    }
  }, [user]);

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    fetchMessages(id);
    setMobileShowChat(true);
    markConvAsSeen(id);
  };

  const handleBack = () => {
    setMobileShowChat(false);
    setActiveConversation(null);
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_message?.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="space-y-3 w-80">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-full bg-bg-surface/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-bg-surface/50 rounded w-24" />
                    <div className="h-3 bg-bg-surface/50 rounded w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm backdrop-blur-xl flex items-center gap-3">
          {error}
          <button onClick={() => setError(null)} className="underline font-medium">{t('close')}</button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`w-full md:w-96 flex-shrink-0 flex flex-col border-r border-border/10 bg-bg-base ${
        mobileShowChat ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-xs text-txt-muted">{t('conversationsCount', { count: conversations.length })}</p>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted group-focus-within:text-primary transition-colors" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-bg-surface/80 border-none rounded-full py-3.5 pl-11 pr-6 text-sm text-txt placeholder:text-txt-muted focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder={t('searchPlaceholder')}
              type="text"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto chat-scrollbar px-2 pb-4">
          <ChatList
            conversations={filteredConversations}
            activeId={activeConversation}
            onSelect={handleSelect}
            onDelete={(convId) => {
              deleteConversation(convId);
              if (activeConversation === convId) {
                setMobileShowChat(false);
              }
            }}
            onBlock={(userId) => {
              if (isUserBlocked(userId)) {
                unblockUser(userId);
              } else {
                blockUser(userId);
              }
            }}
            blockedUsers={blockedUsers}
            loading={chatLoading}
          />
        </div>
      </aside>

      {/* Chat Window */}
      <section className={`flex-1 flex flex-col relative bg-bg-base overflow-hidden ${
        !mobileShowChat ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConv ? (
          <>
            <button
              onClick={handleBack}
              className="md:hidden flex items-center gap-2 p-4 border-b border-border/10 text-sm text-txt-sec"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
            <ChatWindow
              messages={messages}
              currentUserId={user.id}
              otherUser={activeConv.other_user}
              onSend={(text) => sendMessage(activeConv.id, text)}
              onEditMessage={(msgId, newText) => editMessage(msgId, newText)}
              onDeleteMessage={(msgId) => deleteMessage(msgId)}
              onDeleteConversation={() => {
                deleteConversation(activeConv.id);
                setMobileShowChat(false);
              }}
              onBlockUser={(uid) => {
                if (isUserBlocked(uid)) {
                  unblockUser(uid);
                } else {
                  blockUser(uid);
                }
              }}
              isBlocked={!!activeConv.other_user?.id && isUserBlocked(activeConv.other_user.id)}
              sending={sending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-bg-surface/50 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-txt-muted/40" />
              </div>
              <p className="text-txt-sec font-medium">{t('selectConversation')}</p>
              <p className="text-txt-muted text-sm mt-1">{t('selectConversationSub')}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
