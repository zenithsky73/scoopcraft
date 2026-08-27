/**
 * Render kanvas desain jadi PNG tanpa database:
 *   npx tsx scripts/render.ts                       # semua kombinasi gaya × format
 *   npx tsx scripts/render.ts --guides              # dengan garis bantu safe zone
 *   npx tsx scripts/render.ts --slides 5        # render seluruh carousel
 *   npx tsx scripts/render.ts --headline "..." --image https://... --handle @redaksikita
 *
 * Butuh dev server hidup di APP_URL (default http://localhost:3000).
 */
import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderCanvasAtUrl } from '../src/server/design/renderer';
import { closeBrowser } from '../src/server/browser';
import { IMPLEMENTED_STYLES } from '../src/server/design/tokens';
import { FORMAT_SPECS } from '../src/config/formats';

const STYLES = (process.env.RENDER_STYLES
  ? process.env.RENDER_STYLES.split(',')
  : IMPLEMENTED_STYLES) as typeof IMPLEMENTED_STYLES;
const FORMATS = ['FEED_SQUARE', 'STORY'] as const;

async function main() {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const index = args.indexOf(`--${name}`);
    return index === -1 ? undefined : args[index + 1];
  };

  const base = process.env.APP_URL ?? 'http://localhost:3000';
  const outDir = path.join(process.cwd(), 'tmp', 'design');
  await mkdir(outDir, { recursive: true });

  for (const style of STYLES) {
    for (const format of FORMATS) {
      const spec = FORMAT_SPECS[format];
      const params = new URLSearchParams({ style, format });
      if (args.includes('--guides')) params.set('guides', '1');
      for (const key of ['headline', 'feedCopy', 'cta', 'source', 'image', 'images', 'handle', 'displayName'] as const) {
        const value = flag(key);
        if (value) params.set(key, value);
      }

      const slideCount = Math.max(1, Number(flag('slides') ?? 1));
      params.set('slides', String(slideCount));

      for (let slide = 0; slide < slideCount; slide++) {
        params.set('slide', String(slide));
        const url = `${base}/render/preview?${params.toString()}`;
        const { buffer, durationMs } = await renderCanvasAtUrl({ url, width: spec.width, height: spec.height });

        const suffix = slideCount > 1 ? `-s${slide + 1}` : '';
        const file = path.join(outDir, `${style.toLowerCase()}-${format.toLowerCase()}${suffix}.png`);
        await writeFile(file, buffer);
        console.log(
          `${style.padEnd(14)} ${format.padEnd(13)} ${slideCount > 1 ? `slide ${slide + 1}/${slideCount}` : 'tunggal    '}  ${(buffer.length / 1024).toFixed(0).padStart(4)}KB  ${durationMs}ms  → ${path.relative(process.cwd(), file)}`,
        );
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
