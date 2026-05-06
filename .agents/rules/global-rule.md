---
trigger: always_on
---

# GLOBAL ENGINEERING RULES

You are building a production-grade civic governance platform.

This is NOT a prototype-only code dump.

Every feature, component, schema, API route, and UI decision must be implemented as if this application will eventually serve:

* millions of citizens
* journalists
* RTI activists
* researchers
* governance analysts
* public administrators

The codebase must prioritize:

* maintainability
* observability
* scalability
* readability
* developer experience
* documentation quality
* deployment readiness

---

# DEVELOPMENT STANDARDS

## ALWAYS:

* use strict TypeScript
* use modular architecture
* use reusable components
* avoid duplication
* separate business logic cleanly
* create scalable folder structures
* follow consistent naming conventions
* write self-documenting code
* keep components focused and small
* optimize for long-term maintainability

---

# GIT + VERSION CONTROL

Initialize and maintain:

* proper git structure
* meaningful commits
* branch-ready architecture

Generate:

* `.gitignore`
* `.gitattributes`
* semantic commit recommendations
* release/version notes structure

Maintain:

* CHANGELOG.md

Use:

* semantic versioning

Example:

```text id="gq2k1h"
v0.1.0
v0.2.0
v1.0.0
```

---

# DOCUMENTATION REQUIREMENTS

ALWAYS generate and maintain:

## README.md

Must include:

* project overview
* architecture
* stack
* setup instructions
* environment variables
* local development
* deployment guide
* folder structure
* design philosophy

---

## CONTRIBUTING.md

Include:

* coding standards
* PR conventions
* naming conventions
* branch strategy
* commit message standards

---

## ARCHITECTURE.md

Document:

* frontend architecture
* backend architecture
* database relationships
* state management
* authentication flow
* storage flow
* scalability considerations

---

## API_DOCUMENTATION.md

Document:

* endpoints
* request models
* response models
* auth requirements
* error responses

---

## DATABASE.md

Document:

* tables
* relationships
* indexes
* constraints
* RLS policies
* migration strategy

---

# CHANGELOG RULES

Every meaningful feature addition must update:

* CHANGELOG.md

Use:

```md id="h5owvt"
## [0.2.0] - 2026-05-05

### Added
- Kanban workflow board
- Promise detail page
- District filtering

### Changed
- Improved Supabase query performance

### Fixed
- Mobile layout overflow issue
```

---

# ENVIRONMENT MANAGEMENT

Generate:

* `.env.example`

Never hardcode:

* API keys
* secrets
* tokens
* credentials

Use environment variables properly everywhere.

---

# DATABASE ENGINEERING

Use:

* proper normalization
* indexed columns
* foreign keys
* scalable schemas
* migration-safe design

Always include:

* created_at
* updated_at
* UUID primary keys

Add:

* database indexes where appropriate
* pagination-ready queries
* efficient filtering architecture

---

# SECURITY REQUIREMENTS

Implement:

* Supabase Row Level Security (RLS)
* secure upload validation
* rate limiting preparation
* sanitized inputs
* proper auth guards
* role-ready architecture

Never:

* expose secrets
* trust client-side validation alone
* allow unrestricted uploads

---

# FILE STORAGE RULES

Uploads must support:

* images
* PDFs
* videos

Include:

* validation
* file size limits
* MIME checking
* secure storage paths

---

# UI/UX RULES

The UI must feel:

* institutional
* trustworthy
* transparent
* modern
* fast
* uncluttered

Inspired by:

* Linear
* Notion
* GitHub
* modern intelligence dashboards

Avoid:

* excessive animations
* gimmicks
* political branding
* clutter
* dashboard overload

---

# RESPONSIVENESS

Everything must work on:

* desktop
* tablet
* mobile

Mobile UX is mandatory.

Not optional.

---

# PERFORMANCE REQUIREMENTS

Optimize:

* bundle size
* rendering
* Supabase queries
* hydration
* loading states

Use:

* lazy loading
* server components where appropriate
* pagination
* caching strategies

---

# ACCESSIBILITY

Implement:

* keyboard navigation
* semantic HTML
* aria labels
* screen-reader compatibility
* sufficient contrast ratios

Accessibility is mandatory.

---

# ERROR HANDLING

Include:

* loading states
* empty states
* retry states
* friendly error messages
* fallback UI

Never leave broken screens.

---

# OBSERVABILITY + DEBUGGING

Prepare architecture for:

* analytics
* logging
* monitoring
* error tracking

Generate placeholders/integration-ready structure for:

* Sentry
* PostHog
* OpenTelemetry

---

# TESTING

Prepare:

* unit testing structure
* integration testing structure
* component testing structure

Use:

* Vitest
* Playwright

Include sample tests.

---

# CODE QUALITY

Configure:

* ESLint
* Prettier
* Husky
* lint-staged

Enforce:

* strict formatting
* import ordering
* type safety

---

# DEPLOYMENT

Prepare production deployment for:

* Vercel
* Supabase

Include:

* deployment checklist
* environment setup guide
* production build verification

---

# SCALABILITY

Design architecture assuming future support for:

* multilingual support
* public APIs
* AI summarization
* district analytics
* public petitions
* RTI integrations
* map layers
* real-time updates
* notification systems

Do not overengineer now,
but do not create dead-end architecture.

---

# ENGINEERING PHILOSOPHY

Build software that:

* another team can inherit
* journalists can trust
* citizens can understand
* developers can extend
* governments can eventually adopt

The platform should feel like:
a serious public digital institution,
not a startup toy project.
