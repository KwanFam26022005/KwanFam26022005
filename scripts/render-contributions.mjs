import { FONT_MONO, FONT_SANS, readConfig, writeGenerated } from './utils.mjs';

const config = await readConfig();
const username = config.username;
const url = `https://github.com/users/${encodeURIComponent(username)}/contributions`;

const response = await fetch(url, {
  headers: {
    'User-Agent': 'kwanfam26022005-profile-renderer',
    Accept: 'text/html'
  }
});

if (!response.ok) {
  throw new Error(`Contribution page ${response.status}: ${url}`);
}

const html = await response.text();
const cells = [];

for (const match of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
  const tag = match[0];
  const date = tag.match(/data-date="([^"]+)"/)?.[1];
  const level = Number(tag.match(/data-level="([0-4])"/)?.[1] ?? 0);
  if (date) cells.push({ date, level });
}

if (cells.length < 300) {
  throw new Error(`Contribution parser found only ${cells.length} calendar cells`);
}

cells.sort((a, b) => a.date.localeCompare(b.date));
const days = cells.slice(-371);
const firstDate = new Date(`${days[0].date}T00:00:00Z`);
const startDow = firstDate.getUTCDay();

const padX = 118;
const padY = 98;
const cell = 10;
const gap = 3;
const step = cell + gap;
const width = 960;
const height = 240;
const colors = ['#0b1726', '#12395a', '#167da5', '#38bdf8', '#5eead4'];

const rects = days.map((day, i) => {
  const offset = i + startDow;
  const week = Math.floor(offset / 7);
  const dow = offset % 7;
  const x = padX + week * step;
  const y = padY + dow * step;
  return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${colors[day.level]}"><title>${day.date} · level ${day.level}</title></rect>`;
}).join('\n');

const monthLabels = [];
let lastMonth = '';
for (let i = 0; i < days.length; i++) {
  const d = new Date(`${days[i].date}T00:00:00Z`);
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  if (month !== lastMonth && d.getUTCDate() <= 7) {
    const offset = i + startDow;
    const week = Math.floor(offset / 7);
    monthLabels.push(`<text x="${padX + week * step}" y="84" class="month">${month}</text>`);
    lastMonth = month;
  }
}

const updated = new Date().toISOString().slice(0, 10);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${username} contribution heatmap">
<style>
  text { font-family: ${FONT_MONO}; }
  .mono { font-family: ${FONT_MONO}; }
  .sans { font-family: ${FONT_SANS}; }
  .prompt { font-family: ${FONT_MONO}; font-size: 11px; fill: #78a8c4; }
  .title { font-family: ${FONT_SANS}; font-size: 17px; font-weight: 700; fill: #f8fafc; }
  .month { font-family: ${FONT_MONO}; font-size: 9px; fill: #55788f; }
  .day { font-family: ${FONT_MONO}; font-size: 9px; fill: #55788f; }
  .small { font-family: ${FONT_MONO}; font-size: 9px; fill: #55788f; }
</style>
<rect width="${width}" height="${height}" rx="18" fill="#06111f"/>
<rect x="12" y="12" width="936" height="216" rx="14" fill="#081829" stroke="#153a55"/>
<text x="30" y="36" class="mono prompt">khoa@github:~$ git log --activity</text>
<rect x="254" y="26" width="6" height="12" rx="1" fill="#5eead4">
  <animate attributeName="opacity" values="1;.12;1" dur="1.15s" repeatCount="indefinite"/>
</rect>
<text x="30" y="60" class="sans title">Contribution signal</text>
<text x="810" y="36" class="mono small">updated ${updated}</text>
${monthLabels.join('\n')}
<text x="78" y="${padY + 1 * step + 8}" class="mono day">Mon</text>
<text x="78" y="${padY + 3 * step + 8}" class="mono day">Wed</text>
<text x="78" y="${padY + 5 * step + 8}" class="mono day">Fri</text>
${rects}
<g transform="translate(725 204)" class="mono small">
  <text x="0" y="0">less</text>
  ${colors.map((c, i) => `<rect x="${34 + i * 16}" y="-9" width="10" height="10" rx="2" fill="${c}"/>`).join('')}
  <text x="121" y="0">more</text>
</g>
</svg>`;

await writeGenerated('contrib-heatmap.svg', svg);
