# NammaArasu (நம்ம அரசு)

NammaArasu is a production-grade, state-of-the-art **Civic Governance Transparency Platform** engineered to monitor, track, and audit political manifesto commitments. It provides citizens, journalists, researchers, and public administrators with factual progress parameters, interactive regional analytics, and a public evidence hub to audit and verify implementation milestones.

This repository features an institutional, trustworthy, and ultra-premium interface built with modern performance standards, accessibility compliances, and a dual-sync architecture that runs entirely zero-config out-of-the-box.

---

## 🌟 Key Capabilities

- **Institutional Design Philosophy**: Engineered using HSL-tailored custom properties, glassmorphism, responsive layouts, and modern typography (Google Fonts) to look like a serious public digital institution.
- **District-Wise Governance Auditing**: Features an interactive Tamil Nadu SVG administrative regional map. Users can drill down by clicking any of the 38 districts to view local promise statuses, budgets, and evidence.
- **JIRA-Style Kanban Workflow Board**: Admin interface enabling role-toggled status transitions, completion percentage sliders, and chronological progress logs.
- **Public Evidence Hub**: Detail pages for every manifesto promise featuring a secure citizen upload system for media attachments (gazettes, news clipping, photos) and public discussion trees.
- **Zero-Config Local Fallback Engine**: Seamless dual-mode storage which automatically detects missing Firebase configurations and switches to an adaptive, fully-functional local storage runtime with static fallback backups.

---

## 🛠️ Technology Stack

- **Frontend Core**: [Next.js 16](https://nextjs.org/) (App Router, dynamic and static rendering, TypeScript, Turbopack).
- **Design & Styles**: [TailwindCSS v4](https://tailwindcss.com/) coupled with a Custom Property Vanilla CSS design system.
- **Icons**: [Lucide React](https://lucide.dev/) for institutional, consistent iconography.
- **Testing Engine**: [Vitest](https://vitest.dev/) with JSDOM for comprehensive component and service testing.
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/) (schema pre-seeded in `schema.sql` for Supabase) + [Firebase Firestore](https://firebase.google.com/docs/firestore) for live production synchronization.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js (v18.x or higher)](https://nodejs.org/) installed on your machine.

### 2. Local Setup

Clone the repository and install development dependencies:

```bash
npm install
```

### 3. Running Local Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore NammaArasu!

---

## ⚙️ Environment & Multi-Site Configuration

NammaArasu supports **Zero-Config Local Fallback Mode**. If no environment variables are defined, the application runs fully inside the browser's `localStorage` pre-seeded with the official Aram-Porul-Inbam framework documents.

### Environment Templates

For maximum security and data integrity, NammaArasu isolates development and staging databases from your live production database:
- **Staging Instance (Browser Sandbox)**: Runs entirely inside the browser's `localStorage` (forced local mode). Guided by [.env.staging.example](file:///c:/projects/tvk-tracker-v2/.env.staging.example). Zero risk of production data corruption!
- **Production Instance (Cloud Sync)**: Syncs with live Firebase Cloud Firestore databases. Guided by [.env.production.example](file:///c:/projects/tvk-tracker-v2/.env.production.example).

To develop with a specific target, copy the respective template to your local untracked `.env.local` file:
```bash
# To target Staging (Forced Local Sandbox):
cp .env.staging.example .env.local

# To target Production (Cloud Firestore):
cp .env.production.example .env.local
```

### Firebase App Hosting (Automated Dynamic SSR)

NammaArasu has transitioned to **Firebase App Hosting**, which supports full dynamic server-side rendering (SSR), API routes, and background jobs out of the box.

* **Automated CI/CD**: Deployments are fully integrated with your GitHub repository. Any push to your target tracking branch (e.g., `main` or your active feature branch) will **automatically trigger a new build and deployment** inside your Firebase App Hosting dashboard.
* **Backend Status**: Managed under the `namma-arasu` App Hosting backend, serving `namma-arasu--namma-arasu.asia-southeast1.hosted.app`.

To trigger a live deployment to your App Hosting backend, simply commit and push your changes to your remote GitHub repository!

---

## 🏗️ Folder Structure

```text
tvk-tracker-v2/
├── .github/                # GitHub Issue & Pull Request Templates
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── districts/      # Interactive District Auditing Page
│   │   ├── kanban/         # JIRA-Style Admin Workflow Board
│   │   ├── promises/       # Dynamic Promise Detail Pages & Evidence Hub
│   │   ├── globals.css     # Semantic Custom Property tokens (Light/Dark themes)
│   │   └── layout.tsx      # Core Viewport Layouts & SEO metadata
│   ├── components/         # Reusable theme-adaptive UI widgets
│   ├── lib/                # Database Services, Fallbacks, and Pre-seeded Data
│   │   ├── db.ts           # Unified Sync/Fallback promiseService
│   │   └── mockData.ts     # Tamil Nadu district datasets & parsing engine
│   ├── types/              # Strict TypeScript definitions
│   └── __tests__/          # Automated Unit & Integration test suites
├── public/                 # Interactive SVG maps and official manifesto PDFs
├── schema.sql              # Supabase / PostgreSQL Relational Database seeds
├── tsconfig.json           # Strict TypeScript compilation rules
├── vitest.config.ts        # Testing configuration (JSDOM, aliases)
└── LICENSE                 # Open-Source MIT License
```

---

## 🏛️ Design & Engineering Philosophy

This application is designed to be a **serious public digital institution**, not a political marketing tool or startup prototype.

1. **Vibrant & Restrained Aesthetics**: High-contrast, theme-adaptive styling. Uses alpha-opacity statuses (e.g., `bg-emerald-500/15 text-emerald-700`) for visual clarity without clutter.
2. **Strict TypeScript & Type-Safety**: 100% strict TypeScript types. Generics and clear interfaces are declared and enforced across all modules to ensure zero-regression community updates.
3. **Optimized Performance**: Small bundles, lazy loading of interactive components (like maps), and efficient client-side sorting to eliminate the need for immediate complex database composite indices.
4. **Accessibility First**: Full semantic HTML5 structures, screen-reader compatible tags, ARIA labels, and high-contrast styling conforming to WCAG 2.1 AA standards.

---

## 🤝 Community & Contributions

We welcome contributions from citizens, researchers, developers, and administrators of all backgrounds.

- To learn how to set up your environment, follow our branching conventions, and write code, see [CONTRIBUTING.md](file:///c:/projects/tvk-tracker-v2/CONTRIBUTING.md).
- To understand the structural components of our app, see [ARCHITECTURE.md](file:///c:/projects/tvk-tracker-v2/ARCHITECTURE.md).
- To read about our data and API signatures, see [DATABASE.md](file:///c:/projects/tvk-tracker-v2/DATABASE.md) and [API_DOCUMENTATION.md](file:///c:/projects/tvk-tracker-v2/API_DOCUMENTATION.md).
- Please adhere to our [CODE_OF_CONDUCT.md](file:///c:/projects/tvk-tracker-v2/CODE_OF_CONDUCT.md) during all interactions.

---

## 📄 License

This project is licensed under the open-source MIT License - see the [LICENSE](file:///c:/projects/tvk-tracker-v2/LICENSE) file for details.
