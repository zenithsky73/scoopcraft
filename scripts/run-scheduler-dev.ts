/**
 * Development Cron Scheduler Runner
 * 
 * Script ini berguna untuk mengeksekusi scheduler lokal secara berkala
 * (misalnya setiap 30 detik) saat mengembangkan fitur auto-post di komputer lokal.
 * 
 * Cara menjalankan:
 * npx ts-node scripts/run-scheduler-dev.ts
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';
const INTERVAL_SECONDS = 30;

console.log('====================================================');
console.log('🚀 Newsly AI Auto-Post Scheduler Worker (Dev Mode)');
console.log(`📡 Polling endpoint: ${APP_URL}/api/cron/publish`);
console.log(`⏱️ Interval: Setiap ${INTERVAL_SECONDS} detik`);
console.log('====================================================\n');

async function triggerCron() {
  const timestamp = new Date().toLocaleTimeString('id-ID');
  try {
    const res = await fetch(`${APP_URL}/api/cron/publish`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (res.ok) {
      if (data.count && data.count > 0) {
        console.log(`[${timestamp}] ⚡ BERHASIL MEMPROSES ${data.count} POSTINGAN JATUH TEMPO!`);
        console.log(JSON.stringify(data.results, null, 2));
      } else {
        console.log(`[${timestamp}] 💤 Standby — Tidak ada postingan yang jatuh tempo.`);
      }
    } else {
      console.warn(`[${timestamp}] ⚠️ Worker Error:`, data?.error || res.statusText);
    }
  } catch (error: any) {
    console.error(`[${timestamp}] ❌ Koneksi gagal: ${error?.message || 'Server offline'}`);
  }
}

// Jalankan segera sekali saat script dimulai
triggerCron();

// Ulangi setiap INTERVAL_SECONDS
setInterval(triggerCron, INTERVAL_SECONDS * 1000);
