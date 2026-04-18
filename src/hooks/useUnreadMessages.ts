'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const UNREAD_EVENT = 'travelaz-unread-changed';

export function useUnreadMessages(userId: string | null) {
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const getLastSeen = useCallback((convId: string) => {
    try {
      const data = localStorage.getItem(`chat_seen_${convId}`);
      return data ? new Date(data) : null;
    } catch {
      return null;
    }
  }, []);

  const markAsSeen = useCallback((convId: string) => {
    try {
      localStorage.setItem(`chat_seen_${convId}`, new Date().toISOString());
      window.dispatchEvent(new Event(UNREAD_EVENT));
    } catch {}
  }, []);

  const fetchUnread = useCallback(async (uid: string) => {
    const { data: convs } = await supabase
      .from('conversations')
      .select('id')
      .or(`ad_owner_id.eq.${uid},user_id.eq.${uid}`);

    if (!convs || convs.length === 0) {
      setUnreadCount(0);
      return;
    }

    let total = 0;
    for (const conv of convs) {
      const lastSeen = getLastSeen(conv.id);

      let query = supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', uid);

      if (lastSeen) {
        query = query.gt('created_at', lastSeen.toISOString());
      }

      const { count } = await query;
      total += count ?? 0;
    }

    setUnreadCount(total);
  }, [supabase, getLastSeen]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    fetchUnread(userId);

    const handleUnreadChange = () => {
      if (userId) fetchUnread(userId);
    };

    window.addEventListener(UNREAD_EVENT, handleUnreadChange);

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          if (userId) fetchUnread(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener(UNREAD_EVENT, handleUnreadChange);
    };
  }, [userId, fetchUnread]);

  return { unreadCount, markAsSeen };
}
