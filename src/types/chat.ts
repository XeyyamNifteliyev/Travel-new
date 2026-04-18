export interface Conversation {
  id: string;
  ad_id: string | null;
  ad_owner_id: string;
  user_id: string;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: {
    text: string;
    created_at: string;
    sender_id: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  is_edited?: boolean;
  sender?: {
    name: string;
    avatar_url?: string;
  };
}
