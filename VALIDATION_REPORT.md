# MatchFight API Validation Report

**Monorepo**: `/mnt/arquivos/Trabalho/MatchFight` (T3 stack: Next.js + Expo + tRPC)
**Scope**: All tRPC endpoints accepting text input, validation, rate limiting, and DB schema

---

## 1. tRPC Endpoints Accepting Text Input

| Route | Endpoint | Text Fields Accepted | Zod Schema (validators/src/index.ts) | DB Type (schema.ts) |
|-------|----------|---------------------|--------------------------------------|---------------------|
| `profile.update` | `protectedProcedure` | `nickname`, `bio`, `location` | nickname: `z.string().min(1).max(64)`<br>bio: `z.string().max(500).optional()`<br>location: `z.string().max(128).optional()` | nickname: `t.varchar({ length: 64 })`<br>bio: `t.text()`<br>location: `t.varchar({ length: 128 })` |
| `fight.propose` | `protectedProcedure` | `location`, `lat`, `lng`, `scheduledAt` | location: `z.string().min(1).max(256)`<br>lat/lng: numbers<br>scheduledAt: `z.string().datetime({ offset: true })` | location: `t.varchar({ length: 256 })`<br>lat/lng: `t.doublePrecision()`<br>scheduledAt: `t.timestamp` |
| `chat.send` | `protectedProcedure` | `content` | content: `z.string().min(1).max(2000)` | content: `t.text()` |
| `post.create` | `protectedProcedure` | `title`, `content` | title: `z.string().max(256)`<br>content: `z.string().max(256)` | title: `t.varchar({ length: 256 })`<br>content: `t.text()` |
| `swipe.like` / `swipe.pass` | `protectedProcedure` | `targetId` | targetId: `z.string().min(1).max(64)` | targetId: `t.text()` (references user.id) |
| `fight.complete` | `protectedProcedure` | `winnerId` | winnerId: `z.string().min(1).max(64)` | winnerId: `t.text()` (references user.id) |
| `fight.confirm` / `fight.acceptJudge` / `fight.cancel` | `protectedProcedure` | `fightId` | fightId: `z.string().uuid()` | fightId: `t.text()` (references user.id) |

**Endpoints with NO text input fields**: `profile.getByUser`, `profile.getMe`, `post.all`, `post.byId`, `post.delete`, `auth.*`, `fight.my`, `fight.byId`, `fight.forJudge`, `swipe.candidates`

---

## 2. Validation Per Field

### Zod `max()`/`min()`/`trim` limits

| Field | Zod Limit | DB Limit | Has `max()`? | Has `min()`? | Has `trim()`? |
|-------|-----------|----------|--------------|--------------|---------------|
| `profile.nickname` | `.max(64)` | `varchar(64)` | ✅ Yes | ✅ `.min(1)` | ❌ No |
| `profile.bio` | `.max(500)` | `text` (no length limit) | ✅ Yes (500) | ❌ No | ❌ No |
| `profile.location` | `.max(128)` | `varchar(128)` | ✅ Yes | ❌ No | ❌ No |
| `fight.propose.location` | `.max(256)` | `varchar(256)` | ✅ Yes | ✅ `.min(1)` | ❌ No |
| `chat.sendMessage.content` | `.max(2000)` | `text` (no length limit) | ✅ Yes (2000) | ✅ `.min(1)` | ❌ No |
| `post.create.title` | `.max(256)` | `varchar(256)` | ✅ Yes | ❌ No | ❌ No |
| `post.create.content` | `.max(256)` | `text` (no length limit) | ✅ Yes (256) | ❌ No | ❌ No |
| `swipe.like/pass.targetId` | `.max(64)` | `text` (user.id) | ✅ Yes (64) | ✅ `.min(1)` | ❌ No |
| `fight.complete.winnerId` | `.max(64)` | `text` (user.id) | ✅ Yes (64) | ✅ `.min(1)` | ❌ No |
| `fight.confirm/acceptJudge/cancel.fightId` | `.uuid()` | `text` | ✅ Yes (uuid) | ❌ No | ❌ No |

### Fields WITHOUT `max()` limit in Zod (accept unlimited text)

| Field | Zod Schema | DB Type |
|-------|-----------|---------|
| `profile.bio` (no max) | `z.string().optional()` | `t.text()` |
| `chat.sendMessage.content` has `.max(2000)` — **but** the DB column is `t.text()` without length limit |
| `post.create.content` has `.max(256)` — **but** the DB column is `t.text()` without length limit |

**Note**: `profile.bio` is the only field that accepts truly unlimited text in both Zod and DB (`t.text()`). All other "text" fields have explicit `max()` in Zod that correspond to `varchar` lengths in DB.

### Location/City Validation

| Field | City/Location Validation? | Details |
|-------|--------------------------|---------|
| `profile.location` | ❌ No | Accepts any string up to 128 chars. No city validation, no enum, no reference table. |
| `fight.location` | ❌ No | Accepts any string up to 256 coords/name. No city validation. |

**Conclusion**: Both `location` fields are free-form strings. No validation that the value is a "real city". Could be city name, address, coordinates description, or arbitrary text.

### Sanitization

| Sanitization Type | Implemented? | Where |
|-------------------|--------------|-------|
| `trim()` | ❌ Not in Zod schemas | Not explicitly applied in any schema. Would need to be added at the handler level. |
| XSS sanitization | ❌ Not found | No `xss` or `DOMPurify`-style sanitization in Zod schemas or handlers. |
| `.trim()` in code | ❌ Not observed | The Zod schemas do not include `.trim()`. Any trimming would need to happen in the mutation/query handlers. |
| Lowercase/uppercase normalization | ❌ Not found | No case normalization in schemas. |

---

## 3. Rate Limiting

| Rate Limiting Presence | Location | Configuration |
|------------------------|----------|---------------|
| ❌ **No rate limiting** found in the API | — | — |

**Search results**:
- `packages/api/src/` — no files contain `rate.limit`, `RateLimit`, `rateLimit`, `limiter`, or `throttle`
- `packages/api/src/trpc.ts` — only contains `timingMiddleware` for debug latency, no rate limiting
- `packages/api/package.json` — no rate-limit dependencies listed
- `express-rate-limit` appears in `pnpm-lock.yaml` as a transitive dependency, but **is not used** in the codebase
- No Redis-based rate limiting, no Hono middleware, no Express middleware wrapping the tRPC app

**Conclusion**: **No rate limiting** is configured on any endpoint. The API is open to unlimited requests per endpoint.

---

## 4. Database City/Location Reference Data

| Table | Column | Type | Valid Values / Reference? |
|-------|--------|------|---------------------------|
| `profile` | `location` | `varchar(128)` | ❌ Free text. No reference to city table. |
| `fight` | `location` | `varchar(256)` | ❌ Free text. No reference to city table. |
| Any city table / seed | ❌ Not found | — | No `city` table, no `cities` seed data, no enum of valid cities. |

**Conclusion**: The `location` fields are purely free-form strings. There is no table of valid cities, no enum, and no seed data. The app accepts any string up to the varchar length.

---

## 5. Database Schema — Field Types and Sizes

### `profile` table (line 37-55 of `packages/db/src/schema.ts`)

| Column | Type | Length | Nullable | Notes |
|--------|------|--------|----------|-------|
| `id` | `uuid()` | — | notNull | primaryKey, defaultRandom |
| `userId` | `text("user_id")` | — | notNull | unique, FK → user.id |
| `nickname` | `varchar({ length: 64 })` | 64 | notNull | |
| `bio` | `text()` | — | nullable | no length limit in DB |
| `role` | `pgEnum("role")` | — | notNull | ["fighter", "judge", "both"] |
| `weightClass` | `pgEnum("weight_class")` | — | nullable | enum of 8 weight classes |
| `wins` | `integer()` | — | notNull | default 0 |
| `losses` | `integer()` | — | notNull | default 0 |
| `location` | `varchar({ length: 128 })` | 128 | nullable | |
| `createdAt` | `timestamp("created_at")` | — | notNull | defaultNow |
| `updatedAt` | `timestamp("updated_at")` | — | — | $onUpdate now |

### `fight` table (line 78-119 of `packages/db/src/schema.ts`)

| Column | Type | Length | Nullable | Notes |
|--------|------|--------|----------|-------|
| `id` | `uuid()` | — | notNull | primaryKey, defaultRandom |
| `fighter1Id` | `text("fighter1_id")` | — | notNull | FK → user.id |
| `fighter2Id` | `text("fighter2_id")` | — | notNull | FK → user.id |
| `judgeId` | `text("judge_id")` | — | nullable | FK → user.id |
| `status` | `fightStatusEnum("status")` | — | notNull | enum: pending/scheduled/completed/cancelled |
| `location` | `varchar({ length: 256 })` | 256 | nullable | |
| `lat` | `doublePrecision()` | — | nullable | GPS latitude |
| `lng` | `doublePrecision()` | — | nullable | GPS longitude |
| `scheduledAt` | `timestamp("scheduled_at")` | — | nullable | |
| `winnerId` | `text("winner_id")` | — | nullable | FK → user.id |
| `createdById` | `text("created_by_id")` | — | nullable | FK → user.id |
| `createdAt` | `timestamp("created_at")` | — | notNull | defaultNow |
| `updatedAt` | `timestamp("updated_at")` | — | — | $onUpdate now |

### `chat_message` table (line 121-137 of `packages/db/src/schema.ts`)

| Column | Type | Length | Nullable | Notes |
|--------|------|--------|----------|-------|
| `id` | `uuid()` | — | notNull | primaryKey, defaultRandom |
| `fightId` | `uuid("fight_id")` | — | notNull | FK → fight.id |
| `senderId` | `text("sender_id")` | — | notNull | FK → user.id |
| `content` | `text()` | — | notNull | no length limit in DB |
| `createdAt` | `timestamp("created_at")` | — | notNull | defaultNow |

### `post` table (line 27-35 of `packages/db/src/schema.ts`)

| Column | Type | Length | Nullable | Notes |
|--------|------|--------|----------|-------|
| `id` | `uuid()` | — | notNull | primaryKey, defaultRandom |
| `title` | `varchar({ length: 256 })` | 256 | notNull | |
| `content` | `text()` | — | notNull | no length limit in DB |
| `createdAt` | `timestamp()` | — | notNull | defaultNow |
| `updatedAt` | `timestamp()` | — | — | $onUpdate now |

---

## Summary Checklist

| Item | Status |
|------|--------|
| **Text input endpoints** | 7 routes with text fields (profile.update, fight.propose, chat.send, post.create, swipe.like/pass, fight.complete, fight confirm/accept/cancel) |
| **Zod `max()` limits per field** | All text fields have `max()` except `profile.bio` (unlimited in DB/Zod) |
| **Zod `min()` limits** | nickname (.min(1)), targetId (.min(1)), winnerId (.min(1)), content (.min(1)) |
| **`trim()` in schemas** | ❌ None |
| **XSS sanitization** | ❌ None |
| **Location city validation** | ❌ None (free-form strings) |
| **Rate limiting** | ❌ None configured |
| **City/location reference table** | ❌ None |
| **DB varchar lengths** | nickname(64), location profile(128), location fight(256), title(256) |
| **DB text fields (unlimited)** | profile.bio, chatMessage.content, post.content, fighter/winner IDs |