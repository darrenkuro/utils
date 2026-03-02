# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # install dependencies
pnpm run build      # build with tsup (ESM, declarations, source maps)
pnpm run typecheck  # type check only (tsc --noEmit)
pnpm test           # run all tests (vitest run)
pnpm run release    # bump patch version + publish to npm
```

No linter or formatter is configured — TypeScript strict mode is the primary quality gate.

## Architecture

**@darrenkuro/utils** is a personal utility library that re-exports curated subsets of neverthrow, radashi, @formkit/tempo, and pino, plus custom helpers. Published as `@darrenkuro/utils` on npm.

### Entry Points

Two tree-shakable entry points built by tsup (ESM-only, externalized deps):

- **`src/index.ts`** → `@darrenkuro/utils` — Universal (browser/edge/Node). Re-exports from neverthrow (Result types), radashi (arrays, objects, async, etc.), and tempo (date/time). Custom: `getErrorMessage`.
- **`src/node.ts`** → `@darrenkuro/utils/node` — Node.js-specific. Re-exports pino. Custom: `createLogger`, `logger`, `suppressConsole`, `verifyEnvs`, `gracefulShutdown`, `sendNotification`, `playSound`.

### Naming Conflicts

Tempo's `range` is re-exported as `dateRange` and `isEqual` as `dateIsEqual` to avoid collisions with radashi.

### Testing

Tests live alongside source files (`*.test.ts`). Tests cover custom utilities only — re-exports are not tested. Vitest uses default config (no `vitest.config.ts`).

### Build

tsup config in `tsup.config.ts`. All runtime deps are marked external (not bundled). Output: `dist/` with `.js`, `.d.ts`, and `.js.map` files. Target: Node 18+.
