'use client';

import * as React from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  ExternalLink,
  Bot,
  Calendar,
  Clock,
  Laptop,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { cn, formatDate } from '@/lib/utils';
import { notify } from '@/lib/notify';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string | Date;
  lastUsedAt: string | Date | null;
}

export function ApiKeysTab() {
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [keyName, setKeyName] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createdRawKey, setCreatedRawKey] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedConfig, setCopiedConfig] = React.useState(false);
  const [copiedPath, setCopiedPath] = React.useState(false);
  const [selectedOS, setSelectedOS] = React.useState<'windows' | 'mac' | 'cursor'>('windows');

  const fetchKeys = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/api-keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName.trim() || 'Claude Desktop Key' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat API Key.');

      setCreatedRawKey(data.key.rawKey);
      setKeyName('');
      fetchKeys();
      notify.celebrate('API Key Berhasil Dibuat! 🎉', 'Salin kunci Anda dan simpan di tempat aman.');
    } catch (err: any) {
      notify.error('Gagal Membuat API Key', err.message || 'Terjadi kesalahan.');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus API Key "${name}"? Integrasi Claude atau AI Agent yang menggunakan kunci ini akan terputus.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/user/api-keys/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        notify.info('API Key Dihapus', `Kunci "${name}" telah dinonaktifkan.`);
        fetchKeys();
      }
    } catch (err: any) {
      notify.error('Gagal Menghapus', err.message);
    }
  };

  const handleCopy = (text: string, type: 'key' | 'config' | 'path') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'config') {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } else if (type === 'path') {
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    }
    notify.info('Tersalin! 📋', 'Berhasil disalin ke papan klip.');
  };

  // Generate Sample JSON for Claude Desktop
  const activeKeyPlaceholder = createdRawKey || (keys.length > 0 ? keys[0].keyPrefix : 'instadeck_live_xxxxxxxxxxxxxxxxxxxxxxxx');

  const getClaudeConfigJson = () => {
    return JSON.stringify(
      {
        mcpServers: {
          instadeck: {
            command: 'node',
            args: ['bin/instadeck-mcp.js'],
            env: {
              INSTADECK_API_KEY: activeKeyPlaceholder,
              INSTADECK_API_URL: 'https://pro.instadeck.id/api/mcp',
            },
          },
        },
      },
      null,
      2
    );
  };

  const getPathForOS = () => {
    if (selectedOS === 'windows') return '%APPDATA%\\Claude\\claude_desktop_config.json';
    if (selectedOS === 'mac') return '~/Library/Application Support/Claude/claude_desktop_config.json';
    return '.cursor/mcp.json';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-primary/10 to-purple-600/10 border border-amber-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
              <Bot className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Model Context Protocol (MCP)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Integrasi Claude Desktop, Cursor &amp; AI Agents
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Hubungkan Claude AI atau AI Agent lainnya langsung ke akun InstaDeck Anda. Perintahkan Claude untuk membuat carousel visual, mencarikan foto, dan menjadwalkan postingan sosial media secara otomatis melalui chat.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setCreatedRawKey(null);
              setShowCreateModal(true);
            }}
            className="rounded-2xl px-5 py-6 bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 shrink-0 flex items-center gap-2"
          >
            <Plus className="size-4" />
            <span>Buat API Key Baru</span>
          </Button>
        </div>
      </div>

      {/* Active API Keys List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Daftar API Key Aktif ({keys.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Memuat daftar API Key...
          </div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-800">
            <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
              <Key className="size-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Belum ada API Key yang aktif.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Buat API Key pertama Anda untuk mulai menghubungkan InstaDeck ke Claude Desktop atau custom tools.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl font-bold text-xs"
            >
              + Buat API Key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {k.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                      {k.keyPrefix}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" />
                      Dibuat: {formatDate(k.createdAt)}
                    </span>
                    <span>•</span>
                    <span>
                      Terakhir dipakai: {k.lastUsedAt ? formatDate(k.lastUsedAt) : 'Belum pernah'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeKey(k.id, k.name)}
                    className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl h-8 px-3"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Hapus Key
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Claude Desktop Setup Guide */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Terminal className="size-5 text-primary" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Panduan Pemasangan di Claude Desktop
          </h3>
        </div>

        {/* Step 1: Select OS */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">1</span>
            <span>Pilih Sistem Operasi Anda:</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedOS('windows')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5',
                selectedOS === 'windows'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              )}
            >
              <Laptop className="size-3.5" /> Windows
            </button>
            <button
              type="button"
              onClick={() => setSelectedOS('mac')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5',
                selectedOS === 'mac'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              )}
            >
              🍎 macOS
            </button>
            <button
              type="button"
              onClick={() => setSelectedOS('cursor')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5',
                selectedOS === 'cursor'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              )}
            >
              ⚡ Cursor IDE
            </button>
          </div>
        </div>

        {/* Step 2: Open Config File Path */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">2</span>
            <span>Buka File Konfigurasi di Komputer Anda:</span>
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200">
            <span className="truncate flex-1">{getPathForOS()}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(getPathForOS(), 'path')}
              className="h-7 text-[10px] rounded-lg shrink-0"
            >
              {copiedPath ? <Check className="size-3 text-emerald-500 mr-1" /> : <Copy className="size-3 mr-1" />}
              {copiedPath ? 'Tersalin' : 'Salin Path'}
            </Button>
          </div>
        </div>

        {/* Step 3: Paste JSON Config */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">3</span>
              <span>Tempel Konfigurasi JSON Ini:</span>
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(getClaudeConfigJson(), 'config')}
              className="h-7 text-[10px] rounded-lg font-bold"
            >
              {copiedConfig ? <Check className="size-3 text-emerald-500 mr-1" /> : <Copy className="size-3 mr-1" />}
              {copiedConfig ? 'Konfigurasi Tersalin!' : 'Salin Konfigurasi JSON'}
            </Button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
            {getClaudeConfigJson()}
          </pre>
        </div>

        {/* Step 4: Sample Prompts */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Wand2 className="size-4 text-amber-600" />
            <span>Contoh Perintah yang Bisa Anda Ketik di Claude:</span>
          </div>
          <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-semibold italic">"Claude, buatkan carousel 5 slide tentang 5 Rahasia Bumbu Rendang Daging pakai template KULINER_NUSANTARA dan jadwalkan besok jam 19.00 WIB ke Instagram."</span>
            </li>
            <li>
              <span className="font-semibold italic">"Claude, tolong cek jadwal postingan saya minggu ini di kalender InstaDeck."</span>
            </li>
            <li>
              <span className="font-semibold italic">"Claude, buatkan carousel edukasi tips investasi saham pakai template NOTION_MINIMAL."</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal Dialog: Buat API Key Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            {!createdRawKey ? (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                    <Key className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Buat API Key Baru
                    </h3>
                    <p className="text-xs text-slate-500">
                      Beri nama pengenal untuk kunci integrasi ini.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="keyName" className="text-xs font-bold">
                    Nama Kunci (Label)
                  </Label>
                  <Input
                    id="keyName"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Contoh: Claude Desktop Laptop"
                    className="rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="rounded-xl text-xs font-bold bg-primary text-white"
                  >
                    {creating ? 'Membuat...' : 'Buat Sekarang'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-600">
                  <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      API Key Berhasil Dibuat!
                    </h3>
                    <p className="text-xs text-slate-500">
                      Salin dan simpan sekarang.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Penting:</strong> Kunci ini hanya akan ditampilkan <strong>satu kali ini saja</strong> demi keamanan. Pastikan Anda menyalinnya sekarang.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kunci Rahasia API Anda:
                  </Label>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all select-all">
                    {createdRawKey}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => handleCopy(createdRawKey, 'key')}
                    className="w-full rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 h-10 shadow-md"
                  >
                    {copiedKey ? <Check className="size-4" /> : <Copy className="size-4" />}
                    <span>{copiedKey ? 'Kunci Berhasil Disalin!' : 'Salin Kunci API'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreatedRawKey(null);
                    }}
                    className="w-full rounded-xl text-xs font-bold h-9"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
