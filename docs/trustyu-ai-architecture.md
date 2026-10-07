# Trustyu AI architecture — public technical map

> Evidence cut: 2026-10-07. This document is a public, deliberately redacted map of the architecture explored and implemented across Trustyu. It describes capabilities and boundaries; it does not publish credentials, customer data, private topology, commercial commitments, or unverified outcomes.

## How to read the status

| Status | Meaning |
| --- | --- |
| **Implemented** | Code or an executable contract exists in the named scope. |
| **Verified** | That implementation passed the checks declared for a specific version and environment. |
| **Operating** | A qualified capability is being used under an explicit owner, support model, and operational boundary. |
| **Professional-assisted** | Specialists use software and AI, but human review remains the authority. |
| **Development / Alpha / POC** | The architecture is being built or tested; availability, scale, adoption, and outcomes are not implied. |
| **Research** | A reference or hypothesis is being evaluated; it is not an adopted runtime by default. |

These states are intentionally independent. A merged implementation is not automatically verified, deployed, operating, generally available, or effective in a customer outcome.

## Portfolio map

| Capability | Role | Evidence-qualified state |
| --- | --- | --- |
| **Trustyu Lens** | Investigates the problem, buyer, alternatives, evidence, hypotheses, and next validation through a versioned `SolutionBrief`. | **Professional-assisted.** Methodology and skills; not a SaaS portal. |
| **Trustyu Score** | Evaluates existing and AI-built systems across technology, product, and market/business evidence. | **Professional-assisted.** Deterministic Core v3 plus human review; autonomous runtime and portal remain gated. |
| **Trustyu Forge** | Human-directed engineering harness for intent, architecture, agent execution, verification, evidence, and release decisions. | **FORGE 3.3 Alpha.** Mechanisms exist at different maturity levels; external adoption and `Operating` are qualified separately. |
| **Trustyu AI Works** | Authors, publishes, composes, and executes agents, workflows, functions, and related resources. | **Development.** Local execution and selected AWS/EKS readiness have evidence; public scale, self-service, and GA are not claimed. |
| **Hub Agents** | Multi-tenant product-agent runtime for vertical, channel-aware workflows. | **Capability-specific.** Operating slices exist; this does not prove every planned agent or product integration. |
| **Process Intelligence** | Explores transcript/document-to-process mapping, BPMN, and technical process specifications. | **POC.** Foundational documentation and a first validation flow; product stack and commercial operation are not inferred. |

The products are complementary, not a mandatory purchasing sequence: Lens can clarify what should be solved; Score can assess what already exists; Forge governs how engineering proceeds; AI Works supports qualified composition and execution.

## FORGE: the engineering harness

FORGE is the system around AI-assisted engineering, not a model catalog or a prompt collection. It binds direction, context, tools, tests, evidence, and human authority into a traceable loop:

```text
SPEC → EXPLORE → PLAN → RED → IMPLEMENT → GREEN → VERIFY → VERDICT
```

Its current architecture covers:

- versioned intent, ADRs, specifications, standards, runbooks, and reusable skills;
- isolated worktrees and task sandboxes with explicit capability and least-privilege boundaries;
- contract-first implementation, affected-test selection, reusable CI/CD, security scanning, and smoke checks;
- provenance records, immutable subject references, evidence bundles, receipts, and independent verification boundaries;
- risk-proportional conformance profiles for product, agentic AI, infrastructure, data, and brownfield work;
- gate producibility, freshness, lifecycle, override, rollback, and human verdicts;
- fleet propagation without treating template presence as adoption;
- delivery-integrity checks that distinguish green CI, merge, deployment, public behavior, and operating outcomes;
- privacy-safe agent telemetry and a governed data perimeter;
- measured outcomes, cost, reliability, and learning loops without inventing productivity multipliers.

FORGE 3.2 adds the Brownfield & Consolidation track for preserving, integrating, redesigning, or retiring existing capabilities based on evidence. FORGE 3.3 adds verifiable governance and delivery integrity. The 3.3 program is Alpha: implemented, verified, and operating claims are made per mechanism, version, repository, and environment.

## Trustyu AI Works

Trustyu AI Works is a TypeScript modular monolith with separated control-plane, data-plane, and general contracts.

### Runtime architecture

| Area | Current design |
| --- | --- |
| Gateway and editor | Fastify API gateway and Next.js authoring environment |
| Durable orchestration | Temporal workflows and activities |
| Workflow runtime | Agents and workflows compile to `openworkflow/v1` and execute through the Go-based Zigflow runtime |
| Functions | Exact immutable targets run in supervised `workerd`, with authorization and policy revalidation |
| Resource model | Versioned Agents, Workflows, Functions, Widgets, Surfaces, Instructions, Evaluations, Datasets, Design Systems, Integrations, Systems, and Databases |
| Identity and tenancy | Keycloak authority with account and workspace boundaries |
| Artifacts | Content-addressed storage, immutable releases, readiness records, and progressive promotion |
| Environments | Minikube for local development; AWS/EKS foundation and manual promotion paths are qualified by explicit runbooks and gates |

Durable execution is not only queueing. Long-running work records exact artifact identity, policy snapshots, approvals, idempotency keys, tool journals, and effect receipts. If an external effect becomes uncertain, execution stops for reconciliation instead of guessing that it succeeded or retrying blindly.

## Product agents and agentic workflows

Trustyu uses more than one orchestration model because the runtime problem differs by product:

- **Hub Agents:** Python, FastAPI, Clean Architecture, LangGraph, PostgreSQL/pgvector, Redis/Arq, REST/WebSocket/SSE channels, tenant isolation, and product-specific personas and tools.
- **AI Works:** Temporal for durable supervision, Zigflow for compiled workflow execution, and workerd for sandboxed account functions.
- **Engineering agents:** Claude Code, Codex, review agents, and the FORGE squad operate through repository instructions, isolated branches/worktrees, explicit ownership, and evidence-producing gates.

Agent autonomy is bounded by policy. The architecture distinguishes planning from effects, model output from authority, execution from verification, and a successful test from permission to release.

## LLM strategy: routed providers, not invented proprietary models

Trustyu does not present third-party foundation models as proprietary “Trustyu models.” The architectural asset is the governed selection layer:

- **Hub Agents `LLMFactory`:** routes by use case and capability instead of hardcoding a model in business logic;
- **AI Works model registry and protocols:** records availability, capabilities, provider protocol, exact candidate, and policy in the relevant run;
- **provider diversity:** Anthropic, OpenAI, and Google models can be evaluated for different roles;
- **promotion criteria:** comparable evals, quality, latency, cost, data risk, fallback behavior, and observability;
- **drift control:** model IDs and defaults live in product authorities, not copied across skills and profile text;
- **failure posture:** missing or uncertain judge output is not silently converted into approval.

Model choice is product- and task-specific. A provider appearing in the stack does not mean that every product, tenant, or workflow sends data to it.

## Durable memory and context

The memory architecture treats durable memory as governed evidence, not an unlimited transcript dump.

- authoritative records are separated from derived indexes and caches;
- writes are idempotent and coordinated by durable workflows;
- retrieval is permission-revalidated, bounded, and filtered by subject and purpose;
- claims carry provenance, confidence, limitations, and invalidation paths;
- content-addressed storage and explicit heads prevent silent replacement;
- embeddings and full-text/vector indexes remain rebuildable projections;
- retention and purge semantics are part of the storage contract;
- sensitive recovered bytes are not copied into durable traces merely because a model used them;
- observability records operation, outcome, policy, tokens, latency, and cost without logging private content by default.

This work appears in AI Works platform memory and in separate NEEDYU context/memory explorations. The bounded contexts remain distinct; similarity of concepts does not imply a shared production service.

## Evaluations, typed decisions, and Jev

Evaluation is treated as a versioned system, not a one-off prompt:

- candidate, dataset, harness, judge, rubric, and policy snapshot are pinned;
- online observations and offline evaluation executions are separated;
- results preserve target identity, evidence, limitations, and provenance;
- production gates fail closed when required evidence or judge output is missing;
- overrides require scoped authority and remain auditable;
- evaluation data follows minimization, redaction, retention, and tenant-consent rules.

AI Works also explores typed decision ports. A decision responder chooses among declared options under a typed contract; it does not receive unlimited system authority. **Jev** is one external responder used in scoped, policy-gated decision and evaluation flows, including shadow-mode experiments. Its use is not universal: account consent, minimal data projection, fallback behavior, frozen run policy, and provenance determine whether a call is allowed. Keys, secrets, attachments, and raw code are outside the public and decision-data boundary.

## Trustyu Score

Trustyu Score is currently a professional, human-led and AI-assisted assessment service. Its executable Core v3 is deterministic and versioned.

- technical score from 0–100 across four dimensions and eleven pillars;
- explicit handling of `unknown` and `not_observed` instead of silently converting absence into zero;
- safety caps and complete applicable-coverage requirements for an official score;
- three separate report tracks: Technical, Product, and Market;
- typed evidence, findings, risks, impact, priorities, limitations, and remediation roadmaps;
- source data, intake, evidence, PII, and customer reports kept outside Git repositories.

The target architecture includes source-bound execution, specialized product agents, an Evidence Plane, review gates, and a tenant-scoped portal. Those target components are not described as current autonomous availability, scientific validation, certification, or attestation.

## Stack map

| Context | Stack and mechanisms |
| --- | --- |
| Product Foundation | Next.js 16, React, TypeScript strict, Tailwind CSS, shadcn/ui, Prisma, pnpm 11, i18n, Vitest |
| Hub Agents | Python 3.12+, FastAPI, Pydantic, SQLAlchemy, Alembic, LangGraph, Arq, PostgreSQL 18 + pgvector, Redis 8.2.x |
| AI Works | TypeScript, Fastify, Next.js, Temporal, Go/Zigflow, workerd, Kubernetes/Minikube, AWS EKS, S3-compatible object storage |
| Identity and tenancy | Keycloak 26.6.3, JWT/JWKS, account/workspace or tenant boundaries, service authority contracts |
| Delivery | GitHub Actions, Docker, Terraform/HCL, Railway, Vercel, signed/pinned artifacts, reusable workflows |
| Security | Gitleaks, CodeQL/SAST, Trivy/CVE gates, secret guards, capability boundaries, provenance, redaction, rollback |
| Observability and evals | OpenTelemetry GenAI conventions, LangSmith/LangFuse where product-authorized, traces, cost/latency signals, versioned evals |

Product-specific ADRs can override Foundation defaults. For example, AI Works has its own Node/pnpm floor and CRM can use an approved managed PostgreSQL override. A cross-product stack badge is therefore a map of practiced technologies, not a claim that every repository uses every component.

## Public safety boundary

This public map intentionally omits:

- API keys, tokens, credentials, internal endpoints, account identifiers, and network topology;
- customer names or delivery artifacts that are not already explicitly authorized for publication;
- private repository links, private issue/PR URLs, environment values, and operational shortcuts;
- exact security thresholds that would weaken controls;
- unmeasured claims about speed, cost savings, autonomy, scientific validity, certification, scale, or commercial availability.

For the public explanation of the harness and its current limits, see [Trustyu Forge](https://forge.trustyu.ai). For the portfolio context, see [Trustyu.ai](https://trustyu.ai).
