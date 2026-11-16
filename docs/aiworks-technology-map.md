# AI Works — technology map

> Verified documentation cut: 2026-11-16. This public summary was reconciled against the product's current dependency manifests, architecture and memory documentation, decision-provider policy, local-development guide, and observability definitions. It publishes technology roles, without private topology, credentials, customer data, or operating claims for unqualified environments.

## Runtime and authoring

| Technology | Role in AI Works |
| --- | --- |
| Node.js 26+, pnpm 11.22, TypeScript | Product tooling, workspace dependencies, and typed application code. |
| Fastify and Next.js/React | API gateway and the authoring experience. |
| Temporal.io | Durable supervision for assistants, workflows, builds, memory jobs, evaluations, schedules, and recovery. |
| Zigflow and Serverless Workflow | Go runtime and workflow DSL used by the compiled `openworkflow/v1` execution path. |
| workerd | Supervised execution of account Functions with immutable targets and policy checks. |
| JEV / TypeSafe | External typed-decision responder, selected under the product's decision policy. Availability, consent, minimization, fallback, and shadow-mode rules determine its use. |
| Playwright | Browser automation and observation used by product tooling and verification. |

## Contracts and data

| Technology | Role in AI Works |
| --- | --- |
| TypeSpec | Resource declarations and contract tooling, including `resource.tsp` authoring. |
| GraphQL | Query contracts and an application runtime for composed data access. |
| OpenAPI, JSON Schema, Ajv, Zod | API descriptions and executable shape validation at declared boundaries. |
| SQLite, FTS5, sqlite-vec | Application-database services and rebuildable lexical/vector memory indexes. Indexes are separate from authoritative durable records. |
| Cohere Embed v4 through Amazon Bedrock | The documented embedding path for platform memory; product and environment authorization apply. |
| Amazon S3-compatible storage | Versioned sources, immutable artifacts, durable state, and product data under separate storage contracts. |
| SeaweedFS | S3-compatible storage in the documented local development environment. |
| LocalStack | Local AWS-compatible development services, with ownership separate from the SeaweedFS S3 path. |
| Keycloak, JWT/JWKS, JOSE | Identity and authorization contracts for accounts, workspaces, and workloads. |

## Delivery and observation

| Technology | Role in AI Works |
| --- | --- |
| Docker, Kubernetes/Minikube, Terraform, AWS/EKS | Local isolation and infrastructure/deployment paths, qualified separately per environment. |
| Prometheus | Runtime and Temporal metrics, queries, and operational observations. |
| Grafana | Provisioned dashboards for runtime, storage, and Temporal observations. |
| Grafana Loki | Log-based history used by the documented observability stack. |
| OpenTelemetry | Trace instrumentation and propagation across the relevant runtime boundaries. |
| esbuild | Toolchain-owned executable artifact preparation and bundling. |
| Biome | Product tooling present in the dependency graph. |

The cross-product [architecture map](trustyu-ai-architecture.md) also covers Foundation, Hub Agents, NEEDYU, and the public knowledge hub. Shared technologies do not establish shared deployment or universal integration. Existing stack entries are preserved in the profile; this map adds AI Works-specific context.
