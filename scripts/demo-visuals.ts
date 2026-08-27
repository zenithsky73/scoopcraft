/** Membuat gambar contoh berbeda per slide untuk pratinjau desain. */
import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getImageProvider } from '../src/server/images/provider';
import { closeBrowser } from '../src/server/browser';

const PROMPTS = [
  'Bank Indonesia headquarters exterior at dusk, editorial photography, muted palette, cinematic',
  'Close up of Indonesian rupiah banknotes on a desk beside a laptop, editorial photography, muted palette',
  'A young couple reviewing mortgage documents at a kitchen table, warm morning light, editorial photography',
  'Empty modern meeting room with long table, soft window light, editorial photography, muted palette',
];

async function main() {
  const provider = await getImageProvider();
  const dir = path.join(process.cwd(), 'public', 'generated', 'demo');
  await mkdir(dir, { recursive: true });

  for (const [index, prompt] of PROMPTS.entries()) {
    const image = await provider.generate({ prompt, width: 1080, height: 1920, seed: `demo#${index}` });
    const file = path.join(dir, `slide-${index}.png`);
    await writeFile(file, image.buffer);
    console.log(`slide-${index}.png  ${(image.buffer.length / 1024).toFixed(0)}KB  ${provider.name}`);
  }
}

main()
  .then(async () => { await closeBrowser(); process.exit(0); })
  .catch(async (e) => { console.error(e); await closeBrowser(); process.exit(1); });
