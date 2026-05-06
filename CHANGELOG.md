# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
