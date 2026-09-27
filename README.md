# Mini Hiring Pipeline

## Overview

A locally run recruiting workspace for one open role. Candidates move through Applied, Screening, Interview, Offer, and Hired, with rejection available before hire. The board and search are backed by SQLite; every change is recorded in an append only event history.

## Problem

Recruiters need a small, dependable way to see candidate progress, make valid stage changes, review the full decision timeline, and ask practical questions without manually filtering a spreadsheet.

## Features

- Five stage Kanban board with candidate counts, stage age, add, advance, and reject actions.
- Candidate profile with complete timestamped audit history.
- Server enforced single stage progression and final outcomes.
- One natural language search box with name matching, typo tolerance, current stage, transition history, elapsed time, exclusions, and explanations.
- Local SQLite database and fictional seeded candidates. No external service or API key.

## Architecture

Next.js App Router serves the React board and JSON route handlers. `src/lib/domain.ts` contains the stage machine; `db.ts` owns SQLite persistence and audit constraints; `search.ts` parses a small supported query grammar and ranks matches. The handlers validate inputs with Zod before calling those modules. SQLite is the only persistence layer.

## Data Model

`candidates` stores name, unique email, current stage, and timestamps. `stage_events` references a candidate and stores the previous and new stage, event kind, and UTC timestamp. Indexes cover stage, name, candidate event lookup, target stage, and time.

## State Machine

The only ordinary transitions are Applied → Screening → Interview → Offer → Hired. Rejection is allowed from each pre-hire stage. Hired and Rejected are final. The same centralized rule runs on the server for every request.

## Audit Trail

Candidate changes and their event insert happen in one SQLite transaction. Database triggers reject event updates and deletes. Seed records use historical timestamps relative to the seed run; newly recorded events use UTC time.

## Search Engine

Search normalizes text, recognizes supported stage/date/duration/exclusion patterns, creates deterministic filters, evaluates event history, then scores and explains matches. Names use exact, token, substring, and local Levenshtein matching. All SQL is fixed and parameterized; query text is never treated as SQL. “Since Monday” means Monday at 00:00 UTC in the current UTC week. “More than a week” means strictly more than seven elapsed days based on the stored current-stage timestamp.

## Supported Natural-Language Queries

- `Find Priya Sharma` and typo tolerant `sharam`
- `Who's in Interview right now?`
- `Who has been stuck in Screening for more than a week?`
- `Who moved to Interview since Monday?`
- `Who reached the Offer stage but didn't get hired?` — includes anyone with an Offer event whose current state is not Hired, including currently in Offer or later rejected.
- `Everyone except rejected candidates`

Unsupported requests receive an explanation with supported query categories; valid queries with no matches get a distinct no-match response.

## Fuzzy Search

Local normalized name tokens use edit distance as a typo-tolerant fallback. This is string similarity, not semantic retrieval or an AI model.

## Security

The app has no credentials or external API calls. Zod validates request bodies and identifiers, stage rules are checked on the server, SQL uses prepared statements, SQLite foreign keys are enabled, and event immutability is protected by database triggers. Errors returned to the interface are human readable.

## Testing

Requires demo data for the search suite. Run `npm run db:seed` once, then `npm test`. The domain suite checks progression, skipped transitions, finality, and rejection. Search checks typo matching, current stage, exclusion, historical offer, and unsupported query handling. Also run `npm run lint` and `npm run build`.

## Running Locally

Requires Node.js 20.9 or newer.

```powershell
npm install
npm run db:seed
npm run dev
```

Open http://localhost:3000. `npm run db:seed` only populates an empty local database; it will not overwrite existing records. To reset the demo, stop the app, remove `data/hiring.sqlite` and its `-shm`/`-wal` companion files, then rerun the seed command. The local database is git-ignored.

```powershell
npm test
npm run lint
npm run build
```

## Demo Walkthrough

Open the board and candidate history. Advance an Applied candidate once, then try another step to see the next stage. Search `sharam`, inspect Priya’s 10 day Screening duration, run the Interview and offer-history queries, then exclude rejected candidates. See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for a timed recording flow.

## AI-Assisted Development

AI coding assistance was used during implementation. An AI-assisted design discussion suggested an LLM-first approach to translate recruiter questions directly into SQL. I did not use that approach in the critical path. The supported recruiter queries map cleanly to a constrained grammar, so deterministic parsing and validated query execution make stage transitions, dates, duration filters, exclusions, and audit queries easier to test and reason about. An LLM could be added later as an optional intent normalization layer with strict validation. No LLM is used at runtime.

## Design Decisions

- SQLite keeps the app offline and easy to review without an account or service.
- Audit events are immutable at both the application boundary and SQLite trigger layer.
- Search intentionally supports a documented subset rather than implying open ended understanding.
- The current stage is a projection for quick board reads; the event sequence preserves history.

## Trade-offs

The local SQLite file is suited to a single recruiter/demo, not concurrent multi-user hosting. The parser uses UTC and a small fixed vocabulary. UI date formatting follows the viewer's locale while stored dates remain UTC.

## What I Would Improve With More Time

Add Playwright browser tests, accessible keyboard movement, date phrase coverage and explicit interpretation chips, optimistic concurrency for multiple recruiters, and a migration tool for evolving the local schema.

## Limitations

This is a single-role local demo without authentication, file uploads, multi-user synchronization, calendar integrations, or runtime generative AI. Search accepts a constrained range of English phrases rather than arbitrary conversation.

## GitHub Repository

https://github.com/Pranjal3002/mini-hiring-pipeline
