/**
 * Uji scraper tanpa server & tanpa database:
 *   npx tsx scripts/scrape.ts <url> [--browser] [--full]
 */
import { extractArticle, isScrapeError } from '../src/server/scraper';

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((arg) => !arg.startsWith('--'));
  const forceBrowser = args.includes('--browser');
  const full = args.includes('--full');

  if (!url) {
    console.error('Pakai: npx tsx scripts/scrape.ts <url> [--browser] [--full]');
    process.exit(1);
  }

  try {
    const article = await extractArticle({ url, forceBrowser });

    console.log('─'.repeat(72));
    console.log('Judul     :', article.title);
    console.log('Sumber    :', article.source, '·', article.url);
    console.log('Penulis   :', article.author ?? '—');
    console.log('Terbit    :', article.publishedAt ?? '—');
    console.log('Bahasa    :', article.lang ?? '—');
    console.log('Gambar    :', article.imageUrl ?? '—');
    console.log('Metode    :', article.scrapedVia, `· ${article.wordCount} kata · ${article.durationMs}ms`);
    if (article.warnings.length) console.log('Catatan   :', article.warnings.join(' | '));
    console.log('─'.repeat(72));
    console.log(full ? article.content : `${article.content.slice(0, 600)}…`);
  } catch (err) {
    if (isScrapeError(err)) {
      console.error(`GAGAL [${err.code}] ${err.message}`);
      if (err.detail) console.error('detail:', err.detail);
      process.exit(2);
    }
    throw err;
  }
}

main().then(() => process.exit(0));
