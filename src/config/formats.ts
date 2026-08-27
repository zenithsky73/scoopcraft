import type { OutputFormat } from '@prisma/client';

export type FormatSpec = {
  id: OutputFormat;
  label: string;
  short: string;
  ratio: string;
  width: number;
  height: number;
  /** Area yang berpotensi tertutup UI platform (px pada canvas asli). */
  safe: { top: number; bottom: number; x: number };
};

export const FORMAT_SPECS: Record<OutputFormat, FormatSpec> = {
  FEED_SQUARE: {
    id: 'FEED_SQUARE',
    label: 'Feed Square',
    short: '1:1',
    ratio: '1 / 1',
    width: 1080,
    height: 1080,
    safe: { top: 80, bottom: 80, x: 80 },
  },
  FEED_PORTRAIT: {
    id: 'FEED_PORTRAIT',
    label: 'Feed Portrait',
    short: '4:5',
    ratio: '4 / 5',
    width: 1080,
    height: 1350,
    safe: { top: 90, bottom: 90, x: 90 },
  },
  STORY: {
    id: 'STORY',
    label: 'Story',
    short: '9:16',
    ratio: '9 / 16',
    width: 1080,
    height: 1920,
    // ~250px atas & bawah tertutup header/footer UI Instagram & WA Story.
    safe: { top: 250, bottom: 250, x: 80 },
  },
};

export const FORMAT_LIST = Object.values(FORMAT_SPECS);
export const DEFAULT_FORMATS: OutputFormat[] = ['FEED_SQUARE', 'STORY'];
