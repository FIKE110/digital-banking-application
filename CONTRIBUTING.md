# Contributing

## Branch Strategy

- `main` — production-ready code. Protected; no direct pushes.
- `feat/<name>` — new features.
- `fix/<name>` — bug fixes.
- `chore/<name>` — tooling, config, dependencies.

Base all branches off `main` and open a PR when ready.

## Commit Messages

Use conventional commits:

```
<type>: <short description>

feat: add transfer validation
fix: correct ledger double-entry bug
chore: update docker-compose redis version
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`.

## Code Style

- Java 17, Spring Boot conventions.
- Use 4-space indentation. No tabs.
- Follow existing patterns in the codebase.
- No commented-out code.
- Keep methods small and focused.

## Before Committing

Ensure the project builds cleanly:

```bash
./mvnw clean verify
```

No warnings, no failing tests.

## PR Checklist

- [ ] Build passes (`./mvnw clean verify`)
- [ ] New tests added for any new logic
- [ ] No debug logs or TODOs left in production code
- [ ] PR description explains _what_ and _why_