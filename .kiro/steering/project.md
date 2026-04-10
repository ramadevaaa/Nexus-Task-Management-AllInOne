---
inclusion: always
---

# NEXUS — Mission Control

Futuristic to-do web app. No frameworks, no backend, no build tools.

## Stack
- HTML / CSS / Vanilla JS only
- LocalStorage for all data persistence
- Single CSS file: `css/style.css`
- Single JS file: `js/app.js`

## Structure
```
index.html
css/style.css
js/app.js
```

## Design
- Dark-first, space/mission-control aesthetic
- Glassmorphism cards, neon cyan (`#00d4ff`) + purple (`#7c3aed`) accents
- Font: Space Grotesk (body), Space Mono (mono/labels)
- Light mode supported via `[data-theme="light"]` on `<html>`

## Features
- Greeting with live clock, date, day progress bar
- Focus timer (Pomodoro) with SVG ring, focus/break modes, session dots
- Task list with priority (low/mid/high), filters, edit, delete, LocalStorage
- Quick links (portals) saved to LocalStorage
- Mission stats + completion rate bar
- Settings panel: operator name, pomodoro duration, break duration, theme toggle

## Conventions
- JS state lives in single `state` object
- `$()` = getElementById, `$$()` = querySelectorAll
- All LocalStorage keys prefixed with `nexus_`
- CSS variables defined in `:root`, overridden in `[data-theme="light"]`
- Buttons use outline style with accent color, not gradient fills (except modals/settings)
