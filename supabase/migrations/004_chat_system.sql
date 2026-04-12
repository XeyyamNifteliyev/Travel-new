-- Private Chat System
-- conversations: 1:1 chat between 2 users about a specific ad/listing

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid,
  ad_owner_id uuid references auth.users(id) not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  unique(ad_id, ad_owner_id, user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  message_text text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_conversations_owner on conversations(ad_owner_id);
create index if not exists idx_conversations_user on conversations(user_id);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_created on messages(created_at);

-- RLS
alter table conversations enable row level security;
alter table messages enable row level security;

-- Conversations policies
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = ad_owner_id or auth.uid() = user_id);

create policy "Users can create conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

-- Messages policies
create policy "Users can view messages in their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.ad_owner_id = auth.uid() or conversations.user_id = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and (conversations.ad_owner_id = auth.uid() or conversations.user_id = auth.uid())
    )
  );

-- Enable realtime
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
