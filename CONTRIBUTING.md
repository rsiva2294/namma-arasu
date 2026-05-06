# Contributing to NammaArasu

Thank you for contributing to NammaArasu (நம்ம அரசு), a production-grade civic governance transparency platform. Please review the following standards to ensure code quality, maintainability, and alignment with our institutional design guidelines.

## Development Standards

### Coding Guidelines
* **Strict TypeScript**: Never use `any`. Always declare precise interfaces and types under `src/types/`.
* **Focused Components**: Keep React components modular and single-responsibility. Do not exceed 300 lines for visual modules.
* **Semantic Theming**: Never use hardcoded HEX/RGB background or text colors (e.g. `bg-[#11151d]`, `text-white`). Use dynamic theme-adaptive tokens:
  * Colors: `bg-background`, `bg-card`, `text-foreground`, `border-border`, `text-muted-foreground`
  * Badges: Utilize transparent alpha-opacity values (e.g. `bg-emerald-500/15 text-emerald-700`) for high contrast on both white and dark backdrops.

### Branching Strategy
* **Main Branch**: `master` (production-ready).
* **Feature Branches**: `feature/your-feature-name` (e.g., `feature/theme-toggle`, `feature/kanban-board`).
* **Fix Branches**: `fix/bug-description`.

### Commit Message Standards
We follow the semantic commit message format:
```text
<type>(<scope>): <short description>
```

#### Types:
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation changes
* `style`: Code style/formatting updates (no logic changes)
* `refactor`: Structural changes that neither fix bugs nor add features
* `test`: Adding or updating tests

#### Examples:
* `feat(theme): add dynamic light/dark mode toggler to header`
* `fix(kanban): apply shrink-0 to prevent card vertical squeezing`
* `docs(readme): update system architecture diagrams`
