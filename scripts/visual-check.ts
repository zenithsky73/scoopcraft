/**
 * Uji visual engine tanpa database:
 *   npx tsx scripts/visual-check.ts
 *
 * Memeriksa penilaian gambar artikel, lalu membuat dua gambar dengan prompt
 * berbeda memakai provider yang aktif di .env — dua prompt supaya terlihat
 * apakah tiap slide benar-benar dapat gambar berbeda.
 */
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { assessArticleImage } from '../src/server/images/relevance';
import { getImageProvider, ImageProviderError } from '../src/server/images/provider';
import { closeBrowser } from '../src/server/browser';

const CASES = [
  'https://img.antaranews.com/cache/1200x800/2026/08/27/1080.jpg',
  'https://www.antaranews.com/assets/img/logo-antaranews.png',
  'https://example.com/tidak-ada.jpg',
];

const PROMPTS = [
  'Bank Indonesia headquarters exterior at dusk, editorial photography, muted palette, cinematic, no text',
  'A young Indonesian couple reviewing mortgage documents at a kitchen table, warm morning light, editorial photography, muted palette, no text',
];

async function main() {
  console.log('── Penilaian gambar artikel ' + '─'.repeat(44));
  for (const url of CASES) {
    const a = await assessArticleImage(url);
    console.log(
      `${a.usable ? 'PAKAI ' : 'TOLAK '} skor ${a.score.toFixed(2)}  ${a.width ?? '?'}×${a.height ?? '?'}  ${url.slice(0, 58)}`,
    );
    a.reasons.forEach((r) => console.log(`         ${r}`));
  }

  const provider = await getImageProvider();
  console.log('\n── Provider gambar ' + '─'.repeat(53));
  console.log(`Aktif    : ${provider.name}  (IMAGE_PROVIDER=${process.env.IMAGE_PROVIDER ?? 'local'})`);
  console.log(`Tersedia : ${provider.isAvailable()}`);

  if (!provider.isAvailable()) {
    console.log('\nKredensial belum diisi di .env — pembuatan gambar dilewati.');
    return;
  }

  const dir = path.join(process.cwd(), 'tmp', 'design');
  await mkdir(dir, { recursive: true });

  for (const [index, prompt] of PROMPTS.entries()) {
    const startedAt = Date.now();
    try {
      const image = await provider.generate({ prompt, width: 1080, height: 1920, seed: `check#${index}` });
      const file = path.join(dir, `provider-${index}.png`);
      await writeFile(file, image.buffer);
      console.log(
        `\n[${index}] OK  ${(image.buffer.length / 1024).toFixed(0)}KB  ${Date.now() - startedAt}ms  ${image.provider}\n     ${path.relative(process.cwd(), file)}`,
      );
    } catch (err) {
      if (err instanceof ImageProviderError) {
        console.error(`\n[${index}] GAGAL (${err.provider}, layak diulang: ${err.retryable})\n     ${err.message}`);
      } else {
        console.error(`\n[${index}] GAGAL`, err);
      }
    }
  }
}

main()
  .then(async () => {
    await closeBrowser();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await closeBrowser();
    process.exit(1);
  });
