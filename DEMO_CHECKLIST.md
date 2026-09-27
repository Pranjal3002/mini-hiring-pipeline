# Demo checklist

- Start terminal in project folder: `npm run dev`
- Open: http://localhost:3000
- Seed once before recording: `npm run db:seed` (does not overwrite an existing DB)
- Seeded examples: Priya Sharma (10 days in Screening), Maya Iyer and Dev Kapoor (Interview), Vikram Jain (reached Offer then rejected), Rohan Das and Ishaan Roy (Offer), Anika Bose and Leela Menon (Hired).
- Queries: `Find Priya Sharma`; `sharam`; `Who's in Interview right now?`; `Who has been stuck in Screening for more than a week?`; `Who moved to Interview since Monday?`; `Who reached the Offer stage but didn't get hired?`; `Everyone except rejected candidates`; `tell me a joke`.
- Actions: advance a candidate exactly one stage; reject a pre-hire candidate; open Priya and show stage history.
- Architecture PDF: `Mini_Hiring_Pipeline_Architecture.pdf`
- Repository: https://github.com/Pranjal3002/mini-hiring-pipeline
- Say: stage rules run server side; events are immutable; search is deterministic and fuzzy name matching is local edit distance; no runtime API key or LLM.
- Avoid clicking reject on Priya or another candidate needed for search examples before finishing those queries. Avoid deleting/resetting the SQLite file while the dev server is running.
