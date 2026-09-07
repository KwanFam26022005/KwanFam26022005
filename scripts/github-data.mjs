const API = 'https://api.github.com';

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'kwanfam26022005-profile-renderer'
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function github(path) {
  const response = await fetch(`${API}${path}`, { headers: headers() });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${path}`);
  }
  return response.json();
}

export async function getProfileData(username) {
  const [user, repos] = await Promise.all([
    github(`/users/${encodeURIComponent(username)}`),
    github(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`)
  ]);

  const active = repos.filter((r) => !r.fork && !r.archived);
  const languages = new Map();
  for (const repo of active) {
    if (repo.language) languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
  }

  return {
    user,
    repos: active,
    stats: {
      publicRepos: user.public_repos ?? active.length,
      stars: active.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0),
      forks: active.reduce((sum, r) => sum + (r.forks_count ?? 0), 0),
      recentlyUpdated: active.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < 1000 * 60 * 60 * 24 * 30).length
    },
    languages: [...languages.entries()].sort((a, b) => b[1] - a[1]),
    recent: [...active].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 4)
  };
}

export async function getRepositories(username, names) {
  return Promise.all(names.map((name) => github(`/repos/${encodeURIComponent(username)}/${encodeURIComponent(name)}`)));
}

export function offlineProfile(username) {
  return {
    user: { login: username, public_repos: 13 },
    repos: [],
    stats: { publicRepos: 13, stars: 0, forks: 0, recentlyUpdated: 8 },
    languages: [['Python', 6], ['JavaScript', 3], ['TypeScript', 2], ['PHP', 1]],
    recent: [
      { name: 'meter-reading-engine-v2', pushed_at: '2026-09-06T00:00:00Z' },
      { name: 'meter-reading-inference-service', pushed_at: '2026-09-05T00:00:00Z' },
      { name: 'Invoice-engine', pushed_at: '2026-09-04T00:00:00Z' },
      { name: 'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis', pushed_at: '2026-09-03T00:00:00Z' }
    ]
  };
}

export function offlineRepositories() {
  return [
    { name: 'meter-reading-engine-v2', language: 'Python', description: 'Production-oriented pipeline engineering for LCD electricity-meter reading.', stargazers_count: 0 },
    { name: 'meter-reading-inference-service', language: 'Python', description: 'FastAPI inference and inspection adapter for the frozen meter-reading core pipeline.', stargazers_count: 0 },
    { name: 'Invoice-engine', language: 'Python', description: 'Local-first document intake, validation, persistence and human-review system.', stargazers_count: 0 },
    { name: 'Interactive-Web-Dashboard-for-Frequent-Itemset-Mining-and-Apriori-Pruning-Analysis', language: 'PHP', description: 'Interactive dashboard for Apriori mining, pruning analysis and visualization.', stargazers_count: 0 }
  ];
}
