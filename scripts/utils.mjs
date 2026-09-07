import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(__dirname, '..');

export const FONT_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
export const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export async function readConfig() {
  return JSON.parse(await fs.readFile(path.join(root, 'config/profile.json'), 'utf8'));
}

export async function writeGenerated(name, content) {
  const dir = path.join(root, 'generated');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), content.replace(/\r\n/g, '\n'), 'utf8');
}

export function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function truncate(value, max = 62) {
  const text = String(value ?? '').trim();
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export function bar(value, max, width = 180) {
  if (!max || value <= 0) return 0;
  return Math.max(3, Math.round((value / max) * width));
}
