# Contributing to NammaArasu

Thank you for your interest in contributing to NammaArasu (நம்ம அரசு)! By contributing to this civic governance transparency platform, you are helping build a serious public digital institution that empowers citizens, researchers, and journalists with the tools to audit political accountability.

To maintain production-grade software quality, please review and adhere to the following development, contribution, and branching standards.

---

## Code Quality Standards

To maintain a professional, clean, and easily extendable codebase, we enforce strict architectural rules:

### 1. Strict TypeScript

- **No `any` Types**: Always declare precise, strict interfaces and types under `src/types/`. Avoid type casting unless absolutely necessary.
- **Strict Null Checks**: Fully handle empty or loading states for all database operations.

### 2. Component Guidelines

- **Single Responsibility Principle**: Keep React components modular and focused on a single task. Do not mix heavy business calculations with layout code.
- **Size Limits**: Visually complex components must remain small (ideally under 300 lines). Break down large components into cohesive children.
- **Semantic HTML**: Utilize appropriate HTML5 semantic tags (`<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`, `<nav>`) to ensure accessibility (WCAG 2.1 AA) and screen-reader compatibility.

### 3. Theme-Adaptive Styling (globals.css)

- **Avoid Hardcoded Colors**: Never use custom HEX or RGB colors directly in your components (e.g., `text-[#11151d]`, `bg-[#f0f2f5]`).
- **Semantic Tokens**: Always use our custom-variable theme-adaptive tokens. Some core tokens:
  - Canvas background: `bg-background`
  - Floating cards: `bg-card`
  - Typography: `text-foreground`, `text-muted-foreground`
  - Borders: `border-border`
- **Contrast & Transparency**: Utilize high-contrast badging with transparent alpha-opacity values (e.g., `bg-emerald-500/15 text-emerald-700`) so they render perfectly on both pure light and dark backgrounds.

---

## Git Workflow & Branching

We utilize a branch-ready, structured git architecture to streamline community contributions.

### Branching Strategy

All development should occur in specialized branches branched off the `master` branch:

- **Production Branch**: `master` (always stable and deploy-ready).
- **Features**: `feature/your-feature-name` (e.g., `feature/analytics-chart`, `feature/district-pdf-export`).
- **Fixes**: `fix/bug-description` (e.g., `fix/map-clipping`, `fix/localstorage-hydration`).
- **Docs**: `docs/update-description` (e.g., `docs/api-responses`).

---

## Semantic Commit Guidelines

We strictly follow the **Conventional Commits** specification. Commit messages must be structured as follows:

```text
<type>(<scope>): <short description>
```

### Types:

- `feat`: A new feature (e.g., `feat(ui): add progress sliders to kanban card`)
- `fix`: A bug fix (e.g., `fix(db): handle parsing of empty array in localstorage`)
- `docs`: Documentation changes (e.g., `docs(readme): add environment setup guide`)
- `style`: Changes that do not affect the meaning of the code (formatting, linting fixes)
- `refactor`: Structural changes that neither fix bugs nor add features
- `test`: Adding or updating automated tests (e.g., `test(db): verify promise updates`)

---

## Pull Request Workflow

Follow this step-by-step pipeline to submit changes to NammaArasu:

1. **Fork & Clone**: Fork the repository on GitHub and clone it to your local machine.
2. **Setup Environment**: Install all dependencies and verify the app compiles:
   ```bash
   npm install
   npm run lint
   npm run test
   ```
3. **Create Branch**: Create a descriptive feature or bugfix branch off `master`.
4. **Develop**: Write clean, self-documenting code. Add corresponding tests for any new functions or service models under `src/__tests__/`.
5. **Lint & Format**: Prettier and ESLint are configured to run automatically before commits (via `husky` and `lint-staged`). You can manually format using:
   ```bash
   npm run format
   ```
6. **Verify Build**: Ensure that Next.js successfully compiles without any warnings:
   ```bash
   npm run build
   ```
7. **Submit Pull Request**: Open a pull request against the `master` branch. Fill out the pull request template completely, including screenshots/recordings of any UI/UX changes in both Light and Dark modes.

---

## Automated Quality Gates

To prevent regressions, our pre-commit pipeline (configured in `package.json` with Husky and lint-staged) automatically checks modified files:
- Formats all JSON, Markdown, and CSS files using Prettier.
- Lints and fixes TypeScript/React files using ESLint.

Thank you for contributing your skills to build stronger, more transparent civic digital systems!
