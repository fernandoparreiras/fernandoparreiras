<div align="center">

<img src="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/main/assets/profile-dashboard.svg?v=20260708-forge" alt="Fernando Parreiras - AI infrastructure dashboard" width="100%" />

<br />
<br />

[![Website](https://img.shields.io/badge/Website-fernandoparreiras.com.br-111827?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.fernandoparreiras.com.br)
[![Trustyu.ai](https://img.shields.io/badge/Trustyu.ai-AI_Product_Platform-111827?style=for-the-badge&logo=openai&logoColor=white)](https://trustyu.ai)
[![Trustyu FORGE](https://img.shields.io/badge/Trustyu_FORGE-AI_First_Framework-111827?style=for-the-badge&logo=readme&logoColor=white)](https://forge.trustyu.ai)
[![POR.life](https://img.shields.io/badge/POR.life-Jesus_at_the_center-111827?style=for-the-badge&logo=readme&logoColor=white)](https://por.life)
[![Tech Human](https://img.shields.io/badge/Tech_Human-Humanized_Technology-111827?style=for-the-badge&logo=google-chrome&logoColor=white)](https://techhuman.com.br)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-fernandoparreiras-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernandoparreiras)

</div>

---

<img src="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/main/assets/profile-faith-stack.svg?v=20260716-premium-stack" alt="Faith-led purpose and production-grade AI platform stack" width="100%" />

<details>
<summary><strong>Readable stack matrix</strong></summary>

| Track | What it carries | Core stack |
| --- | --- | --- |
| Faith and purpose | Conviction, stewardship, ethics, people and impact through [POR.life](https://por.life) | Jesus at the center, Job 8:7, Colossians 3:23 |
| Product and UX | Fast, polished product surfaces for vertical SaaS and AI-native workflows | Next.js 16, React 19, TypeScript 6, shadcn/ui, Radix UI, Tailwind CSS 4, TanStack Query, Zod, React Hook Form, Recharts, next-intl, pnpm 11 |
| Backend and APIs | Domain services, agent APIs, integrations and operational workflows | Node.js 24 LTS, Python 3.12+, FastAPI, Pydantic, SQLAlchemy 2, Alembic, Prisma, uv, pytest, REST contracts and webhooks |
| Data, auth and infra | Multi-tenant product foundation, local-to-cloud parity and reusable delivery infrastructure | PostgreSQL 18, pgvector, Redis 8.2, Keycloak 26.6, Docker, Docker Compose, AWS, Terraform/HCL, Railway, Vercel, GitHub Actions, Resend SPI |
| AI, agents and LLMOps | Agentic software with tools, memory, routing, traces and human checkpoints | Claude, Claude Code, OpenAI, Codex, Gemini, MCP, LangGraph, LangChain, LangSmith, LangFuse, RAG, embeddings, LLM routing, HITL and evaluation |
| Engineering system | FORGE discipline codified into how products are specified, built, tested and released | ADRs, Definition of Done gates, contract-first tests, Vitest, Playwright E2E, CodeQL/SAST, Trivy, Gitleaks, semantic-release, worktrees, smoke checks, observability and FinOps |

</details>

---

## Builder Signal

I am a founder and AI systems architect building companies, products, and operating systems around applied artificial intelligence.

My current work connects [Trustyu.ai](https://trustyu.ai), [Trustyu FORGE](https://forge.trustyu.ai), [POR.life](https://por.life), [Tech Human](https://techhuman.com.br), and the [needyuai](https://github.com/needyuai) engineering ecosystem into a practical operating system for AI-native products, serious infrastructure, business automation, and human-centered adoption.

| Domain | Founder/AI Expert focus |
| --- | --- |
| [Trustyu.ai](https://trustyu.ai) | Vertical AI products, Hub Agents, CRM vNext, BMAI, trust systems, and operational intelligence |
| [Trustyu FORGE](https://forge.trustyu.ai) | AI-first engineering framework: ADRs, templates, reusable CI/CD, local AI environment, agent squads, and quality gates |
| [Tech Human](https://techhuman.com.br) | Humanized technology, AI literacy, governance readiness, leadership, and real-world business transformation |
| [POR.life](https://por.life) | Faith-led initiative where Jesus is at the center of purpose, ethics, business, and impact |
| AI architecture | Multi-agent workflows, RAG, LLM routing, tracing, evaluation, tenant isolation, and human-in-the-loop systems |

## Trustyu FORGE

[Trustyu FORGE](https://forge.trustyu.ai) is the AI-first engineering framework behind the Trustyu ecosystem. It turns product ideas into production SaaS through documented decisions, reusable templates, shared infrastructure, local AI engineering environments, agent squads, and empirical validation.

Public references: [FORGE Framework](https://forge.trustyu.ai), [Definition of Done](https://forge.trustyu.ai/#dod), [AI Squad](https://forge.trustyu.ai/#ia-squad), [Security](https://forge.trustyu.ai/#seguranca), and [Market Thesis](https://forge.trustyu.ai/#mercado).

| FORGE layer | Repository | Role |
| --- | --- | --- |
| Knowledge OS | `trustyu-docs` | ADRs, engineering standards, business strategy, runbooks, and agent methodology |
| Product template | `trustyu-template` | Base implementation for new Trustyu products: Next.js 16, TypeScript, Prisma, i18n, tests, CI, and design system |
| Platform infra | `trustyu-infra` | Reusable GitHub Actions, CI/CD, Docker Compose, Keycloak, bootstrap scripts, and shared automation |
| AI dev environment | `trustyu-ai-env` | Developer workstation, MCP setup, dotfiles, Codex/Claude kit, secrets workflow, and AI-first engineering tooling |

```mermaid
flowchart LR
  A["Business problem"] --> B["Product strategy"]
  B --> C["FORGE docs and ADRs"]
  C --> D["trustyu-template"]
  C --> E["trustyu-infra"]
  C --> F["trustyu-ai-env"]
  D --> G["AI squad execution"]
  E --> G
  F --> G
  G --> H["Product code"]
  H --> I["Quality gates"]
  I --> J["Production SaaS"]
  J --> K["Learning loop"]
  K --> C
```

Core principles:

- Documents that operate like execution systems, not static notes
- Framework inheritance: decisions, templates, workflows, and environments reused across products
- Contract-first delivery with tests, smoke checks, and explicit release criteria
- Multi-agent collaboration between Claude, Claude Code, Codex, CodeRabbit, and other coding agents
- Empirical validation over assumptions, especially for infra, auth, LLM, and observability layers

## Stack Philosophy

I use a pragmatic, production-minded stack: simple enough to ship fast, structured enough to scale across products.

| Layer | Stack |
| --- | --- |
| Product foundation | Next.js 16, React 19, TypeScript 6, shadcn/ui, Radix UI, Tailwind CSS 4, TanStack Query, Zod, React Hook Form, Recharts, next-intl, pnpm 11 |
| Backend and APIs | Node.js 24 LTS, Python 3.12+, FastAPI, Pydantic, SQLAlchemy 2, Alembic, Prisma, uv, pytest, REST contracts, webhooks |
| Data, auth and infra | PostgreSQL 18 + pgvector, Redis 8.2, Keycloak 26.6, Docker, Docker Compose, GitHub Actions, Resend SPI |
| Cloud platform | AWS, Terraform/HCL, Railway, Vercel, reusable CI/CD, production operations, FinOps |
| Agent tooling | Claude, Claude Code, Codex, OpenAI, Gemini, MCP, LangGraph, LangChain, LangSmith, LangFuse, RAG, embeddings, LLM routing, HITL, evaluation |
| Engineering system | ADRs, Definition of Done gates, contract-first tests, Vitest, Playwright E2E, CodeQL/SAST, Trivy, Gitleaks, semantic-release, worktrees, smoke checks, observability |

## AI Architecture Rules I Use

I do not start with the most complex agent framework. I start with the simplest layer that solves the problem, then move up only when the system asks for it.

- Direct SDKs for classification, extraction, generation, streaming, and short prompt chains
- LangChain for RAG, retrievers, document pipelines, chunking, embeddings, and vector search
- LangGraph for stateful agents, conditional workflows, checkpointing, and handoffs
- Google ADK for parent-child hierarchies, parallel fan-out, and multi-agent consolidation
- Anthropic Agent SDK for high-autonomy Claude-native agents, coding automation, and deep research

## Multi-Agent Operating Model

I use AI agents as an execution layer, not as a novelty layer. The goal is simple: faster product iteration with stronger engineering discipline.

- Named branches and explicit ownership to prevent parallel AI sessions from colliding
- ADRs for architecture so decisions live in the system, not only in chat history
- RED/GREEN commits for contract-first implementation and reviewable progress
- Human review + AI review signal so delivery speed does not remove engineering judgment
- Tenant isolation, SAST, smoke tests, and quality gates because vertical SaaS must be safe by default
- Observability on agents so AI behavior becomes debuggable traces, not folklore
- Secrets treated as operational risk, not convenience

## Active Building Themes

- **Vertical SaaS:** repeatable product architecture for niche, high-context markets
- **Trustyu FORGE:** AI-first framework for reusable product delivery, standards, templates, infra, and agent execution
- **AWS Infrastructure:** cloud architecture, automation, HCL/Terraform, CI/CD, and production operations
- **Hub Agents:** shared AI engine with vertical isolation and reusable agent infrastructure
- **Trustyu CRM:** AI-assisted CRM workflows, onboarding, messaging, and operational automation
- **AI Literacy:** governance readiness, use-case mapping, maturity models, and ROI frameworks through [Tech Human](https://techhuman.com.br)
- **Faith and purpose:** businesses and products aligned under [POR.life](https://por.life), with Jesus at the center
- **Humanized Technology:** systems that increase leverage without losing human judgment

## Contribution Flow

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/output/github-contribution-grid-snake-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/output/github-contribution-grid-snake.svg" />
  <img alt="GitHub contribution snake animation" src="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/output/github-contribution-grid-snake.svg" />
</picture>

## Operating Principles

```text
Build useful things.
Make technology more human.
Turn complex systems into practical leverage.
Validate reality before scaling opinion.
```
