# AI Skills

> AI agents, embeddings, LLM integration, scorecard engine

---

## Vision

Wosool's AI layer will power intelligent matching, scoring, and automation across the platform. The system is designed for 10 specialized agents.

---

## Planned AI Agents

| # | Agent | Purpose | Priority |
|---|-------|---------|----------|
| 1 | Scorecard Agent | Calculate founder readiness scores | High |
| 2 | Match Agent | Suggest founder-to-founder connections | High |
| 3 | Intro Agent | Facilitate warm introductions | Medium |
| 4 | Content Agent | Draft and suggest content | Medium |
| 5 | Analytics Agent | Generate insights from platform data | Medium |
| 6 | Recommendation Agent | Suggest programs, events, resources | Medium |
| 7 | Notification Agent | Smart notification timing/content | Low |
| 8 | Application Review Agent | Assist in application screening | Low |
| 9 | Search Agent | Semantic search across platform | Low |
| 10 | Support Agent | Answer founder questions | Low |

---

## Technology Stack

### Recommended

| Technology | Purpose | Notes |
|-----------|---------|-------|
| OpenAI API | GPT-4 for text generation/analysis | Primary LLM |
| Anthropic API | Claude for review/analysis | Alternative LLM |
| pgvector | Embedding storage in PostgreSQL | Already planned |
| OpenAI Embeddings | Text → vector conversion | text-embedding-3-small |
| LangChain (PHP) | Agent orchestration | Or custom implementation |

### Infrastructure

| Component | Purpose |
|-----------|---------|
| PostgreSQL + pgvector | Store and query embeddings |
| Redis | Cache AI responses |
| Queue workers | Async AI processing |
| Rate limiting | Control API costs |

---

## Scorecard Engine

### Scoring Dimensions

| Dimension | Weight | Data Source |
|-----------|--------|------------|
| Team strength | 25% | Founder profiles, experience |
| Market opportunity | 20% | Company profile, sector |
| Traction | 20% | Metrics, milestones |
| Product maturity | 15% | Product stage, tech stack |
| Network engagement | 10% | Platform activity |
| Execution speed | 10% | Milestone velocity |

### Implementation Plan

1. Define scoring rubric per dimension
2. Create ScorecardMetric model (exists)
3. Build calculation service
4. Add AI-assisted scoring via LLM
5. Dashboard visualization

---

## Embedding Strategy

### What to Embed
- Founder profiles (bio, skills, experience)
- Company descriptions
- Event descriptions
- Program details
- Resource content

### Matching Algorithm

```
1. Generate embeddings for all founder profiles
2. Store in pgvector column
3. On match request:
   a. Get requesting founder's embedding
   b. cosine_similarity search against all founders
   c. Filter by criteria (stage, sector, location)
   d. Rank and return top matches
```

---

## Cost Management

| Strategy | Implementation |
|----------|---------------|
| Caching | Cache AI responses in Redis (TTL: 24h) |
| Batching | Process embedding updates in batches |
| Model selection | Use smaller models where possible |
| Rate limiting | Cap AI calls per user per day |
| Monitoring | Track API costs weekly |

---

## Checklist

### Foundation
- [ ] pgvector extension enabled on PostgreSQL
- [ ] OpenAI API key configured
- [ ] AI service layer architecture designed
- [ ] Cost tracking implemented
- [ ] Rate limiting for AI endpoints

### Scorecard
- [ ] Scoring rubric defined
- [ ] Calculation service built
- [ ] Dashboard UI created
- [ ] AI-assisted scoring integrated
- [ ] Historical score tracking

### Matching
- [ ] Embedding generation pipeline
- [ ] pgvector similarity search
- [ ] Matching criteria configuration
- [ ] Match quality feedback loop
- [ ] Match dashboard UI

---

## Saudi/GCC Considerations

- Arabic text embedding support
- Bilingual content processing
- Sector taxonomy aligned with Saudi market
- Vision 2030 sector alignment scoring
- Local LLM alternatives if needed (data sovereignty)
