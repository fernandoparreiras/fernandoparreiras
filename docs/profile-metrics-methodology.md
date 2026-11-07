# Profile metrics — methodology and disclosure

> Evidence cut: 2026-11-06. This document explains the public dashboard at the top of Fernando Parreiras' GitHub profile. It is a measurement contract, not a productivity score.

## Update policy

The dashboard is regenerated every Monday at 10:17 UTC and can also be refreshed on demand. Each successful refresh updates:

- `assets/profile-dashboard.svg`, the human-readable visual;
- `assets/profile-metrics.json`, the machine-readable snapshot;
- the dashboard URL in `README.md`, with a cache key tied to the workflow run.

The generator is public in [`scripts/generate-profile-dashboard.mjs`](../scripts/generate-profile-dashboard.mjs). A dedicated profile token is used only inside GitHub Actions; credentials are never written to generated artifacts.

## Sources and definitions

| Metric | Public definition |
| --- | --- |
| Contributions | GitHub's profile contribution calendar for a rolling 12-month UTC interval. GitHub determines what qualifies as a contribution. |
| Private contributions | GitHub's anonymized restricted-contribution count. Repository, organization, customer, and content details are not published. |
| Commits, issues, pull requests, and reviews | Profile-wide totals returned by GitHub for the same rolling interval. They are activity counts, not quality or productivity claims. |
| Active day and streaks | Derived only from days where GitHub reports at least one contribution. An incomplete current UTC day with zero activity is excluded from the current-streak calculation; the best day is the highest calendar count in the interval. |
| Public repositories and stars | Current, non-fork repositories owned by this profile and the stars on those repositories. No historical repository trend is fabricated. |
| Public repository languages | Byte proportions reported by GitHub for the public owner repositories. They do not describe the full private engineering stack. |
| Followers | Current total returned by GitHub for the public profile. A follower count is a reach signal, not a technical-quality score. |
| Product stages | Editorial, evidence-qualified labels maintained from the public architecture map. They are not inferred from commit volume or repository recency. |

## Deliberate exclusions

Private CI, security, SAST, smoke, and specification-gate totals are not published by this profile. Lack of public visibility is shown as **not published**, never as zero.

The artifacts also omit credentials, private repository names, customer identifiers, private issue or pull-request links, internal endpoints, operational topology, and customer evidence.

## Known limitations

- GitHub timestamps profile contributions in UTC, so a local-day boundary may differ.
- The rolling window changes every day; an older contribution can leave the interval while a new one enters.
- GitHub visibility, organization SSO, token scope, and contribution-counting rules affect what the API returns.
- Automated activity can increase activity counts. Counts do not establish human effort, business outcome, reliability, adoption, or production readiness.
- A merged implementation, a successful workflow, a deployment, public behavior, and an operating outcome remain separate states.

For product and architecture status, use the [public Trustyu AI architecture map](trustyu-ai-architecture.md), which applies explicit evidence language and disclosure boundaries.
