import { getRepositories, offlineRepositories } from './github-data.mjs';
import { escapeXml, readConfig, truncate, writeGenerated } from './utils.mjs';

const config = await readConfig();
const repos = process.env.PROFILE_OFFLINE === '1'
  ? offlineRepositories()
  : await getRepositories(config.username, config.featuredRepositories);

const cards = repos.map((repo, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 28 + col * 455;
  const y = 30 + row * 145;
  const name = repo.name === 'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis' ? 'FIM / APRIORI DASHBOARD' : repo.name.replaceAll('-', ' ').toUpperCase();
  return `<g transform="translate(${x} ${y})">
    <rect width="430" height="120" rx="14" class="card"/>
    <text x="20" y="30" class="project">${escapeXml(truncate(name, 38))}</text>
    <text x="20" y="52" class="meta">${escapeXml(repo.language ?? 'Mixed')} · ★ ${repo.stargazers_count ?? 0}</text>
    <text x="20" y="79" class="desc">${escapeXml(truncate(repo.description || 'Repository on GitHub', 58))}</text>
    <text x="20" y="101" class="link">github.com/${config.username}/${escapeXml(repo.name)}</text>
  </g>`;
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="330" viewBox="0 0 960 330" role="img" aria-label="Featured GitHub projects">
<style>.bg{fill:#071018}.card{fill:#0b1721;stroke:#1c3647}.project{font:700 14px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#eaf8ff;letter-spacing:.4px}.meta{font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#66dfff}.desc{font:500 12px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:#a9c2d2}.link{font:500 10px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#658294}</style>
<rect width="960" height="330" rx="20" class="bg"/>${cards}</svg>`;
await writeGenerated('projects.svg', svg);
