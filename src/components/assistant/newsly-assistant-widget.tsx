'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const INITIAL_SUGGESTIONS = [
  { label: '📺 Buat dari YouTube', query: 'Bagaimana cara membuat carousel dari link video YouTube di Newsly?' },
  { label: '💎 Paket & Kuota Pro', query: 'Berapa harga dan apa saja keuntungan paket Kreator Pro?' },
  { label: '✨ Ganti Watermark Brand', query: 'Bagaimana cara mengganti watermark Newsly dengan akun brand saya sendiri?' },
  { label: '📄 Ekspor PDF LinkedIn', query: 'Bagaimana cara ekspor carousel ke format PDF untuk LinkedIn?' },
  { label: '🔥 Tips Hook Slide 1', query: 'Beri saya tips membuat hook dan cover slide 1 yang viral dan memancing klik!' },
];

export function NewslyAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! Saya **Newsly Copilot** 🚀, asisten resmi Newsly AI.\n\nSaya siap memandu kamu seputar pembuatan carousel, memilih template, ganti watermark, ekspor LinkedIn PDF, hingga info paket langganan. Ada yang ingin kamu tanyakan?',
      timestamp: 'Sekarang',
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Jangan tampilkan widget di halaman canvas render headless
  const isRenderCanvas = pathname?.startsWith('/render');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (isRenderCanvas) return null;

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat jawaban dari asisten.');
      }

      const botReply: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'Maaf, terjadi kendala saat memproses jawaban. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errorReply: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content:
          'Maaf, terjadi kendala teknis saat menghubungi server Newsly Copilot. Silakan tanyakan kembali beberapa saat lagi!',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: String(Date.now()),
        role: 'assistant',
        content:
          'Obrolan telah direset! ✨\n\nAda pertanyaan lain seputar platform Newsly AI yang bisa saya bantu jawab?',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper parser markdown sederhana untuk format bold, list, dan line-breaks
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet points
          const isBullet = line.startsWith('- ') || line.startsWith('* ');
          const isNumbered = /^\d+\.\s/.test(line);

          // Parse bold **text**
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-indigo-300 dark:text-indigo-200">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-indigo-400 select-none">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          if (isNumbered) {
            return (
              <div key={idx} className="pl-1">
                {formattedLine}
              </div>
            );
          }

          return <div key={idx}>{formattedLine}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {/* 1. Floating Action Button when collapsed */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka Asisten Newsly AI"
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Tanya Newsly AI ⚡
            </span>
          </button>
        </div>
      )}

      {/* 2. Chat Window when open */}
      {isOpen && (
        <div className="relative w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh] rounded-[28px] bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800/80 dark:border-slate-800 shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white font-black text-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-100">Newsly Copilot</h3>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Asisten Resmi Newsly AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={handleResetChat}
                title="Reset Obrolan"
                className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Obrolan"
                className="p-2 rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions (Carousel Chips) */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-2">
            {INITIAL_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800/70 hover:bg-indigo-900/40 border border-slate-700/50 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-indigo-200 transition-all flex-shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5 max-w-[86%]',
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-300 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 shadow-md',
                      isUser
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none text-xs sm:text-sm font-medium'
                        : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                    )}
                  >
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                    <div
                      className={cn(
                        'text-[9px] mt-1.5 font-medium opacity-60 flex items-center gap-1',
                        isUser ? 'justify-end text-white/80' : 'text-slate-400'
                      )}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 max-w-[80%] mr-auto">
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                </div>
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan apa saja seputar Newsly AI..."
                className="flex-1 bg-slate-950/70 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all shadow-md shadow-indigo-600/20 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Khusus topik Newsly AI • Didukung Gemini AI Engine
            </p>
          </div>
        </div>
      )}
    </div>
  );
}