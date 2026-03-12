# Future Population Projections

## Overview

Interactive web app for exploring future population projections with editable assumptions.

## Features

- Cohort-component simulation with births, deaths, and ageing by 5-year age bands.
- Adjustable inputs: initial population, TFR, death rate, start/end year.
- Fertility change scenarios (step changes by year).
- Editable population pyramid (drag or input age/sex shares).
- Interactive charts for population and TFR trends with year selection.
- OECD country presets with automatic loading of latest available IDB data.
- Multilingual UI (25 locales) with per-locale routes for `/`, `/theory`, and `/about`.
- Theory and About pages describing methodology and context.

## Data sources

- U.S. Census Bureau International Data Base (IDB) API for population, TFR, and age/sex counts.
- The app tries recent years (2024→2019) and uses the most recent available observation.
- IDB responses are cached in `localStorage` for 7 days.

## Local development

```sh
npm i
npm run dev
```

## Scripts

```sh
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
```

`npm run build` runs Vite and then generates pre-rendered locale routes for SEO.

## Tech stack

- Vite
- TypeScript
- React
- React Router
- Recharts
- Framer Motion
- shadcn-ui + Radix UI
- Tailwind CSS
