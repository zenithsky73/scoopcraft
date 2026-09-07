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
  const [mounted, setMounted] = React.useState(false);
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

  React.useEffect(() => {
    setMounted(true);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-newsly-copilot', handleOpen);
    return () => window.removeEventListener('open-newsly-copilot', handleOpen);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Sembunyikan saat belum dimuat, di rute render canvas, atau saat sedang berada di halaman /assistant
  if (!mounted || pathname?.startsWith('/render') || pathname === '/assistant') {
    return null;
  }

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
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[9999] font-sans">
      {/* 1. Chat Window when open (Small & Compact) */}
      {isOpen && (
        <div className="relative mb-2 w-[310px] sm:w-[330px] h-[430px] max-h-[72vh] rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800 shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Bot className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-slate-100 truncate">Newsly Copilot</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 text-slate-400">
              <button
                onClick={handleResetChat}
                title="Reset Obrolan"
                className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup Obrolan"
                className="p-1 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions (Compact Chips) */}
          <div className="px-2.5 py-1.5 bg-slate-950/50 border-b border-slate-800/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {INITIAL_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                className="whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-800/70 hover:bg-indigo-900/40 border border-slate-700/50 hover:border-indigo-500/40 text-[10px] text-slate-300 hover:text-indigo-200 transition-all flex-shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2 max-w-[90%]',
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-xl px-3 py-2 shadow-sm',
                      isUser
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none font-medium'
                        : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                    )}
                  >
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                    <div
                      className={cn(
                        'text-[8px] mt-1 opacity-60 flex items-center gap-1',
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
              <div className="flex items-center gap-1.5 max-w-[80%] mr-auto">
                <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span
                    className="size-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-2 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya seputar Newsly..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-1.5 rounded-xl bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 active:scale-95 transition-all shadow-sm flex-shrink-0"
              >
                <Send className="size-3.5" />
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-500 mt-1">
              Khusus topik Newsly AI
            </p>
          </div>
        </div>
      )}

      {/* 2. Small Floating Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup Asisten AI' : 'Buka Asisten AI'}
          className={cn(
            'relative flex items-center justify-center size-11 sm:size-12 rounded-full text-white shadow-lg transition-all duration-200 border border-white/20 active:scale-90',
            isOpen
              ? 'bg-slate-800 hover:bg-slate-700 shadow-black/40'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-105 shadow-indigo-500/30'
          )}
        >
          {isOpen ? (
            <X className="size-5 text-slate-200" />
          ) : (
            <>
              <Bot className="size-5 text-white" />
              <span className="absolute top-0 right-0 size-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}