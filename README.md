# NammaArasu (நம்ம அரசு)

NammaArasu is a production-grade **Civic Governance Transparency Platform** designed to monitor, track, and audit political manifesto promises. It provides citizens with factual progress parameters, regional mapping, and an evidence hub to verify implementation milestones, while offering administrators a JIRA-style workflow dashboard to manage transitions with full accountability.

---

## ✨ Features

* **Dynamic Light/Dark Mode**: Completely semantic custom CSS theme variables synced to `localStorage`.
* **Tamil Nadu District-Wise Audit**: Fully interactive SVG administrative regional map to click, drill down, and audit localized promises, budgets, and milestones.
* **JIRA-Style Kanban Workflow Board**: Admin role-toggle interface to transition promises, log milestones, and update percentage sliders with full drag/drop flexibility.
* **Granular Evidence Hub**: Detail pages displaying accountability discussion trees, citizen proof attachments, and official government gazette logs.
* **Ultra-Premium Design**: HSL-tailored colors, dynamic micro-animations, glassmorphism headers, and high-contrast accessible badges.

---

## 🛠️ Technology Stack

* **Core Framework**: Next.js 16 (App Router, dynamic page-rendering, Turbopack compiling).
* **Styling System**: TailwindCSS (v4 specification) + Vanilla CSS Custom Variable tokens.
* **Icons & Assets**: Lucide React.
* **Data Layer**: Adaptive LocalStorage service with full static backup fallback (`src/lib/db.ts`).

---

## 🚀 Getting Started

First, install development dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard!

---

## 🏗️ Folder Structure

```text
tvk-tracker-v2/
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── districts/      # District Audit Page & Regional Mapping
│   │   ├── kanban/         # JIRA-Style Workflow Board
│   │   ├── promises/       # Dynamic Detail Pages & Evidence submissions
│   │   ├── globals.css     # Semantic Custom Property variables & resets
│   │   └── layout.tsx      # Core viewport wrappers & HTML headers
│   ├── components/         # Reusable theme-adaptive UI widgets
│   ├── lib/                # Data services & LocalStorage fallback
│   └── types/              # Strict TypeScript definitions
├── public/                 # Static SVG maps and visual assets
└── schema.sql              # Relational database specifications
```

---

## 🏛️ Philosophy
Build software that **another team can inherit**, **journalists can trust**, and **citizens can understand**. This platform is designed to feel like a serious, trustworthy public digital institution.
