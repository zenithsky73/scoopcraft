'use client';

import * as React from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  Youtube,
  Crown,
  Layers,
  FileDown,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const SUGGESTIONS = [
  {
    icon: Youtube,
    title: 'Bikin dari YouTube',
    desc: 'Cara ekstrak video YouTube jadi carousel',
    query: 'Bagaimana cara membuat carousel dari link video YouTube di Newsly?',
  },
  {
    icon: Crown,
    title: 'Paket & Kuota Pro',
    desc: 'Harga dan keuntungan paket Kreator Pro',
    query: 'Berapa harga dan apa saja keuntungan paket Kreator Pro di Newsly?',
  },
  {
    icon: Sparkles,
    title: 'Ganti Watermark',
    desc: 'Pakai @handle dan logo brand sendiri',
    query: 'Bagaimana cara mengganti watermark Newsly dengan akun brand saya sendiri?',
  },
  {
    icon: FileDown,
    title: 'Ekspor PDF LinkedIn',
    desc: 'Download dokumen carousel multi-halaman',
    query: 'Bagaimana cara ekspor carousel ke format PDF untuk upload di LinkedIn?',
  },
  {
    icon: Flame,
    title: 'Tips Hook Viral',
    desc: 'Formula cover slide 1 penarik atensi',
    query: 'Beri saya tips membuat hook dan cover slide 1 yang viral dan memancing klik di Instagram!',
  },
  {
    icon: Layers,
    title: '20 Gaya Template',
    desc: 'Pilihan gaya visual & kecocokan konten',
    query: 'Apa saja 20 gaya template visual yang ada di Newsly dan cara memilihnya?',
  },
];

export default function AssistantPage() {
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo kreator! Saya **Newsly Copilot** 🚀, asisten AI resmi dan eksklusif untuk platform **Newsly AI**.\n\nSaya diprogram khusus untuk menjawab seluruh hal seputar Newsly: mulai dari cara generate carousel dari link YouTube/berita, tips memilih 20 template, mengatur watermark brand, hingga ekspor PDF LinkedIn.\n\nAda yang ingin kamu tanyakan hari ini?',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: String(Date.now()),
        role: 'assistant',
        content:
          'Obrolan telah direset! ✨\n\nSilakan tanyakan pertanyaan seputar fitur, cara pakai, atau paket langganan di Newsly AI.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Parser markdown sederhana untuk bold, list, bullet
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-sm sm:text-[15px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }

          const isBullet = line.startsWith('- ') || line.startsWith('* ');
          const isNumbered = /^\d+\.\s/.test(line);

          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-indigo-600 dark:text-indigo-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-3">
                <span className="text-indigo-500 font-bold select-none">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          if (isNumbered) {
            return (
              <div key={idx} className="pl-2">
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
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-800/60">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white flex-shrink-0">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight">Newsly Copilot</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
                Asisten AI Resmi Newsly. Bertanya apa saja tentang pembuatan carousel, template, brand kit, dan strategi konten!
              </p>
            </div>
          </div>

          <Button
            onClick={handleResetChat}
            variant="ghost"
            size="sm"
            className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Obrolan
          </Button>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Suggested Question Chips (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.query)}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left group shadow-sm hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <item.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Main Chat Stream Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[560px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 max-w-[88%] sm:max-w-[80%]',
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-3xl px-5 py-4 shadow-sm',
                    isUser
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-sm font-medium'
                      : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                  )}
                >
                  {isUser ? <p className="text-sm sm:text-[15px]">{msg.content}</p> : renderFormattedText(msg.content)}
                  <div
                    className={cn(
                      'text-[10px] mt-2 font-medium opacity-60 flex items-center gap-1',
                      isUser ? 'justify-end text-white/80' : 'text-slate-500 dark:text-slate-400'
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
            <div className="flex items-center gap-3 max-w-[80%] mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-3xl rounded-bl-sm px-5 py-4 flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" />
                <span
                  className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan apa saja seputar Newsly AI (fitur, cara buat carousel, tips viral, harga)..."
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Hanya menjawab topik seputar platform Newsly AI
            </span>
            <span className="hidden sm:inline">Ditenagai oleh Gemini AI Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}