# Resortify — Design System

## Brand
A heritage resort brand that feels established, not startup. The interface is
quiet, warm, and editorial — like the lobby of a great hotel: generous
whitespace, hairline rules, serif headlines, and brass details. Light-first.

**Tagline:** *Where stays become stories.*

## Palette (light-first)
| Token            | Value       | Use                              |
| ---------------- | ----------- | -------------------------------- |
| `--cream-50`     | `#FBF7EF`   | App background                   |
| `--cream-100`    | `#F5EEE0`   | Raised surfaces / alt background |
| `--card`         | `#FFFFFF`   | Cards                            |
| `--ink`          | `#1B1712`   | Primary text                     |
| `--muted`        | `#6E6352`   | Secondary text                   |
| `--pine`         | `#12342C`   | Brand primary (deep green)       |
| `--pine-700`     | `#0E2620`   | Hover / dark footer              |
| `--brass`        | `#A97E4A`   | Accent (rates, highlights)       |
| `--brass-soft`   | `#E8D8BE`   | Accent fills / underlines        |
| `--sand`         | `#E7DCC8`   | Hairline rules / borders         |

A secondary dark theme (deep pine) is supported; light is the default.

## Type
- **Display:** `Fraunces` (variable) — serif headlines with real character.
  Tight tracking, `font-stretch` plays well with soft-warm weights.
- **Body:** `Manrope` — refined, humanist, comfortable at length.
- **Labels & rates:** `IBM Plex Mono` — small-caps ticket numbers, prices,
  dates. Used for the "rate card" motif.

## Motifs
- **Rate card:** a room presented like a luggage tag — mono number, serif
  name, dashed divider, mono nightly rate.
- **Hairline rules:** warm sand borders; generous gutters.
- **Brass underline:** a short brass rule under section headlines.
- **Small-caps mono labels:** uppercase, letterspaced, muted.
- **Editorial asymmetry:** oversized serif numerals and generous negative
  space on the landing page.
- **Signature wordmark:** serif "Resortify" with a brass "·" between "Resort"
  and "ify".

## Motion
CSS-only. One orchestrated load (staggered reveals), hover lifts on cards,
brass underline grows, and a subtle "now showing" pulse on the live
availability count. No jank, no scatter.

## Stack
- **Server:** NestJS + TypeScript + Mongoose (MongoDB), JWT auth, class-validator.
  Local dev can run on `mongodb-memory-server` — no install required.
- **Client:** Vite + React + TypeScript + Tailwind CSS v4.
