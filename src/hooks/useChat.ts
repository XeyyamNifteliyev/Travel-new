'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types/chat';

export function useChat(userId: string | null) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`ad_owner_id.eq.${userId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) { setError(error.message); return; }

    // Enrich with other user info and last message
    const enriched = await Promise.all((data || []).map(async (conv) => {
      const otherUserId = conv.ad_owner_id === userId ? conv.user_id : conv.ad_owner_id;
      const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', otherUserId).single();
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('message_text, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...conv,
        other_user: { id: otherUserId, name: profile?.name || 'İstifadəçi', avatar_url: profile?.avatar_url },
        last_message: lastMsg ? { text: lastMsg.message_text, created_at: lastMsg.created_at, sender_id: lastMsg.sender_id } : undefined,
      };
    }));

    setConversations(enriched);
    setLoading(false);
  }, [userId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setActiveConversation(convId);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) { setError(error.message); return; }

    // Enrich with sender info
    const enriched = await Promise.all((data || []).map(async (msg) => {
      const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', msg.sender_id).single();
      return { ...msg, sender: { name: profile?.name || 'İstifadəçi', avatar_url: profile?.avatar_url } };
    }));

    setMessages(enriched);
  }, []);

  // Send message
  const sendMessage = useCallback(async (convId: string, text: string) => {
    if (!userId || !text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: userId,
      message_text: text.trim(),
    });
    if (error) { setError(error.message); setSending(false); return; }
    setSending(false);
  }, [userId]);

  // Start or get existing conversation
  const startConversation = useCallback(async (adId: string, adOwnerId: string) => {
    if (!userId) return null;
    if (userId === adOwnerId) { setError('Özünüzə mesaj yaza bilməzsiniz'); return null; }

    // Check existing
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_id', adId)
      .eq('ad_owner_id', adOwnerId)
      .eq('user_id', userId)
      .single();

    if (existing) return existing.id;

    // Create new
    const { data, error } = await supabase
      .from('conversations')
      .insert({ ad_id: adId, ad_owner_id: adOwnerId, user_id: userId })
      .select('id')
      .single();

    if (error) { setError(error.message); return null; }
    return data?.id;
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (activeConversation && newMsg.conversation_id === activeConversation) {
            const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', newMsg.sender_id).single();
            setMessages(prev => [...prev, { ...newMsg, sender: { name: profile?.name || 'İstifadəçi', avatar_url: profile?.avatar_url } }]);
          }
          // Refresh conversations to update last message
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, activeConversation]);

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    setActiveConversation,
    setError,
  };
}
