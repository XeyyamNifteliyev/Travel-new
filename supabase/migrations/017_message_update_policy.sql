create policy "Users can update own messages"
  on messages for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);
