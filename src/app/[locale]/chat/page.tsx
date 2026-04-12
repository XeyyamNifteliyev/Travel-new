'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useChat } from '@/hooks/useChat';
import { ChatList } from '@/components/chat/chat-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

function ChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const {
    conversations,
    messages,
    activeConversation,
    loading: chatLoading,
    sending,
    error,
    fetchMessages,
    sendMessage,
    setActiveConversation,
    setError,
  } = useChat(user?.id);

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
  };

  const handleBack = () => {
    setMobileShowChat(false);
    setActiveConversation(null);
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-surface rounded w-48" />
          <div className="h-64 bg-bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Mesajlar</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Bağla</button>
        </div>
      )}

      <div className="bg-bg-surface rounded-2xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Yazışmalar</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ChatList
                conversations={conversations}
                activeId={activeConversation}
                onSelect={handleSelect}
                loading={chatLoading}
              />
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            {activeConv ? (
              <>
                <button
                  onClick={handleBack}
                  className="md:hidden flex items-center gap-2 p-3 border-b border-border text-sm text-txt-sec"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Geri
                </button>
                <ChatWindow
                  messages={messages}
                  currentUserId={user.id}
                  otherUserName={activeConv.other_user?.name || 'İstifadəçi'}
                  onSend={(text) => sendMessage(activeConv.id, text)}
                  sending={sending}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-txt-muted">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Yazışma seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
