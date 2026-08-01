# @hq/ai-engine

Core AI engine package providing unified provider abstractions, failover orchestration, adapters, and prompt execution services.

## Directory Structure

```text
src/
├── index.ts          # Barrel entry point
├── types/             # Schemas, DTOs, request/response models
├── services/          # High-level engine orchestrators (Agents, RAG, execution)
├── providers/         # Third-party LLM providers (Gemini, OpenAI, Anthropic)
├── adapters/          # Payload normalization & transformations
├── interfaces/        # TS Interface definitions
└── utils/             # Helper utilities (token calculation, stream parsers)
```
