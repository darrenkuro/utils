<h1 align="center">@darrenkuro/utils</h1>

<p align="center">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License"/>
    <img src="https://img.shields.io/badge/status-stable-brightgreen?style=flat-square&logo=git&logoColor=white" alt="Status">
</p>

> Personal utility package bundling neverthrow, pino, radash, and tempo with custom helpers.

---

## Overview

A single import for commonly used utilities across personal TypeScript projects. Re-exports curated subsets of [neverthrow](https://github.com/supermacro/neverthrow), [pino](https://github.com/pinojs/pino), [radash](https://github.com/sodiray/radash), and [@formkit/tempo](https://github.com/formkit/tempo), plus custom utilities for error handling, env validation, notifications, and process management.

## Tech Stack

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-000000?style=flat-square&logo=esbuild&logoColor=white)

## What's Included

### Re-exports

- **neverthrow** — `Result`, `ResultAsync`, `ok`, `err`, `fromPromise`, `safeTry`, etc.
- **pino** — Logger library + `createLogger` factory with pino-pretty support
- **radash** — Arrays, async, objects, strings, typed checks, functions, random, series
- **tempo** — Date creation, formatting, arithmetic, comparison, diff, and timezone utilities

### Custom Utilities

- `createLogger(name, opts?)` — Create a named pino logger with optional pretty printing
- `logger` — Pre-configured pino-pretty logger for quick use
- `suppressConsole(fn)` — Suppress console output during synchronous init of an async function
- `getErrorMessage(error)` — Safely extract error message from unknown error types
- `sendNotification(title, message)` — macOS Notification Center alert
- `playSound(sound?)` — Play a macOS system sound
- `verifyEnvs(keys)` — Validate required env vars, returns `Result<Record, string>`
- `gracefulShutdown(cleanup)` — Register SIGINT/SIGTERM handlers with cleanup

---

## Installation

```bash
pnpm add @darrenkuro/utils
```

### Usage

```ts
import { ok, err, createLogger, verifyEnvs, gracefulShutdown } from '@darrenkuro/utils';

const log = createLogger('app', { level: 'debug', pretty: true });

const envResult = verifyEnvs(['API_KEY', 'DB_URL'] as const);
if (envResult.isErr()) {
    log.error(envResult.error);
    process.exit(1);
}

gracefulShutdown(() => log.info('shutting down'));
```

### Development

```bash
pnpm install        # install dependencies
pnpm run build      # build with tsup
pnpm run typecheck  # type check
pnpm test           # run tests with vitest
pnpm run release    # bump patch + publish
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

Darren Kuro – [darren0xa@gmail.com](mailto:darren0xa@gmail.com)

GitHub: [@darrenkuro](https://github.com/darrenkuro)
