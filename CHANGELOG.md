# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2026-05-07

### Added
- **Single-Click AI Synthesis**: Upgraded the AI search box (`ManifestoAiSearchBox.tsx`) to silently and automatically execute high-precision semantic searches in the background if the user clicks "Ask AI" directly, completely removing the manual "Deep Search" requirement.
- **Mathematically Aligned Search Mapping**: Fixed Inbam/Porul link generation in `getLivePromiseId` by introducing mathematical index offsets (`pillarIdx - 7` for Inbam, `pillarIdx - 10` for Porul). This perfectly aligns the continuous vector indexing (where Inbam starts at `p8` and Porul starts at `p11`) with the live app routing (which restarts at `p1` for each framework), ensuring that clicking any AI citation or search suggestion takes the user to the exact, correct promise page (e.g. mapping `p-inbam-p9-s1-i0` flawlessly to `/promises/inbam-p2-s2-pr1`).
- **Redesigned Mobile App Bar**: Overhauled `Header.tsx` to force a sleek, cohesive, single horizontal row on mobile viewports. Added adaptive, responsive button labels and intelligent truncation for a clean and ultra-premium appearance.

## [0.6.2] - 2026-05-07

### Added
- **Firebase Anonymous Authentication**: Integrated secure, background pre-authentication (`ensureAnonymousUser`) into the AI search synthesis trigger on mount, completely avoiding any user blocking or delay.
- **Firewall-Proof HTTP Long-Polling**: Configured Firestore connection options in `db.ts` to enforce `experimentalForceLongPolling: true`, bypassing local socket/gRPC blockage on restricted networks and ensuring robust cloud logging.
- **Firebase App Hosting Integration**: Added default web fallback credentials to `db.ts` to support seamless, zero-config SSR deployment out of the box with your new Firebase App Hosting backend.

## [0.6.1] - 2026-05-07

### Added
- **Collapsible Visual Analytics Panel**: Made the visual charts collapsible on both desktop and mobile, collapsed by default, ensuring the Faceted Manifesto Filters and Manifesto Commitments list are instantly visible upon page load.
- **Relocated Showcase Card**: Relocated the pre-seeded "TVK's Journey" showcase card directly into the Manifesto Commitments grid list, sorting it to the top always, and styled it with a premium framework-matched blue-to-purple background gradient and an animated brand badge.
- **Overhauled Search UI**: Overhauled the AI search box with 100% theme compliance (supporting both Light & Dark modes), fully bilingual English/Tamil translations, simplified citizen-friendly copy, and exact promise ID mapping to eliminate page errors.

### Removed
- **Repository Code Cleanup**: Deleted the unimported `InteractiveMap.tsx` component and duplicate root-level PDFs, reclaiming ~18 MB of storage space.

## [0.6.0] - 2026-05-07

### Added
- **Multilingual AI Search Engine**: Implemented a 3-tier hybrid search architecture supporting sub-millisecond local keyword searches (Tier 1), Node runtime semantic vector similarity searches (Tier 2), and grounded structured AI synthesis (Tier 3).
- **Bidirectional Synonym Dictionary**: Added `multilingual_dictionary.json` supporting symmetric translations across English, Tamil, and Tanglish.
- **Pre-build Preprocessing Pipeline**: Created `build_manifesto_index.ts` to flatten manifesto frameworks, validate schemas, generate 3072-dimension vectors with Gemini embeddings API, and split client-side/server-side search indexes.
- **Vector Store Cache Singleton**: Integrated server-side global memory caching service to bypass repeated disk reads and guarantee sub-millisecond similarity lookups.
- **Anonymous Quota Manager**: Created `quotaService.ts` client-side service with local storage soft daily caps and optional Firebase syncing.
- **Premium Search UI Box**: Integrated `<ManifestoAiSearchBox />` with debounced search entries, active quota indicators, and click-verifiable source citations.

## [0.5.0] - 2026-05-06

### Added
- **Bilingual i18n system** (`en`/`ta`) with a centralized `useLanguage` hook and translation dictionary (`src/lib/i18n.ts`).
- Tamil (தமிழ்) translations across all core UI surfaces: Sidebar navigation, Header, Dashboard metrics & filters, Kanban Board columns & controls, Districts Atlas, Manifesto Library, and Promise Detail pages.
- Language toggle button in the Header with persistent `localStorage` preference.
- **SEO foundations**: `robots.ts` (dynamic robots.txt), `sitemap.ts` (auto-generates sitemap.xml from all promise routes), and enhanced `<head>` metadata with Open Graph & Twitter Card tags.
- Searchable Section dropdown with inline search input and click-outside dismiss.
- Dynamic **Framework ↔ Section cross-filter synchronization**: selecting a Section auto-updates Framework; changing Framework resets Section to show only relevant options.
- "Linked" badge indicator on the Section filter label to communicate the cross-filter relationship.

### Changed
- Redesigned the **Faceted Manifesto Filters** panel for visual coherence: flat 12-column grid layout with consistent label positioning, uniform `h-[38px]` input heights, and identical `<ChevronDown>` icons across all selects.
- Removed the nested "Manifesto Scope" card that broke visual rhythm with the surrounding filters.
- Standardized all `<select>` elements to use `appearance-none` with an absolutely-positioned Lucide `ChevronDown` icon instead of mixed inline SVG backgrounds.
- Cleaned up `<option>` labels to show only the translated term (removed redundant dual-language patterns like `Announced (Announced)`).
- All filter labels now use identical typography: `text-[10px] font-bold uppercase tracking-wider`.

## [0.4.0] - 2026-05-06

### Added
- Premium **Regional Development & Manifesto Atlas** with targeted localized schemes, statewide policies, dynamic metric banners, and active verifiable audit filters.
- Interactive **Hamburger Mobile Drawer** for mobile responsive sidebar navigation, removing it from list-scrolling flow.
- Collapsible **Analytics & Charts** and **Faceted Filters** on mobile, saving over 1000px of scrolling space.
- High-contrast **Commitment #X • {Pillar}** badges directly inside the badges row of each dashboard card.

### Changed
- Re-seeded all parsed manifesto promises to `"Announced"` status (with 10% progress).
- Implemented automatic word-boundary **District Extraction** to restrict regional commitments to explicitly mentioned locations, defaulting to Statewide (`"All Districts"`) for everything else.
- Boosted light mode foreground contrast levels for all badges (Status, Priority, Framework) and warning headers from `600`/`700` to high-contrast **`800` strength** classes.
- Compacted the verbose description paragraph on the promise detail page to a clean single line showing only commitment number, pillar, and framework.
- Removed redundant description paragraphs from dashboard cards, expanding title blocks to a clean `line-clamp-3` format.

### Removed
- Legacy "Governance Command Center" welcome panel entirely from the homepage.

## [0.3.0] - 2026-05-06

### Added
- Comprehensive automated testing suite using Vitest and JSDOM to verify local fallback engines and service methods.
- Rigid pre-commit formatting and linting pipelines utilizing Prettier, Husky, and lint-staged.
- Legal, security, and community governance pillars with the MIT License, Code of Conduct, and responsible disclosure policies.
- Standardized GitHub issue (Bug Report, Feature Request) and pull request integration templates.
- Complete, institutional overhaul of all six core documentation manuals to prepare for community onboarding.

## [0.2.0] - 2026-05-06

### Added
- Sun/Moon visual theme toggler synced with browser `localStorage`.
- Comprehensive Light and Dark theme support throughout the platform using semantic CSS custom variables.
- Dynamic color badging pattern with adaptive alpha-opacity classes for statuses and priorities.
- District-Wise Governance Audit regional mapping page with high-contrast interactive Tamil Nadu administrative map components.
- Interactive Kanban Board (JIRA-Style workflow board) supporting stage transition logging and percentage updates.
- Deep, responsive Promise Details page featuring citizen proof submissions, government gazette logging, and governance parameters sticky sidebar.

### Fixed
- Decoupled "Official Admin Mode" button from OS-level `prefers-color-scheme` overrides using custom CSS variables.
- Eliminated dark vertical lines in Kanban lists by converting legacy scrollbar track backgrounds to `transparent`.
- Resolved Kanban card clipping by adjusting list container padding-right to `pr-2`.
- Fixed vertical content overflows on Kanban cards by applying `shrink-0` to card wrapper containers.
