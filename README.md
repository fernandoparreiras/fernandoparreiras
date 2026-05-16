<div align="center">

<img src="https://raw.githubusercontent.com/fernandoparreiras/fernandoparreiras/main/assets/profile-dashboard.svg?v=20260516-jarvis-needyu" alt="Fernando Parreiras - AI infrastructure dashboard" width="100%" />

<br />

[![Website](https://img.shields.io/badge/Website-fernandoparreiras.com.br-111827?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.fernandoparreiras.com.br)
[![Trustyu.ai](https://img.shields.io/badge/Trustyu.ai-AI_Product_Platform-111827?style=for-the-badge&logo=openai&logoColor=white)](https://trustyu.ai)
[![Tech Human](https://img.shields.io/badge/Tech_Human-Humanized_Technology-111827?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TECH-HUMAN)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-fernandoparreiras-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernandoparreiras)

</div>

---

## Builder Signal

I am building Trustyu as a vertical SaaS platform powered by AI squads, shared infrastructure, product-specific data isolation, and a repeatable launch methodology called **JARVIS**.

| Area | What I am building |
| --- | --- |
| AI product systems | Multi-agent workflows, RAG, LLM routing, evaluation, tracing, and human-in-the-loop operations |
| Platform architecture | Shared services, product isolation, tenant-aware systems, AWS infrastructure, reusable CI/CD, and deployable product templates |
| Business infrastructure | CRM, onboarding, messaging, billing, observability, and operational intelligence |
| AI literacy | Practical frameworks for companies adopting AI with governance, ROI, and execution readiness |

## JARVIS

JARVIS is my product launch operating system: a way to move from idea to production SaaS with AI-assisted squads, documented architecture decisions, empirical validation, and cross-repo execution.

```mermaid
flowchart LR
  A["Business problem"] --> B["Product strategy"]
  B --> C["ADRs and standards"]
  C --> D["AI squad execution"]
  D --> E["Product code"]
  D --> F["Platform services"]
  E --> G["Staging validation"]
  F --> G
  G --> H["Production SaaS"]
  H --> I["Learning loop"]
  I --> C
```

Core principles:

- Documents that operate like execution systems, not static notes
- Platform inheritance: decisions made once, reused across products
- Contract-first delivery with tests, smoke checks, and explicit release criteria
- Multi-agent collaboration between Claude, Claude Code, Codex, and other coding agents
- Empirical validation over assumptions, especially for infra, auth, LLM, and observability layers

## Platform Stack

### Product Foundation

![Next.js](https://img.shields.io/badge/Next.js_16-111827?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_6-111827?style=for-the-badge&logo=typescript&logoColor=3178C6)
![React](https://img.shields.io/badge/React-111827?style=for-the-badge&logo=react&logoColor=61DAFB)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-111827?style=for-the-badge&logo=shadcnui&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-111827?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![pnpm](https://img.shields.io/badge/pnpm_10-111827?style=for-the-badge&logo=pnpm&logoColor=F69220)

### Backend, Data, and Infra

![Node.js](https://img.shields.io/badge/Node.js_LTS-111827?style=for-the-badge&logo=nodedotjs&logoColor=5FA04E)
![Python](https://img.shields.io/badge/Python_3.12+-111827?style=for-the-badge&logo=python&logoColor=FFD43B)
![FastAPI](https://img.shields.io/badge/FastAPI-111827?style=for-the-badge&logo=fastapi&logoColor=009688)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_%2B_pgvector-111827?style=for-the-badge&logo=postgresql&logoColor=4169E1)
![Redis](https://img.shields.io/badge/Redis-111827?style=for-the-badge&logo=redis&logoColor=FF4438)
![AWS](https://img.shields.io/badge/AWS-111827?style=for-the-badge&logo=amazonwebservices&logoColor=FF9900)
![Terraform](https://img.shields.io/badge/Terraform-111827?style=for-the-badge&logo=terraform&logoColor=844FBA)
![Docker](https://img.shields.io/badge/Docker-111827?style=for-the-badge&logo=docker&logoColor=2496ED)
![Keycloak](https://img.shields.io/badge/Keycloak-111827?style=for-the-badge&logo=keycloak&logoColor=4D8DFF)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-111827?style=for-the-badge&logo=githubactions&logoColor=2088FF)

### AI, Agents, and LLM Tooling

![Claude](https://img.shields.io/badge/Claude-111827?style=for-the-badge&logo=anthropic&logoColor=D97757)
![Claude Code](https://img.shields.io/badge/Claude_Code-111827?style=for-the-badge&logo=anthropic&logoColor=D97757)
![OpenAI](https://img.shields.io/badge/OpenAI-111827?style=for-the-badge&logo=openai&logoColor=white)
![Codex](https://img.shields.io/badge/Codex-111827?style=for-the-badge&logo=openai&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-111827?style=for-the-badge&logo=googlegemini&logoColor=8E75B2)
![LangGraph](https://img.shields.io/badge/LangGraph-111827?style=for-the-badge&logo=langchain&logoColor=1C3C3C)
![LangChain](https://img.shields.io/badge/LangChain-111827?style=for-the-badge&logo=langchain&logoColor=1C3C3C)
![LangSmith](https://img.shields.io/badge/LangSmith-111827?style=for-the-badge&logo=langchain&logoColor=1C3C3C)
![LangFuse](https://img.shields.io/badge/LangFuse-111827?style=for-the-badge&logo=rocket&logoColor=white)

## AI Architecture Rules I Use

| Complexity | Default choice | Use when |
| --- | --- | --- |
| Level 1 | Direct Anthropic SDK | Simple LLM calls, classification, extraction, short prompt chains |
| Level 2 | LangChain | RAG pipelines, retrievers, document processing, vector search |
| Level 3 | LangGraph | Stateful agents, conditional workflows, checkpointing, handoffs |
| Level 4 | Google ADK | Parent-child hierarchies, parallel fan-out, multi-agent consolidation |
| Level 5 | Anthropic Agent SDK | High-autonomy Claude-native agents, coding automation, deep research |

Rule of thumb: start with the simplest layer that solves the problem, then move up only when real constraints demand it.

## Multi-Agent Operating Model

I use AI agents as an execution layer, not as a novelty layer. The goal is simple: faster product iteration with stronger engineering discipline.

| Standard | Why it matters |
| --- | --- |
| Named branches and explicit ownership | Prevents parallel AI sessions from colliding |
| ADRs for architecture | Keeps decisions out of chat history and inside the system |
| RED/GREEN commits | Makes contracts, tests, and implementation reviewable |
| Tenant isolation checks | Keeps vertical SaaS systems safe by default |
| Observability on agents | Turns AI behavior into debuggable traces |
| Secrets as operational risk | Treats leakage and drift as production concerns |

## Active Building Themes

| Theme | Direction |
| --- | --- |
| Vertical SaaS | Repeatable product architecture for niche, high-context markets |
| AWS Infrastructure | Cloud architecture, automation, HCL/Terraform, CI/CD, and production operations |
| Hub Agents | Shared AI engine with vertical isolation and reusable agent infrastructure |
| Trustyu CRM | AI-assisted CRM workflows, onboarding, messaging, and operational automation |
| AI Literacy | Governance readiness, use-case mapping, maturity models, and ROI frameworks |
| Humanized Technology | Systems that increase leverage without losing human judgment |

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
