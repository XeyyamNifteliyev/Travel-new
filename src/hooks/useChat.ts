'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types/chat';

export function useChat(userId: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const fetchBlockedUsers = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', userId);
    setBlockedUsers((data || []).map(b => b.blocked_id));
  }, [supabase, userId]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, ad_id, ad_owner_id, user_id, created_at,
        owner:profiles!conversations_ad_owner_id_fkey(name, avatar_url),
        participant:profiles!conversations_user_id_fkey(name, avatar_url),
        messages(id, message_text, created_at, sender_id)
      `)
      .or(`ad_owner_id.eq.${userId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) { setError(error.message); return; }

    const enriched = (data || []).map((conv) => {
      const otherUserId = conv.ad_owner_id === userId ? conv.user_id : conv.ad_owner_id;
      const rawOwner = Array.isArray(conv.owner) ? conv.owner[0] : conv.owner;
      const rawParticipant = Array.isArray(conv.participant) ? conv.participant[0] : conv.participant;
      const otherProfile = conv.ad_owner_id === userId ? rawParticipant : rawOwner;
      const msgs = (conv.messages as Array<{ message_text: string; created_at: string; sender_id: string }>) || [];
      const lastMsg = msgs[msgs.length - 1];

      return {
        id: conv.id,
        ad_id: conv.ad_id,
        ad_owner_id: conv.ad_owner_id,
        user_id: conv.user_id,
        created_at: conv.created_at,
        other_user: { id: otherUserId, name: String((otherProfile as Record<string, unknown> | null)?.name || 'İstifadəçi'), avatar_url: ((otherProfile as Record<string, unknown> | null)?.avatar_url as string | null) ?? undefined },
        last_message: lastMsg ? { text: lastMsg.message_text, created_at: lastMsg.created_at, sender_id: lastMsg.sender_id } : undefined,
      };
    });

    setConversations(enriched);
    setLoading(false);
  }, [supabase, userId]);

  const fetchMessages = useCallback(async (convId: string) => {
    setActiveConversation(convId);
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, message_text, created_at, is_edited, sender_profile:profiles!messages_sender_id_fkey(name, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) { setError(error.message); return; }

    const enriched = (data || []).map((msg) => {
      const rawSender = Array.isArray(msg.sender_profile) ? msg.sender_profile[0] : msg.sender_profile;
      const sender = rawSender as Record<string, unknown> | null;
      return {
        ...msg,
        sender_profile: undefined,
        sender: { name: String(sender?.name || 'İstifadəçi'), avatar_url: (sender?.avatar_url as string | null) ?? undefined },
      };
    });

    setMessages(enriched);
  }, [supabase]);

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
    await fetchMessages(convId);
  }, [fetchMessages, supabase, userId]);

  const deleteMessage = useCallback(async (msgId: string) => {
    if (!userId) return false;
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', msgId)
      .eq('sender_id', userId);
    if (error) { setError(error.message); return false; }
    setMessages(prev => prev.filter(m => m.id !== msgId));
    return true;
  }, [supabase, userId]);

  const editMessage = useCallback(async (msgId: string, newText: string) => {
    if (!userId || !newText.trim()) return false;
    const { error } = await supabase
      .from('messages')
      .update({ message_text: newText.trim() })
      .eq('id', msgId)
      .eq('sender_id', userId);
    if (error) { setError(error.message); return false; }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message_text: newText.trim(), is_edited: true } : m));
    return true;
  }, [supabase, userId]);

  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from('messages').delete().eq('conversation_id', convId);
    const { error } = await supabase.from('conversations').delete().eq('id', convId);
    if (error) { setError(error.message); return false; }
    setActiveConversation(null);
    setMessages([]);
    await fetchConversations();
    return true;
  }, [fetchConversations, supabase]);

  const blockUser = useCallback(async (blockedId: string) => {
    if (!userId) return false;
    const { error } = await supabase
      .from('blocked_users')
      .insert({ blocker_id: userId, blocked_id: blockedId });
    if (error) { setError(error.message); return false; }
    setBlockedUsers(prev => [...prev, blockedId]);
    return true;
  }, [supabase, userId]);

  const unblockUser = useCallback(async (blockedId: string) => {
    if (!userId) return false;
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', blockedId);
    if (error) { setError(error.message); return false; }
    setBlockedUsers(prev => prev.filter(id => id !== blockedId));
    return true;
  }, [supabase, userId]);

  const isUserBlocked = useCallback((otherUserId: string) => {
    return blockedUsers.includes(otherUserId);
  }, [blockedUsers]);

  const startConversation = useCallback(async (adId: string, adOwnerId: string) => {
    if (!userId) return null;
    if (userId === adOwnerId) { setError('Özünüzə mesaj yaza bilməzsiniz'); return null; }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('ad_owner_id', adOwnerId)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (existing) return existing.id;

    const { data, error } = await supabase
      .from('conversations')
      .insert({ ad_id: adId, ad_owner_id: adOwnerId, user_id: userId })
      .select('id')
      .single();

    if (error) { setError(error.message); return null; }
    return data?.id;
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversation}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.conversation_id === activeConversation) {
            const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', newMsg.sender_id).single();
            setMessages(prev => [...prev, { ...newMsg, sender: { name: profile?.name || 'İstifadəçi', avatar_url: profile?.avatar_url } }]);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversation, fetchConversations, supabase, userId]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
      fetchBlockedUsers();
    }
  }, [fetchBlockedUsers, fetchConversations, userId]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    error,
    blockedUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    deleteConversation,
    blockUser,
    unblockUser,
    isUserBlocked,
    startConversation,
    setActiveConversation,
    setError,
  };
}
