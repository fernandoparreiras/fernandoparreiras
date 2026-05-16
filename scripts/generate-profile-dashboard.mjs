import fs from "node:fs/promises";

const USERNAME = process.env.PROFILE_USERNAME || "fernandoparreiras";
const TOKEN = process.env.PROFILE_STATS_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const OUT = process.env.PROFILE_DASHBOARD_OUT || "assets/profile-dashboard.svg";

if (!TOKEN) {
  throw new Error("Missing GitHub token. Set PROFILE_STATS_TOKEN, GH_TOKEN, or GITHUB_TOKEN.");
}

const now = new Date();
const to = now.toISOString();
const fromDate = new Date(now);
fromDate.setUTCFullYear(fromDate.getUTCFullYear() - 1);
const from = fromDate.toISOString();

const gql = `
query ProfileDashboard($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
    login
    url
    followers { totalCount }
    following { totalCount }
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
            weekday
          }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER], isFork: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        isPrivate
        isFork
        stargazerCount
        forkCount
        primaryLanguage {
          name
          color
        }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
      }
    }
  }
}
`;

async function githubGraphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      "user-agent": "fernandoparreiras-profile-dashboard",
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(JSON.stringify(payload.errors || payload, null, 2));
  }
  return payload.data;
}

async function githubRest(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "user-agent": "fernandoparreiras-profile-dashboard",
    },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function searchCount(query) {
  const encoded = encodeURIComponent(query);
  const payload = await githubRest(`/search/issues?q=${encoded}&per_page=1`);
  return payload?.total_count ?? 0;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmt(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return String(value);
}

function monthKey(date) {
  return date.toISOString().slice(0, 7);
}

function lastMonths(count) {
  const months = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setUTCMonth(cursor.getUTCMonth() - i);
    months.push(monthKey(d));
  }
  return months;
}

function monthRange(key) {
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function calcLongestStreak(days) {
  let best = 0;
  let current = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function languageStats(repos) {
  const totals = new Map();
  for (const repo of repos) {
    for (const edge of repo.languages?.edges || []) {
      const prev = totals.get(edge.node.name) || { name: edge.node.name, color: edge.node.color || "#94a3b8", size: 0 };
      prev.size += edge.size;
      totals.set(edge.node.name, prev);
    }
  }
  const total = Array.from(totals.values()).reduce((sum, item) => sum + item.size, 0);
  const top = Array.from(totals.values()).sort((a, b) => b.size - a.size).slice(0, 5);
  return top.map((item) => ({
    ...item,
    pct: total ? (item.size / total) * 100 : 0,
  }));
}

function points(values, x, y, width, height) {
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const px = x + (index / Math.max(values.length - 1, 1)) * width;
      const py = y + height - (value / max) * height;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    })
    .join(" ");
}

function metricCard({ x, y, title, value, change, color, values }) {
  const line = points(values, 22, 92, 172, 42);
  return `
    <g transform="translate(${x} ${y})">
      <rect class="mini-card" x="0" y="0" width="216" height="158" rx="14"/>
      <text class="muted" x="20" y="32" font-size="13">${escapeXml(title)}</text>
      <text class="title" x="20" y="68" font-size="30">${escapeXml(value)}</text>
      <text fill="${color}" x="20" y="91" font-size="13" font-family="Inter, ui-sans-serif, system-ui">${escapeXml(change)}</text>
      <polyline points="${line}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

function languageRow(lang, index) {
  const y = 48 + index * 36;
  const width = Math.max(8, Math.round((lang.pct / 100) * 212));
  const x = 620;
  return `
    <text class="text" x="${x + 24}" y="${y}" font-size="14">${escapeXml(lang.name)}</text>
    <rect class="track" x="${x + 150}" y="${y - 11}" width="212" height="9" rx="5"/>
    <rect x="${x + 150}" y="${y - 11}" width="${width}" height="9" rx="5" fill="${lang.color}"/>
    <text class="text" x="${x + 382}" y="${y}" font-size="14" text-anchor="end">${lang.pct.toFixed(1)}%</text>`;
}

function contributionGrid(weeks, x, y) {
  const size = 9;
  const gap = 3;
  const cells = [];
  for (let wi = 0; wi < weeks.length; wi += 1) {
    for (const day of weeks[wi].contributionDays) {
      const cx = x + wi * (size + gap);
      const cy = y + day.weekday * (size + gap);
      const fill = day.contributionCount > 0 ? day.color : "#0f172a";
      cells.push(`<rect x="${cx}" y="${cy}" width="${size}" height="${size}" rx="2" fill="${fill}" stroke="#1e293b" stroke-width="0.4"/>`);
    }
  }
  return cells.join("\n");
}

function monthlyContributionSeries(days, months) {
  const byMonth = Object.fromEntries(months.map((m) => [m, 0]));
  for (const day of days) {
    const key = day.date.slice(0, 7);
    if (key in byMonth) {
      byMonth[key] += day.contributionCount;
    }
  }
  return months.map((m) => byMonth[m] || 0);
}

const data = await githubGraphql(gql, { login: USERNAME, from, to });
const user = data.user;
const collection = user.contributionsCollection;
const calendar = collection.contributionCalendar;
const weeks = calendar.weeks;
const days = weeks.flatMap((week) => week.contributionDays).sort((a, b) => a.date.localeCompare(b.date));
const repos = user.repositories.nodes || [];
const publicProfile = await githubRest(`/users/${USERNAME}`);

const months = lastMonths(12);
const contributionSeries = monthlyContributionSeries(days, months);
const prSeries = [];
const issueSeries = [];

for (const m of months) {
  const { start, end } = monthRange(m);
  prSeries.push(await searchCount(`author:${USERNAME} type:pr created:${start}..${end}`));
  issueSeries.push(await searchCount(`author:${USERNAME} type:issue created:${start}..${end}`));
}

const repoSeries = months.map((m, index) => {
  const base = Math.max((publicProfile?.public_repos || repos.length) - (months.length - index - 1), 1);
  return base;
});

const totalContributions = calendar.totalContributions;
const privateContributions = collection.restrictedContributionsCount;
const publicRepos = publicProfile?.public_repos ?? repos.filter((repo) => !repo.isPrivate).length;
const visibleRepos = user.repositories.totalCount;
const longestStreak = calcLongestStreak(days);
const totalPrs = prSeries.reduce((sum, value) => sum + value, 0);
const totalIssues = issueSeries.reduce((sum, value) => sum + value, 0);
const languages = languageStats(repos);
const updated = now.toISOString().slice(0, 10);

const svg = `<svg width="1200" height="1060" viewBox="0 0 1200 1060" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Fernando Parreiras live GitHub profile dashboard</title>
  <desc id="desc">Live generated GitHub profile dashboard with stats, languages, contribution graph, activity overview, and AI infrastructure positioning.</desc>
  <defs>
    <radialGradient id="greenGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 90) rotate(136) scale(560 360)">
      <stop stop-color="#22c55e" stop-opacity="0.28"/>
      <stop offset="0.7" stop-color="#22c55e" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blueGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 110) rotate(40) scale(540 360)">
      <stop stop-color="#38bdf8" stop-opacity="0.22"/>
      <stop offset="0.7" stop-color="#2563eb" stop-opacity="0.05"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heroLine" x1="0" x2="1" y1="0" y2="0">
      <stop stop-color="#22c55e"/>
      <stop offset="0.55" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <style>
      .bg { fill: #020617; }
      .panel { fill: #07111f; stroke: #223049; stroke-width: 1; }
      .mini-card { fill: #08111f; stroke: #223049; stroke-width: 1; }
      .chip { fill: #111c31; stroke: #24324a; stroke-width: 1; }
      .track { fill: #1e293b; }
      .muted { fill: #94a3b8; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .text { fill: #e5e7eb; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .title { fill: #f8fafc; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-weight: 800; }
      .accent { fill: #86efac; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-weight: 700; }
      .blue { fill: #7dd3fc; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-weight: 700; }
      .purple { fill: #c4b5fd; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-weight: 700; }
      .mono { fill: #cbd5e1; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
    </style>
  </defs>

  <rect class="bg" width="1200" height="1060" rx="28"/>
  <rect width="1200" height="1060" rx="28" fill="url(#greenGlow)"/>
  <rect width="1200" height="1060" rx="28" fill="url(#blueGlow)"/>

  <g transform="translate(54 48)">
    <text class="muted" x="0" y="0" font-size="14" letter-spacing="3">FOUNDER / ARCHITECT / AI INFRASTRUCTURE</text>
    <text class="title" x="0" y="54" font-size="52">Hi, I'm Fernando Parreiras</text>
    <text class="text" x="0" y="92" font-size="21">AI Builder | Systems Architect | Founder @ Trustyu.ai &amp; Tech Human</text>
    <text class="muted" x="0" y="132" font-size="17">I build AI-powered products, multi-agent systems and AWS-backed platform infrastructure.</text>
    <rect x="0" y="160" width="620" height="4" rx="2" fill="url(#heroLine)"/>

    <g transform="translate(0 186)">
      ${["Trustyu.ai", "JARVIS", "Hub Agents", "AWS", "Terraform", "AI/ML", "Vertical SaaS"].map((label, i) => {
        const widths = [112, 94, 126, 72, 112, 80, 142];
        const x = widths.slice(0, i).reduce((sum, value) => sum + value + 12, 0);
        return `<rect class="chip" x="${x}" y="0" width="${widths[i]}" height="34" rx="17"/><text class="${i % 3 === 0 ? "blue" : i % 3 === 1 ? "accent" : "purple"}" x="${x + 18}" y="22" font-size="13">${label}</text>`;
      }).join("")}
    </g>
  </g>

  <g transform="translate(54 308)">
    <text class="title" x="0" y="0" font-size="24">GitHub Stats</text>
    <rect class="panel" x="0" y="22" width="520" height="218" rx="16"/>
    <text class="muted" x="26" y="68" font-size="15">Total Contributions (last year)</text>
    <text class="accent" x="482" y="68" font-size="16" text-anchor="end">${fmt(totalContributions)}</text>
    <text class="muted" x="26" y="104" font-size="15">Private Contributions</text>
    <text class="accent" x="482" y="104" font-size="16" text-anchor="end">${privateContributions > 0 ? fmt(privateContributions) : "Token gated"}</text>
    <text class="muted" x="26" y="140" font-size="15">Public Repositories</text>
    <text class="accent" x="482" y="140" font-size="16" text-anchor="end">${fmt(publicRepos)}</text>
    <text class="muted" x="26" y="176" font-size="15">Visible Repositories</text>
    <text class="accent" x="482" y="176" font-size="16" text-anchor="end">${fmt(visibleRepos)}</text>
    <text class="muted" x="26" y="212" font-size="15">Longest Contribution Streak</text>
    <text class="accent" x="482" y="212" font-size="16" text-anchor="end">${fmt(longestStreak)} days</text>

    <text class="title" x="620" y="0" font-size="24">Top Languages</text>
    <rect class="panel" x="620" y="22" width="470" height="218" rx="16"/>
    ${languages.map(languageRow).join("")}
  </g>

  <g transform="translate(54 604)">
    <text class="title" x="0" y="0" font-size="24">Contributions (last year)</text>
    <rect class="panel" x="0" y="22" width="1090" height="170" rx="16"/>
    <text class="muted" x="28" y="62" font-size="13">Mon</text>
    <text class="muted" x="28" y="98" font-size="13">Wed</text>
    <text class="muted" x="28" y="134" font-size="13">Fri</text>
    ${contributionGrid(weeks, 78, 48)}
    <text class="muted" x="836" y="146" font-size="13">Less</text>
    <rect x="878" y="137" width="10" height="10" rx="2" fill="#0f172a"/>
    <rect x="894" y="137" width="10" height="10" rx="2" fill="#0e4429"/>
    <rect x="910" y="137" width="10" height="10" rx="2" fill="#006d32"/>
    <rect x="926" y="137" width="10" height="10" rx="2" fill="#26a641"/>
    <rect x="942" y="137" width="10" height="10" rx="2" fill="#39d353"/>
    <text class="muted" x="962" y="146" font-size="13">More</text>
    <text class="muted" x="850" y="184" font-size="13">Updated ${updated}</text>
  </g>

  <g transform="translate(54 850)">
    <text class="title" x="0" y="-26" font-size="24">Activity Overview</text>
    ${metricCard({ x: 0, y: 0, title: "Contributions", value: fmt(totalContributions), change: "last 12 months", color: "#22c55e", values: contributionSeries })}
    ${metricCard({ x: 242, y: 0, title: "Pull Requests", value: fmt(totalPrs), change: "authored", color: "#a78bfa", values: prSeries })}
    ${metricCard({ x: 484, y: 0, title: "Issues", value: fmt(totalIssues), change: "authored", color: "#facc15", values: issueSeries })}
    ${metricCard({ x: 726, y: 0, title: "Repositories", value: fmt(publicRepos), change: "public active", color: "#60a5fa", values: repoSeries })}
    <text class="muted" x="786" y="136" font-size="13">Auto-updated daily</text>
  </g>
</svg>`;

await fs.mkdir(OUT.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(OUT, svg, "utf8");
console.log(`Generated ${OUT}`);
