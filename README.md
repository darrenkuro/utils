<h1 align="center">@darrenkuro/utils</h1>

<p align="center">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License"/>
    <img src="https://img.shields.io/badge/status-stable-brightgreen?style=flat-square&logo=git&logoColor=white" alt="Status">
</p>

> Personal utility package bundling neverthrow, pino, radashi, and tempo with custom helpers.

---

## Overview

A single import for commonly used utilities across personal TypeScript projects. Tree-shakable with two entry points:

- `@darrenkuro/utils` — Universal (no Node.js dependencies)
- `@darrenkuro/utils/node` — Node.js-specific (logging, process, macOS integrations)

Re-exports curated subsets of [neverthrow](https://github.com/supermacro/neverthrow), [radashi](https://github.com/radashi-org/radashi), [@formkit/tempo](https://github.com/formkit/tempo), and [pino](https://github.com/pinojs/pino).

## Tech Stack

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) ![tsup](https://img.shields.io/badge/-tsup-000000?style=flat-square&logo=esbuild&logoColor=white)

---

## `@darrenkuro/utils`

Universal entry point — safe for any JS runtime (browser, edge, Node.js).

### Re-exports

- **neverthrow** — `ok`, `err`, `Ok`, `Err`, `Result`, `ResultAsync`, `okAsync`, `errAsync`, `fromPromise`, `fromSafePromise`, `fromThrowable`, `safeTry`
- **radashi** — Arrays (`alphabetical`, `boil`, `cluster`, `counting`, `diff`, `first`, `flat`, `fork`, `group`, `intersects`, `iterate`, `last`, `list`, `max`, `merge`, `min`, `objectify`, `range`, `replaceOrAppend`, `replace`, `select`, `shift`, `sift`, `sort`, `sum`, `toggle`, `unique`, `zipToObject`, `zip`), Async (`all`, `defer`, `guard`, `map`, `parallel`, `reduce`, `retry`, `sleep`, `tryit`), Object (`assign`, `clone`, `construct`, `crush`, `get`, `invert`, `keys`, `listify`, `lowerize`, `mapEntries`, `mapKeys`, `mapValues`, `omit`, `pick`, `set`, `shake`, `upperize`), String (`camel`, `capitalize`, `dash`, `pascal`, `snake`, `template`, `title`, `trim`), Number (`clamp`, `inRange`, `toFloat`, `toInt`), Typed (`isArray`, `isDate`, `isEmpty`, `isEqual`, `isFloat`, `isFunction`, `isInt`, `isNumber`, `isObject`, `isPrimitive`, `isPromise`, `isString`, `isSymbol`), Function (`debounce`, `memo`, `partial`, `partob`, `proxied`, `throttle`), Random (`draw`, `random`, `shuffle`, `uid`), Series (`series`)
- **tempo** — Creation (`date`, `tzDate`, `parse`, `parseParts`), Formatting (`format`, `formatStr`, `parts`, `iso8601`), Add/Subtract (`addDay`, `addMonth`, `addYear`, `addHour`, `addMinute`, `addSecond`, `addMillisecond`), Boundaries (`dayStart`, `dayEnd`, `monthStart`, `monthEnd`, `yearStart`, `yearEnd`, `weekStart`, `weekEnd`, `hourStart`, `hourEnd`, `minuteStart`, `minuteEnd`), Comparison (`isBefore`, `isAfter`, `dateIsEqual`, `isPast`, `isFuture`, `sameDay`, `sameHour`, `sameMinute`, `sameSecond`, `sameMillisecond`, `sameYear`), Diff (`diffMilliseconds`, `diffSeconds`, `diffMinutes`, `diffHours`, `diffDays`, `diffWeeks`, `diffMonths`, `diffYears`), Utilities (`dayOfYear`, `monthDays`, `yearDays`, `fourDigitYear`, `nearestDay`, `dateRange`), Timezone (`offset`, `applyOffset`, `removeOffset`, `ap`)

> **Note:** To avoid naming conflicts, tempo's `range` is exported as `dateRange` and tempo's `isEqual` as `dateIsEqual`.

### Custom Utilities

| Function | Signature | Description |
|---|---|---|
| `getErrorMessage` | `(error: unknown) => string` | Safely extracts error message from unknown error types. Returns the `.message` property for `Error` instances, the string itself for string errors, or `'unknown_error'` as fallback. |

---

## `@darrenkuro/utils/node`

Node.js-specific entry point — includes pino, process management, and macOS integrations.

### Re-exports

- **pino** — Full pino logger library exported as `pino`

### Custom Utilities

| Function | Signature | Description |
|---|---|---|
| `createLogger` | `(name: string, opts?: CreateLoggerOptions) => Logger` | Create a named pino logger. Options: `level` (default `'info'`), `pretty` (enables pino-pretty with colorize), `options` (raw pino `LoggerOptions` spread). |
| `logger` | `Logger` | Pre-configured pino-pretty logger (`level: 'debug'`, colorized, `HH:MM:ss` timestamps, `[module] msg` format). |
| `suppressConsole` | `<T>(fn: () => Promise<T>) => Promise<T>` | Suppress `console.log`/`console.error` during the synchronous initialization phase of an async function. Console is restored before awaiting the promise. |
| `sendNotification` | `(title: string, message: string) => void` | Send a macOS Notification Center alert via `osascript`. No-op on non-macOS. |
| `playSound` | `(sound?: string) => void` | Play a macOS system sound by name (e.g. `'Glass'`, `'Ping'`) or file path. Defaults to `'Glass'`. No-op on non-macOS. |
| `verifyEnvs` | `<T extends string>(keys: readonly T[]) => Result<Record<T, string>, string>` | Validate that all required environment variables are set. Returns `ok` with a typed record or `err` with a message listing missing vars. |
| `gracefulShutdown` | `(cleanup: () => Promise<void> \| void) => void` | Register SIGINT/SIGTERM handlers that run `cleanup` exactly once, then exit. Exits with code 1 if cleanup throws, 0 otherwise. |

### Types

| Type | Description |
|---|---|
| `LogLevel` | `'trace' \| 'debug' \| 'info' \| 'warn' \| 'error' \| 'fatal'` |
| `CreateLoggerOptions` | `{ level?: LogLevel; pretty?: boolean; options?: LoggerOptions }` |
| `Logger` | Pino logger instance type |

---

## Installation

```bash
pnpm add @darrenkuro/utils
```

### Usage

```ts
// Universal utilities — works everywhere
import { ok, err, getErrorMessage, sort, format } from '@darrenkuro/utils';

// Node.js utilities — server-side only
import { createLogger, verifyEnvs, gracefulShutdown } from '@darrenkuro/utils/node';

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
