import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { ScrapeError } from '@/server/scraper/errors';

/**
 * Guard SSRF. Aplikasi ini mengambil URL sembarang dari user, jadi setiap
 * hop redirect harus divalidasi ulang — bukan hanya URL pertama.
 */

const BLOCKED_HOSTNAMES = new Set(['localhost', 'metadata.google.internal', 'instance-data']);

function ipv4ToInt(ip: string) {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function inRange(ip: string, cidr: string) {
  const [range, bitsRaw] = cidr.split('/');
  const bits = Number(bitsRaw);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(range) & mask);
}

const PRIVATE_V4 = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10', // CGNAT
  '127.0.0.0/8',
  '169.254.0.0/16', // link-local, termasuk metadata cloud 169.254.169.254
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '224.0.0.0/4',
  '240.0.0.0/4',
];

export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return PRIVATE_V4.some((cidr) => inRange(ip, cidr));

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // IPv4-mapped (::ffff:10.0.0.1) diperiksa sebagai IPv4.
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);

    if (normalized === '::' || normalized === '::1') return true;
    if (/^f[cd]/.test(normalized)) return true; // fc00::/7 unique-local
    if (/^fe[89ab]/.test(normalized)) return true; // fe80::/10 link-local
    return false;
  }

  return true; // format tak dikenal → tolak
}

/** Menerima "kompas.com/x" maupun URL lengkap; mengembalikan URL ternormalisasi. */
export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) throw new ScrapeError('INVALID_URL');

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new ScrapeError('INVALID_URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ScrapeError('INVALID_URL', `protocol ${url.protocol}`);
  }
  // Kredensial di URL sering dipakai untuk menyamarkan host tujuan.
  if (url.username || url.password) throw new ScrapeError('BLOCKED_HOST', 'credentials in url');
  if (!url.hostname) throw new ScrapeError('INVALID_URL');

  url.hash = '';
  return url;
}

/** Menolak host internal. Dipanggil untuk setiap hop redirect. */
export async function assertPublicUrl(url: URL): Promise<void> {
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new ScrapeError('BLOCKED_HOST', host);
  }

  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new ScrapeError('BLOCKED_HOST', host);
    return;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true });
  } catch {
    throw new ScrapeError('FETCH_FAILED', `dns lookup gagal: ${host}`);
  }

  if (addresses.length === 0) throw new ScrapeError('FETCH_FAILED', `dns kosong: ${host}`);
  // Tolak kalau SALAH SATU alamat privat (mitigasi DNS rebinding sederhana).
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new ScrapeError('BLOCKED_HOST', `${host} → ${address}`);
  }
}
