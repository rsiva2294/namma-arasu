# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
