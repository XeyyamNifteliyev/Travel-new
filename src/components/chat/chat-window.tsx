'use client';

import type { Message } from '@/types/chat';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  otherUserName: string;
  onSend: (text: string) => void;
  sending: boolean;
}

export function ChatWindow({ messages, currentUserId, otherUserName, onSend, sending }: ChatWindowProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || sending) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">{otherUserName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-txt-muted">
            <p>Yazışmaya başlayın</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-bg-surface border border-border rounded-bl-sm'
                }`}>
                  {!isOwn && (
                    <p className="text-xs font-medium text-primary mb-0.5">{msg.sender?.name || otherUserName}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message_text}</p>
                  <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-txt-muted'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-bg-base/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
