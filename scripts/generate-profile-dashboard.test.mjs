import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const generator = fileURLToPath(new URL("./generate-profile-dashboard.mjs", import.meta.url));

async function generate(t, counts, { previous, markers = true } = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "profile-dashboard-test-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const readme = `<img src="https://raw.githubusercontent.com/example/example/main/assets/profile-dashboard.svg" />\n${markers ? "<!-- profile-metrics:start -->old<!-- profile-metrics:end -->" : ""}\n`;
  await fs.writeFile(path.join(directory, "README.md"), readme);
  await fs.mkdir(path.join(directory, "assets"));
  if (previous) {
    await fs.writeFile(path.join(directory, "assets/profile-metrics.json"), JSON.stringify(previous));
  }
  const days = counts.map((contributionCount, index) => ({
    date: `2026-11-${13 + index}`,
    contributionCount,
    weekday: (5 + index) % 7,
    color: contributionCount ? "#39d353" : "#0f172a",
  }));
  const total = counts.reduce((sum, count) => sum + count, 0);
  const wrapper = `
    import assert from "node:assert/strict";
    const NativeDate = Date;
    globalThis.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : ["2026-11-16T12:00:00Z"])); }
    };
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.github.com/graphql");
      calls += 1;
      const { query } = JSON.parse(options.body);
      const collection = {
        totalCommitContributions: 0,
        totalIssueContributions: 0,
        totalPullRequestContributions: 0,
        totalPullRequestReviewContributions: 0,
        restrictedContributionsCount: ${total},
        contributionCalendar: { totalContributions: ${total}, weeks: [{ contributionDays: ${JSON.stringify(days)} }] },
      };
      return { ok: true, json: async () => ({ data: { user: {
        name: "Example", login: "example", followers: { totalCount: 3 },
        contributionsCollection: collection,
        repositories: { totalCount: 0, nodes: [] },
      } } }) };
    };
    await import(${JSON.stringify(generator)});
    assert.equal(calls, 13, "one profile query plus twelve monthly queries; no search fallback");
  `;
  execFileSync(process.execPath, ["--input-type=module", "-e", wrapper], {
    cwd: directory,
    env: {
      PATH: process.env.PATH,
      GH_TOKEN: "synthetic-token-never-sent",
      PROFILE_USERNAME: "example",
      PROFILE_UPDATE_README: "1",
      PROFILE_DASHBOARD_CACHE_KEY: "synthetic-run",
    },
    stdio: "pipe",
  });
  return {
    metrics: JSON.parse(await fs.readFile(path.join(directory, "assets/profile-metrics.json"), "utf8")),
    readme: await fs.readFile(path.join(directory, "README.md"), "utf8"),
    svg: await fs.readFile(path.join(directory, "assets/profile-dashboard.svg"), "utf8"),
  };
}

test("an interrupted streak stays zero and unclassified private activity is not fabricated", async (t) => {
  const { metrics, svg, readme } = await generate(t, [2, 2, 0, 0]);
  assert.equal(metrics.github.currentStreak, 0);
  assert.equal(metrics.github.longestStreak, 2);
  assert.equal(metrics.github.contributions, 4);
  assert.equal(metrics.github.pullRequests, 0);
  assert.equal(metrics.schemaVersion, 2);
  assert.match(metrics.scope.activityBreakdown, /not classified by type/);
  assert.match(svg, /0 API-visible classified actions/);
  assert.doesNotMatch(svg, /NaN|Infinity/);
  assert.match(readme, /Profile contributions \| 4/);
  assert.match(readme, /API-visible authored pull requests \| 0/);
  assert.match(readme, /Updated \*\*2026-11-16\*\*/);
  assert.match(readme, /profile-dashboard\.svg\?v=synthetic-run/);
  assert.equal((readme.match(/<!-- profile-metrics:start -->/g) || []).length, 1);
});

test("an incomplete empty current UTC day preserves the streak ending yesterday", async (t) => {
  const { metrics } = await generate(t, [2, 2, 2, 0]);
  assert.equal(metrics.github.currentStreak, 3);
  assert.equal(metrics.github.activeDays, 3);
});

test("an active current UTC day participates in the streak", async (t) => {
  const { metrics } = await generate(t, [0, 2, 2, 2]);
  assert.equal(metrics.github.currentStreak, 3);
  assert.equal(metrics.github.longestStreak, 3);
});

test("a collapsed credential scope is rejected before publication", async (t) => {
  await assert.rejects(generate(t, [2, 2, 0, 0], {
    previous: { github: { contributions: 20000, privateContributions: 19000, pullRequests: 89 } },
  }), /Contribution count dropped by more than 50%/);
});

test("missing README markers fail instead of silently leaving stale text", async (t) => {
  await assert.rejects(generate(t, [2, 2, 0, 0], { markers: false }), /metrics snapshot markers/);
});
