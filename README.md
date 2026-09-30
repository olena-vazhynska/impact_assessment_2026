# Impact Assessment for Social Protection Analysts 2026 — Course dashboard

Static dashboard for ITCILO course **A9718853** (online, 5 October – 20 November 2026, 7 weeks, 100 hours).

## Tabs
- **Overview** — next live session with countdown, course progress, what you will learn, topics, learning outcomes and resource persons
- **Learning journey** — the seven-week journey, learning format, how it works and why join
- **Timetable** — all 14 live sessions by week, with a week filter, an agenda-time / local-time toggle and `.ics` calendar export
- **Impact workbench** — a private, in-browser study-design worksheet you can download as a text file
- **Resources** — data and methods sources, key facts, contacts and audience
- **Participants** — searchable, filterable, sortable roster with summary charts
- **Demographics** — geographic and organizational make-up of the cohort, derived from the roster

## Editing the content
| File | Content |
| --- | --- |
| `data/course.js` | Course description (flyer), timetable (agenda), resources and workbench options |
| `data/participants.js` | Participant roster — one object per person; any field you add becomes a table column. Feeds the Participants and Demographics tabs. |

Open `index.html` directly or publish via GitHub Pages (Settings → Pages → deploy from branch, root folder).
Append `?now=2026-10-20T15:00:00%2B02:00` to the URL to preview the dashboard at a given moment.
