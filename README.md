# Impact Assessment for Social Protection Analysts 2026 — Course dashboard

Static dashboard for ITCILO course **A9718853** (online, 5 October – 20 November 2026, 7 weeks, 100 hours).

## Tabs
- **Overview** — next live session with countdown, course progress, seven-week journey, topics and learning outcomes
- **Timetable** — all 14 live sessions by week, with an agenda-time / local-time toggle and `.ics` calendar export
- **Resource persons** — trainers and the sessions they lead
- **Participants** — searchable, filterable, sortable roster with summary charts
- **Course info** — audience, methodology, key facts and contacts

## Editing the content
| File | Content |
| --- | --- |
| `data/course.js` | Course description (flyer) and timetable (agenda) |
| `data/participants.js` | Participant roster — one object per person; any fields you add become table columns |

Open `index.html` directly or publish via GitHub Pages (Settings → Pages → deploy from branch, root folder).
Append `?now=2026-10-20T15:00:00%2B02:00` to the URL to preview the dashboard at a given moment.
