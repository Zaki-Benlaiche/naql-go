"use client";
import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Msg = {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
};

export function ChatPanel({ requestId, myRole }: { requestId: string; myRole: "CLIENT" | "TRANSPORTER" }) {
  const { tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  async function load() {
    const res = await fetch(`/api/orders/${requestId}/messages`);
    if (res.ok) {
      const data: Msg[] = await res.json();
      setMsgs(data);
      if (!open) {
        const newCount = data.length - prevCountRef.current;
        if (newCount > 0) setUnread(u => u + newCount);
      }
      prevCountRef.current = data.length;
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch(`/api/orders/${requestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText("");
    setSending(false);
    await load();
  }

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center relative"
      >
        <MessageCircle className="w-4 h-4" />
        {tr("chat_open")}
        {unread > 0 && (
          <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="mt-3 border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">{tr("chat_title")}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-blue-600 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-56 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {msgs.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">{tr("chat_empty")}</p>
            ) : (
              msgs.map(m => {
                const isMe = m.senderRole === myRole;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      isMe ? "bg-blue-500 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm"
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-semibold text-gray-500 mb-0.5">{m.senderName}</p>
                      )}
                      <p className="text-sm leading-snug">{m.text}</p>
                      <p className={`text-[10px] mt-0.5 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex gap-2 p-3 border-t border-gray-100 bg-white">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={tr("chat_placeholder")}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              maxLength={500}
            />
            <button type="submit" disabled={sending || !text.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-2 rounded-xl transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
