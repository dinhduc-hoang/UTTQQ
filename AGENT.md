# AGENT.md

## Purpose

This file is a lightweight routing guide for low-context prompts.
It is intentionally descriptive rather than frozen to the current feature set.

Use it to understand:

- what each folder is responsible for
- which layer should own a change
- how a request should flow through the codebase
- which agent and skill should be selected for a task

## Working Principles

- Route by intent first, file names second.
- Prefer the smallest owning layer.
- Keep architecture flexible while the repository is still evolving.
- Do not invent new layers unless the existing ones cannot support the change.
- If the request is ambiguous, ask one concise clarifying question.

## Repository Architecture Map

The repository follows a layered React application structure.
The map below describes folder responsibility, not a fixed product scope.

### Root and Tooling

- `main.jsx` boots the React application.
- `App.jsx` mounts the router.
- `vite.config.js`, `tailwind.config.js`, and `eslint.config.js` define build, styling, and linting behavior.
- `package.json` defines scripts and dependencies.

### Routing Layer

- `src/routes/` owns route composition and navigation boundaries.
- `src/routes/index.jsx` aggregates the route groups.
- `src/routes/AuthRoute.jsx` handles authentication-related routes and redirects.
- `src/routes/UserRouter.jsx` handles authenticated user routes.
- `src/routes/ReviewRoute.jsx` handles the nested review flow.

Routing changes should start here whenever the request is about navigation, route guards, or screen ownership.

### Layout Layer

- `src/layouts/` contains the shell components that frame pages.
- `src/layouts/auth/` is for auth-facing shells.
- `src/layouts/user/` is for user-facing shells and landing composition.

Layout changes belong here when the request affects page scaffolding, sidebars, top bars, spacing, or cross-screen wrappers.

### Page Layer

- `src/pages/` contains screen-level features grouped by domain.
- `src/pages/auth/` holds login, register, and onboarding screens.
- `src/pages/user/dashboard/` holds authenticated dashboard screens.
- `src/pages/user/dashboard/review/` holds the review workflow screens.
- `src/pages/user/landing/` holds landing-page sections.

Page changes belong here when the request is specific to one screen or one feature flow.

### Shared UI Layer

- `src/components/` contains reusable UI blocks that can be shared across pages.
- `src/components/popup/` contains modal and dialog components.

Shared UI should stay presentation-focused. Business logic should stay in the page, hook, service, or utility layer.

### Data and Logic Layer

- `src/services/` contains API calls and remote data access.
- `src/config/` contains environment-driven configuration and endpoint maps.
- `src/hooks/` contains reusable stateful logic.
- `src/utils/` contains pure helper functions and derived data.
- `src/constants/` contains static data, icons, enums, and copy.

Use these folders when the request involves data fetching, transformation, shared behavior, or static definitions.

### Assets Layer

- `src/assets/` contains imported images and icons.
- `public/` contains files that should be served as-is.

### Meta Layer

- `.agent/` contains routing rules, agents, skills, workflows, and helper scripts.
- This layer is for AI and workflow metadata, not product implementation.

## Default Flow

When a request comes in, follow this order:

1. Classify the intent.
2. Choose the primary agent.
3. Load only the supporting skills that match the intent.
4. Find the owning folder.
5. Edit the smallest file that actually owns the behavior.
6. Validate with the lightest useful check.
7. If another layer is affected, update it in the same change.

## Skill Routing Guide

### Frontend and UI

Use `frontend-specialist` when the request is about UI, layout, Tailwind, responsive behavior, components, or screen composition.

Common supporting skills:

- `frontend-design`
- `web-design-guidelines`
- `tailwind-patterns`
- `lint-and-validate`

### Backend and API

Use `backend-specialist` when the request is about auth, endpoints, data access, server logic, or API design.

Common supporting skills:

- `api-patterns`
- `nodejs-best-practices`
- `database-design`
- `lint-and-validate`

### Code Understanding and Refactoring

Use `code-archaeologist` when the request is about understanding legacy code, refactoring, or reverse engineering unclear behavior.

Common supporting skills:

- `clean-code`
- `code-review-checklist`
- `refactoring-patterns`

### Debugging

Use `debugger` when the request is about a broken flow, a crash, or unexpected runtime behavior.

Common supporting skills:

- `systematic-debugging`

### Testing

Use `test-engineer` when the request is about tests, coverage, regressions, or user-flow verification.

Common supporting skills:

- `testing-patterns`
- `tdd-workflow`
- `webapp-testing`

### Performance

Use `performance-optimizer` when the request is about slow rendering, bundle size, or runtime performance.

Common supporting skills:

- `performance-profiling`

### Planning and Multi-Domain Work

Use `project-planner` when the request needs discovery, task breakdown, or scope definition.

Use `orchestrator` when the request touches multiple domains at once.

Common supporting skills:

- `plan-writing`
- `brainstorming`
- `architecture`
- `parallel-agents`

## Prompt Interpretation Rules

Low-context prompts should be interpreted by outcome, not by exact wording.

Examples:

- "make the login screen cleaner" -> frontend-specialist
- "fix the route that does not open" -> debugger or frontend-specialist, depending on symptoms
- "read this code and explain it" -> code-archaeologist
- "write tests for this flow" -> test-engineer
- "the app is slow" -> performance-optimizer
- "connect auth to the API" -> backend-specialist
- "this touches many files" -> orchestrator

## Guardrails

- Do not hardcode unfinished screen inventory into the architecture map.
- Keep `routes -> layouts -> pages -> components -> utils/constants/services` as the default flow.
- Prefer composition over new global abstractions.
- Add new folders only when a distinct responsibility exists.
- Treat this repository as evolving, not complete.

## Example Change Flow

If the request is about navigation:

1. Start in `src/routes/`.
2. Check the owning layout in `src/layouts/`.
3. Update the affected page in `src/pages/`.
4. Update shared UI only if needed.

If the request is about data or auth:

1. Start in `src/config/` or `src/services/`.
2. Update the consuming hook or page.
3. Keep UI changes separate from data changes unless the behavior requires both.

If the request is about shared presentation:

1. Start in `src/components/`.
2. Move reusable logic into `src/hooks/` or `src/utils/`.
3. Keep page-specific state inside the page.

## Final Rule

If the prompt is too vague to map safely, ask one question, not five.