# 12-minute demo script

## 0:00–0:45 — Problem and architecture

Introduce the one-role recruiting problem. Point out the board, SQLite persistence, server transition rules, and deterministic search.

## 0:45–2:30 — Pipeline and movement

Show stage counts. Open an Applied candidate and advance once with the right-arrow button. Explain that each arrow is one step.

## 2:30–4:00 — Rejection and finality

Reject a demo candidate. Show that rejected candidates leave the active columns. Explain that the API refuses any later move from a final state. Hired candidates have no next-step button.

## 4:00–5:30 — Audit history

Open Priya Sharma. Walk through the timestamped stage events and current Screening age. Mention SQLite blocks event updates and deletes.

## 5:30–9:00 — Search examples

Run `Find Priya Sharma`, `sharam`, `Who's in Interview right now?`, `Who has been stuck in Screening for more than a week?`, `Who moved to Interview since Monday?`, `Who reached the Offer stage but didn't get hired?`, and `Everyone except rejected candidates`. Point out the match explanation.

## 9:00–10:00 — Unsupported query

Enter `tell me a joke` and show the explanation of supported search types.

## 10:00–11:00 — Architecture PDF

Open `Mini_Hiring_Pipeline_Architecture.pdf` and briefly show the service flow and data model.

## 11:00–12:00 — Decisions

Explain why deterministic filters and validated query execution are used instead of putting an LLM in the business-rule path. Mention local-first SQLite and the limits of the constrained parser.
