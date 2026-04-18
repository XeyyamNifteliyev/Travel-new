create policy "Users can delete own messages"
  on messages for delete
  using (auth.uid() = sender_id);

create policy "Users can delete own conversations"
  on conversations for delete
  using (auth.uid() = ad_owner_id or auth.uid() = user_id);
