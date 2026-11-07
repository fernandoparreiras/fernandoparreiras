import fs from "node:fs/promises";

const USERNAME = process.env.PROFILE_USERNAME || "fernandoparreiras";
const TOKEN = process.env.PROFILE_STATS_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const OUT = process.env.PROFILE_DASHBOARD_OUT || "assets/profile-dashboard-v2.svg";
const METRICS_OUT = process.env.PROFILE_METRICS_OUT || "assets/profile-metrics.json";
const README_PATH = process.env.PROFILE_README_PATH || "README.md";
const UPDATE_README = process.env.PROFILE_UPDATE_README === "1";
const PROJECTS = [
  {
    name: "Trustyu FORGE",
    tagline: "Engineering harness + delivery integrity",
    stage: "Alpha 3.3",
    evidence: "Public architecture map",
    color: "#60a5fa",
  },
  {
    name: "Trustyu CRM",
    tagline: "Vertical operations product",
    stage: "Evidence per contract",
    evidence: "Private implementation context",
    color: "#22c55e",
  },
  {
    name: "Hub Agents",
    tagline: "Multi-tenant product-agent runtime",
    stage: "Capability-specific",
    evidence: "Private implementation context",
    color: "#a78bfa",
  },
  {
    name: "Trustyu AI Works",
    tagline: "Agent, workflow and function platform",
    stage: "Development",
    evidence: "Five compiled resource kinds",
    color: "#facc15",
  },
  {
    name: "Trustyu Score",
    tagline: "Human-led, AI-assisted assessment",
    stage: "Professional-assisted",
    evidence: "Core 3.0 + report standard 4.1",
    color: "#fb7185",
  },
  {
    name: "Trustyu Lens",
    tagline: "Problem and solution diagnosis",
    stage: "Professional-assisted",
    evidence: "Method + versioned brief",
    color: "#2dd4bf",
  },
  {
    name: "Process Intelligence",
    tagline: "LLM process mapping and BPMN specs",
    stage: "POC",
    evidence: "Public claims stay bounded",
    color: "#38bdf8",
  },
  {
    name: "NEEDYU V2",
    tagline: "Meeting memory and tenant-safe AI",
    stage: "Pre-launch development",
    evidence: "Implementation slices, no GA claim",
    color: "#22c55e",
  },
  {
    name: "Needyu Chrome Plugin",
    tagline: "Meeting capture client and install path",
    stage: "Development",
    evidence: "Private implementation context",
    color: "#f97316",
  },
];
const FAITH_STATEMENT = "Jesus Christ at the center | CEO | POR.life";
const FAITH_REFERENCES = "Job 8:7 | Colossians 3:23";

if (!TOKEN) {
  throw new Error("Missing GitHub token. Set PROFILE_STATS_TOKEN, GH_TOKEN, or GITHUB_TOKEN.");
}
if (process.env.GITHUB_ACTIONS === "true" && !process.env.PROFILE_STATS_TOKEN) {
  throw new Error("PROFILE_STATS_TOKEN is required in GitHub Actions to prevent partial profile-wide metrics.");
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
    repositories(first: 100, privacy: PUBLIC, ownerAffiliations: [OWNER], isFork: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
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

async function monthlyContributionCounts(months) {
  const query = `
  query MonthlyContributionCounts($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalIssueContributions
        totalPullRequestContributions
      }
    }
  }`;

  const issues = [];
  const prs = [];
  for (const month of months) {
    const { start, end } = monthRange(month);
    const fromDate = `${start}T00:00:00Z`;
    const endDate = new Date(`${end}T00:00:00Z`);
    endDate.setUTCSeconds(endDate.getUTCSeconds() - 1);
    const payload = await githubGraphql(query, {
      login: USERNAME,
      from: fromDate,
      to: endDate.toISOString(),
    });
    const collection = payload.user.contributionsCollection;
    issues.push(collection.totalIssueContributions);
    prs.push(collection.totalPullRequestContributions);
  }

  return { issues, prs };
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmt(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function validateMetrics(metrics, calendarDays) {
  const values = metrics.github;
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "number" && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`Invalid metric ${name}: ${value}`);
    }
  }
  if (values.privateContributions > values.contributions) {
    throw new Error("Private contributions cannot exceed total contributions.");
  }
  if (values.activeDays > calendarDays) {
    throw new Error("Active days cannot exceed the contribution-calendar window.");
  }
  if (values.currentStreak > values.longestStreak) {
    throw new Error("Current streak cannot exceed the longest streak.");
  }
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

function calcCurrentStreak(days) {
  let current = 0;
  let index = days.length - 1;
  const todayUtc = now.toISOString().slice(0, 10);
  if (days[index]?.date === todayUtc && days[index].contributionCount === 0) {
    index -= 1;
  }
  for (; index >= 0; index -= 1) {
    if (days[index].contributionCount > 0) {
      current += 1;
    } else if (current > 0) {
      break;
    }
  }
  return current;
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
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
  const line = values?.length > 1 ? points(values, 22, 92, 172, 42) : null;
  return `
    <g transform="translate(${x} ${y})">
      <rect class="mini-card" x="0" y="0" width="216" height="158" rx="14"/>
      <text class="muted" x="20" y="32" font-size="13">${escapeXml(title)}</text>
      <text class="title" x="20" y="68" font-size="30">${escapeXml(value)}</text>
      <text fill="${color}" x="20" y="91" font-size="13" font-family="Inter, ui-sans-serif, system-ui">${escapeXml(change)}</text>
      ${line ? `<polyline points="${line}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : `<text class="muted" x="20" y="127" font-size="12">Current public snapshot</text>`}
    </g>`;
}

function pulseCard({ x, y, title, value, detail, color }) {
  return `
    <g transform="translate(${x} ${y})">
      <rect class="mini-card" x="0" y="0" width="168" height="104" rx="14"/>
      <circle cx="22" cy="26" r="6" fill="${color}"/>
      <text class="muted" x="40" y="31" font-size="13">${escapeXml(title)}</text>
      <text class="title" x="18" y="66" font-size="27">${escapeXml(value)}</text>
      <text class="muted" x="18" y="88" font-size="12">${escapeXml(detail)}</text>
    </g>`;
}

function mixAxisLength(percent) {
  return percent > 0 ? Math.max(10, (percent / 100) * 164) : 0;
}

function contributionMixCard({ x, y, mix, total }) {
  const centerX = 252;
  const centerY = 136;
  const commits = mixAxisLength(mix.commits.percent);
  const issues = mixAxisLength(mix.issues.percent);
  const reviews = mixAxisLength(mix.reviews.percent);
  const prs = mixAxisLength(mix.pullRequests.percent);

  return `
    <g transform="translate(${x} ${y})">
      <rect class="panel" x="0" y="0" width="500" height="260" rx="16"/>
      <text class="title" x="24" y="34" font-size="22">Contribution Mix</text>
      <text class="muted" x="24" y="58" font-size="13">${escapeXml(fmt(total))} classified actions, last 12 months</text>
      <line x1="92" y1="${centerY}" x2="420" y2="${centerY}" stroke="#1f3b35" stroke-width="2"/>
      <line x1="${centerX}" y1="58" x2="${centerX}" y2="220" stroke="#1f3b35" stroke-width="2"/>
      <line x1="${centerX}" y1="${centerY}" x2="${(centerX - commits).toFixed(1)}" y2="${centerY}" stroke="#39d353" stroke-width="3" stroke-linecap="round"/>
      <line x1="${centerX}" y1="${centerY}" x2="${(centerX + issues).toFixed(1)}" y2="${centerY}" stroke="#39d353" stroke-width="3" stroke-linecap="round"/>
      <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${(centerY - reviews).toFixed(1)}" stroke="#39d353" stroke-width="3" stroke-linecap="round"/>
      <line x1="${centerX}" y1="${centerY}" x2="${centerX}" y2="${(centerY + prs).toFixed(1)}" stroke="#39d353" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${centerX}" cy="${centerY}" r="8" fill="#22c55e" fill-opacity="0.18"/>
      <circle cx="${centerX}" cy="${centerY}" r="4" fill="#86efac"/>
      <circle cx="${(centerX - commits).toFixed(1)}" cy="${centerY}" r="4" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
      <circle cx="${(centerX + issues).toFixed(1)}" cy="${centerY}" r="4" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
      <circle cx="${centerX}" cy="${(centerY - reviews).toFixed(1)}" r="4" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
      <circle cx="${centerX}" cy="${(centerY + prs).toFixed(1)}" r="4" fill="#86efac" stroke="#22c55e" stroke-width="2"/>
      <text class="muted" x="106" y="${centerY - 10}" font-size="12" text-anchor="middle">${mix.commits.percent}%</text>
      <text class="muted" x="106" y="${centerY + 8}" font-size="12" text-anchor="middle">Commits</text>
      <text class="muted" x="408" y="${centerY - 10}" font-size="12" text-anchor="middle">${mix.issues.percent}%</text>
      <text class="muted" x="408" y="${centerY + 8}" font-size="12" text-anchor="middle">Issues</text>
      <text class="muted" x="${centerX}" y="78" font-size="12" text-anchor="middle">${mix.reviews.percent}%</text>
      <text class="muted" x="${centerX}" y="96" font-size="12" text-anchor="middle">PR reviews</text>
      <text class="muted" x="${centerX}" y="112" font-size="11" text-anchor="middle">GitHub-counted</text>
      <text class="muted" x="${centerX}" y="204" font-size="12" text-anchor="middle">${mix.pullRequests.percent}%</text>
      <text class="muted" x="${centerX}" y="222" font-size="12" text-anchor="middle">Pull requests</text>
    </g>`;
}

function scopeMetric({ x, title, value, detail, color }) {
  return `
      <g transform="translate(${x} 84)">
        <circle cx="0" cy="0" r="6" fill="${color}"/>
        <text class="muted" x="18" y="5" font-size="13">${escapeXml(title)}</text>
        <text class="title" x="0" y="50" font-size="24">${escapeXml(value)}</text>
        <text class="muted" x="0" y="76" font-size="12">${escapeXml(detail)}</text>
      </g>`;
}

function provenanceCard({ x, y, updated }) {
  return `
    <g transform="translate(${x} ${y})">
      <rect class="panel" x="0" y="0" width="1090" height="190" rx="16"/>
      <text class="title" x="24" y="34" font-size="24">Metrics &amp; Data Provenance</text>
      <text class="muted" x="326" y="34" font-size="14">GitHub API · generated ${escapeXml(updated)} BRT</text>
      <text class="muted" x="24" y="58" font-size="13">Exact counts where available; private activity stays anonymized; unavailable evidence is never presented as zero.</text>
      ${scopeMetric({ x: 38, title: "Window", value: "12 months", detail: "rolling UTC interval", color: "#22c55e" })}
      ${scopeMetric({ x: 292, title: "Contributions", value: "Profile-wide", detail: "private details anonymized", color: "#60a5fa" })}
      ${scopeMetric({ x: 546, title: "Repositories", value: "Public only", detail: "owner repos + languages", color: "#facc15" })}
      ${scopeMetric({ x: 800, title: "Quality Evidence", value: "Not published", detail: "private-by-design, not zero", color: "#fb7185" })}
    </g>`;
}

function projectCard(project, index) {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = col * 358;
  const y = row * 208;
  const stageWidth = Math.min(250, Math.max(74, project.stage.length * 7 + 26));

  return `
    <g transform="translate(${x} ${y})">
      <rect class="mini-card" x="0" y="0" width="330" height="184" rx="16"/>
      <circle cx="32" cy="36" r="18" fill="${project.color}" fill-opacity="0.12" stroke="${project.color}" stroke-width="2"/>
      <text fill="${project.color}" x="32" y="42" font-size="20" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-weight="800">${index + 1}</text>
      <text class="title" x="22" y="76" font-size="21">${escapeXml(project.name)}</text>
      <text class="muted" x="22" y="102" font-size="13">${escapeXml(project.tagline)}</text>
      <text class="muted" x="22" y="123" font-size="12">${escapeXml(project.evidence)}</text>
      <rect x="22" y="136" width="${stageWidth}" height="24" rx="12" fill="${project.color}" fill-opacity="0.12" stroke="${project.color}" stroke-opacity="0.72"/>
      <text fill="${project.color}" x="35" y="153" font-size="12" font-family="Inter, ui-sans-serif, system-ui" font-weight="700">${escapeXml(project.stage)}</text>
      <text class="muted" x="22" y="176" font-size="11">Evidence-qualified public stage</text>
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
const projects = PROJECTS;

const months = lastMonths(12);
const contributionSeries = monthlyContributionSeries(days, months);
const monthlyCounts = await monthlyContributionCounts(months);
let prSeries = monthlyCounts.prs;
let issueSeries = monthlyCounts.issues;

if (!prSeries.some(Boolean) && !issueSeries.some(Boolean)) {
  prSeries = [];
  issueSeries = [];
  for (const m of months) {
    const { start, end } = monthRange(m);
    prSeries.push(await searchCount(`author:${USERNAME} type:pr created:${start}..${end}`));
    issueSeries.push(await searchCount(`author:${USERNAME} type:issue created:${start}..${end}`));
  }
}

const localDateParts = Object.fromEntries(new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Sao_Paulo",
}).formatToParts(now).map(({ type, value }) => [type, value]));
const updated = `${localDateParts.year}-${localDateParts.month}-${localDateParts.day}`;
const totalContributions = calendar.totalContributions;
const privateContributions = collection.restrictedContributionsCount;
const publicRepos = user.repositories.totalCount;
const followers = user.followers.totalCount;
const publicStars = repos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
const longestStreak = calcLongestStreak(days);
const currentStreak = calcCurrentStreak(days);
const activeDays = days.filter((day) => day.contributionCount > 0).length;
const averageActiveDay = activeDays ? totalContributions / activeDays : 0;
const bestDay = days.reduce(
  (best, day) => (day.contributionCount > best.contributionCount ? day : best),
  { date: updated, contributionCount: 0 },
);
const totalPrs = collection.totalPullRequestContributions || prSeries.reduce((sum, value) => sum + value, 0);
const totalIssues = collection.totalIssueContributions || issueSeries.reduce((sum, value) => sum + value, 0);
const totalCommits = collection.totalCommitContributions;
const totalReviews = collection.totalPullRequestReviewContributions;
const languages = languageStats(repos);

const contributionMixTotal = Math.max(totalCommits + totalIssues + totalPrs + totalReviews, 1);
const contributionMix = {
  commits: { total: totalCommits, percent: Math.round((totalCommits / contributionMixTotal) * 100) },
  issues: { total: totalIssues, percent: Math.round((totalIssues / contributionMixTotal) * 100) },
  pullRequests: { total: totalPrs, percent: Math.round((totalPrs / contributionMixTotal) * 100) },
  reviews: { total: totalReviews, percent: Math.round((totalReviews / contributionMixTotal) * 100) },
};

const metricsDocument = {
  schemaVersion: 1,
  generatedAt: now.toISOString(),
  generatedLocalDate: updated,
  displayTimeZone: "America/Sao_Paulo",
  window: { from, to, basis: "rolling-12-months-utc" },
  scope: {
    contributions: "GitHub profile contribution calendar; private repository details remain anonymized",
    repositories: "Public, non-fork repositories owned by the profile",
    languages: "Bytes reported by GitHub for those public repositories",
    qualityEvidence: "Not published from private repositories; absence is not reported as zero",
  },
  github: {
    contributions: totalContributions,
    privateContributions,
    commits: totalCommits,
    pullRequests: totalPrs,
    issues: totalIssues,
    pullRequestReviews: totalReviews,
    activeDays,
    currentStreak,
    longestStreak,
    bestDay: { date: bestDay.date, contributions: bestDay.contributionCount },
    followers,
    publicRepositories: publicRepos,
    publicStars,
  },
  products: projects.map(({ name, tagline, stage, evidence }) => ({ name, tagline, stage, evidence })),
};
validateMetrics(metricsDocument, days.length);
const PROJECTS_SECTION_Y = 1818;
const SVG_HEIGHT = PROJECTS_SECTION_Y + Math.ceil(projects.length / 3) * 208 + 72;
const svg = `<svg width="1200" height="${SVG_HEIGHT}" viewBox="0 0 1200 ${SVG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Fernando Parreiras live GitHub and AI architecture dashboard</title>
  <desc id="desc">Fernando Parreiras profile dashboard: exact GitHub activity counts, explicit data provenance, human-centered AI, Trustyu Forge, agentic systems, durable memory, and evidence-qualified product stages.</desc>
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

  <rect class="bg" width="1200" height="${SVG_HEIGHT}" rx="28"/>
  <rect width="1200" height="${SVG_HEIGHT}" rx="28" fill="url(#greenGlow)"/>
  <rect width="1200" height="${SVG_HEIGHT}" rx="28" fill="url(#blueGlow)"/>

  <g transform="translate(54 48)">
    <text class="muted" x="0" y="0" font-size="14" letter-spacing="3">FERNANDO PARREIRAS / FOUNDER / AI SYSTEMS ARCHITECT</text>
    <text class="title" x="0" y="54" font-size="52">Building AI that serves people</text>
    <text class="text" x="0" y="92" font-size="21">Founder @ Trustyu.ai · Tech Human · needyu.ai · POR.life</text>
    <text class="muted" x="0" y="132" font-size="17">Agentic systems, durable memory and evidence-qualified engineering with human authority.</text>
    <rect x="0" y="160" width="620" height="4" rx="2" fill="url(#heroLine)"/>

    <g transform="translate(0 186)">
      ${[
        ["Trustyu.ai", 112],
        ["FORGE 3.3", 112],
        ["AI Works", 104],
        ["Agentic AI", 116],
        ["Durable Memory", 146],
        ["Evals", 78],
        ["Human Gates", 126],
      ].map(([label, width], i, chips) => {
        const x = chips.slice(0, i).reduce((sum, [, chipWidth]) => sum + chipWidth + 12, 0);
        return `<rect class="chip" x="${x}" y="0" width="${width}" height="34" rx="17"/><text class="${i % 3 === 0 ? "blue" : i % 3 === 1 ? "accent" : "purple"}" x="${x + 18}" y="22" font-size="13">${escapeXml(label)}</text>`;
      }).join("")}
    </g>

    <g transform="translate(0 242)">
      <rect class="panel" x="0" y="0" width="1090" height="92" rx="16"/>
      <text class="accent" x="28" y="36" font-size="18">${escapeXml(FAITH_STATEMENT)}</text>
      <text class="text" x="28" y="66" font-size="16">Jesus Christ is my only Savior and true CEO. Every business, product, and decision is submitted to Him.</text>
      <text class="purple" x="1048" y="36" font-size="15" text-anchor="end">${escapeXml(FAITH_REFERENCES)}</text>
      <text class="muted" x="1048" y="66" font-size="13" text-anchor="end">Faith and work, united by purpose.</text>
    </g>
  </g>

  <g transform="translate(54 438)">
    <text class="title" x="0" y="0" font-size="24">GitHub Stats</text>
    <rect class="panel" x="0" y="22" width="520" height="218" rx="16"/>
    <text class="muted" x="26" y="68" font-size="15">Total Contributions (last year)</text>
    <text class="accent" x="482" y="68" font-size="16" text-anchor="end">${fmt(totalContributions)}</text>
    <text class="muted" x="26" y="104" font-size="15">Private Contributions</text>
    <text class="accent" x="482" y="104" font-size="16" text-anchor="end">${privateContributions > 0 ? fmt(privateContributions) : "Token gated"}</text>
    <text class="muted" x="26" y="140" font-size="15">Public Repositories</text>
    <text class="accent" x="482" y="140" font-size="16" text-anchor="end">${fmt(publicRepos)}</text>
    <text class="muted" x="26" y="176" font-size="15">Followers</text>
    <text class="accent" x="482" y="176" font-size="16" text-anchor="end">${fmt(followers)}</text>
    <text class="muted" x="26" y="212" font-size="15">Stars on Public Repositories</text>
    <text class="accent" x="482" y="212" font-size="16" text-anchor="end">${fmt(publicStars)}</text>

    <text class="title" x="620" y="0" font-size="24">Public Repository Languages</text>
    <rect class="panel" x="620" y="22" width="470" height="218" rx="16"/>
    ${languages.map(languageRow).join("")}
  </g>

  <g transform="translate(54 734)">
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

  <g transform="translate(54 980)">
    <text class="title" x="0" y="-26" font-size="24">Activity Overview</text>
    ${metricCard({ x: 0, y: 0, title: "Contributions", value: fmt(totalContributions), change: "last 12 months", color: "#22c55e", values: contributionSeries })}
    ${metricCard({ x: 242, y: 0, title: "Pull Requests", value: fmt(totalPrs), change: "authored", color: "#a78bfa", values: prSeries })}
    ${metricCard({ x: 484, y: 0, title: "Issues", value: fmt(totalIssues), change: "authored", color: "#facc15", values: issueSeries })}
    ${metricCard({ x: 726, y: 0, title: "Repositories", value: fmt(publicRepos), change: "public owner repos", color: "#60a5fa", values: [] })}
    <text class="muted" x="760" y="148" font-size="13">Weekly + on-demand refresh</text>
  </g>

  <g transform="translate(54 1188)">
    <text class="title" x="0" y="-26" font-size="24">Git Pulse</text>
    <text class="muted" x="120" y="-26" font-size="14">last 12 months</text>
    ${pulseCard({ x: 0, y: 0, title: "Commits", value: fmt(totalCommits), detail: "direct git activity", color: "#22c55e" })}
    ${pulseCard({ x: 184, y: 0, title: "Human Reviews", value: fmt(totalReviews), detail: "formal PR reviews", color: "#38bdf8" })}
    ${pulseCard({ x: 368, y: 0, title: "Active Days", value: fmt(activeDays), detail: `${Math.round((activeDays / days.length) * 100)}% of days`, color: "#a78bfa" })}
    ${pulseCard({ x: 0, y: 120, title: "Avg Active Day", value: averageActiveDay.toFixed(1), detail: "contributions/day", color: "#facc15" })}
    ${pulseCard({ x: 184, y: 120, title: "Best Day", value: fmt(bestDay.contributionCount), detail: dateLabel(bestDay.date), color: "#fb7185" })}
    ${pulseCard({ x: 368, y: 120, title: "Current Streak", value: `${fmt(currentStreak)}d`, detail: `longest ${fmt(longestStreak)}d`, color: "#60a5fa" })}
    ${contributionMixCard({ x: 590, y: -38, mix: contributionMix, total: contributionMixTotal })}
  </g>

  ${provenanceCard({ x: 54, y: 1568, updated })}

  <g transform="translate(54 ${PROJECTS_SECTION_Y})">
    <text class="title" x="0" y="-28" font-size="24">Architecture &amp; Product Contexts</text>
    <text class="muted" x="1090" y="-28" font-size="14" text-anchor="end">Public context + evidence-qualified stage</text>
    ${projects.map(projectCard).join("")}
  </g>
</svg>`;

await fs.mkdir(OUT.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(OUT, svg.replace(/^[ \t]+$/gm, ""), "utf8");
console.log(`Generated ${OUT}`);
await fs.mkdir(METRICS_OUT.split("/").slice(0, -1).join("/"), { recursive: true });
await fs.writeFile(METRICS_OUT, `${JSON.stringify(metricsDocument, null, 2)}\n`, "utf8");
console.log(`Generated ${METRICS_OUT}`);

if (UPDATE_README) {
  const repository = process.env.GITHUB_REPOSITORY || `${USERNAME}/${USERNAME}`;
  const ref = process.env.PROFILE_DASHBOARD_REF || "main";
  const cacheKey = process.env.PROFILE_DASHBOARD_CACHE_KEY;
  const cacheSuffix = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : "";
  const assetUrl = `https://raw.githubusercontent.com/${repository}/${ref}/${OUT}${cacheSuffix}`;
  const dashboardUrlPattern = /https:\/\/raw\.githubusercontent\.com\/[^/\s"]+\/[^/\s"]+\/[^/\s"]+\/assets\/profile-dashboard[^\s"]*\.svg(?:\?[^\s"]*)?/;
  const readme = await fs.readFile(README_PATH, "utf8");

  if (!dashboardUrlPattern.test(readme)) {
    throw new Error(`Could not find the dashboard image URL in ${README_PATH}`);
  }

  await fs.writeFile(README_PATH, readme.replace(dashboardUrlPattern, assetUrl), "utf8");
  console.log(`Updated ${README_PATH} to reference ${OUT}`);
}
