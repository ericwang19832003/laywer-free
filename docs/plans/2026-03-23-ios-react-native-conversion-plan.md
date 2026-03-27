# iOS React Native Conversion — Implementation Plan (Phase 0 & 1)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the Lawyer Free Next.js web app into a Turborepo monorepo and build the Expo React Native mobile shell with authentication and case list.

**Architecture:** Turborepo monorepo with `apps/web` (existing Next.js), `apps/mobile` (new Expo), and `packages/shared` (extracted business logic). Mobile app uses expo-router for navigation, NativeWind for styling, TanStack React Query for data, and expo-secure-store for auth tokens. All shared logic (Zod schemas, step definitions, rules, templates) lives in `packages/shared` and is consumed by both apps.

**Tech Stack:** Turborepo, Expo SDK 53+, expo-router v4, NativeWind v4, TanStack React Query, @supabase/supabase-js, expo-secure-store, Reanimated 3, TypeScript 5

**Design doc:** `docs/plans/2026-03-23-ios-react-native-conversion-design.md`

---

## Phase 0: Monorepo Setup

### Task 1: Initialize Turborepo at Project Root

**Files:**
- Create: `turbo.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Modify: `package.json` (root — convert to workspace root)

**Step 1: Create a new branch**

```bash
cd "/Users/minwang/lawyer free"
git checkout -b feat/monorepo-setup
```

**Step 2: Install Turborepo**

```bash
npm install turbo --save-dev
```

**Step 3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:unit": {
      "dependsOn": ["^build"]
    },
    "test:rls": {},
    "test:e2e": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 4: Convert root `package.json` to workspace root**

Add to root `package.json`:

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "test:unit": "turbo test:unit",
    "test:rls": "turbo test:rls",
    "test:e2e": "turbo test:e2e",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.0.0"
  }
}
```

Move all other dependencies to `apps/web/package.json` (next task).

**Step 5: Commit**

```bash
git add turbo.json package.json
git commit -m "chore: initialize Turborepo workspace root"
```

---

### Task 2: Move Next.js App to `apps/web/`

**Files:**
- Create: `apps/web/` (move existing app here)
- Create: `apps/web/package.json` (app-specific deps)
- Create: `apps/web/tsconfig.json` (app-specific config)
- Move: `src/`, `public/`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `next-env.d.ts`, `vercel.json`

**Step 1: Create apps directory and move files**

```bash
mkdir -p apps/web

# Move app source
mv src apps/web/
mv public apps/web/
mv next.config.ts apps/web/
mv eslint.config.mjs apps/web/
mv postcss.config.mjs apps/web/
mv next-env.d.ts apps/web/
mv vercel.json apps/web/
mv components.json apps/web/
mv eng.traineddata apps/web/

# Move test configs (web-specific)
mv playwright.config.ts apps/web/
mv vitest.config.ts apps/web/
mv vitest.rls.config.ts apps/web/
mv playwright-report apps/web/ 2>/dev/null || true
mv test-results apps/web/ 2>/dev/null || true

# Move tests
mv tests apps/web/
```

**Step 2: Create `apps/web/package.json`**

This gets all the existing dependencies (minus turbo/typescript which are at root):

```json
{
  "name": "@lawyer-free/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:rls": "vitest run --config vitest.rls.config.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lawyer-free/shared": "workspace:*",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@supabase/supabase-js": "2.95.3",
    "@supabase/ssr": "0.8.0",
    "zod": "4.3.6",
    "react-hook-form": "7.71.1",
    "@hookform/resolvers": "5.2.2",
    "@anthropic-ai/sdk": "0.78.0",
    "openai": "6.22.0",
    "pdf-lib": "1.17.1",
    "pdf-parse": "2.4.5",
    "tesseract.js": "7.0.0",
    "stripe": "20.4.1",
    "resend": "6.9.3",
    "archiver": "7.0.1",
    "@modelcontextprotocol/sdk": "1.27.1",
    "@gongrzhe/server-gmail-autoauth-mcp": "1.1.11",
    "framer-motion": "12.38.0",
    "lucide-react": "0.564.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "3.4.1",
    "sonner": "2.0.7",
    "@radix-ui/react-dialog": "1.1.14",
    "@radix-ui/react-dropdown-menu": "2.1.15",
    "@radix-ui/react-label": "2.1.7",
    "@radix-ui/react-popover": "1.1.14",
    "@radix-ui/react-progress": "1.1.7",
    "@radix-ui/react-scroll-area": "1.2.9",
    "@radix-ui/react-select": "2.1.14",
    "@radix-ui/react-separator": "1.1.7",
    "@radix-ui/react-slot": "1.2.3",
    "@radix-ui/react-switch": "1.2.5",
    "@radix-ui/react-tabs": "1.1.12",
    "@radix-ui/react-tooltip": "1.2.7",
    "@dnd-kit/core": "6.3.1",
    "@dnd-kit/sortable": "10.0.0",
    "@dnd-kit/utilities": "3.2.2"
  },
  "devDependencies": {
    "@playwright/test": "1.58.2",
    "vitest": "4.0.18",
    "@testing-library/react": "16.3.0",
    "@testing-library/jest-dom": "6.6.3",
    "jsdom": "28.1.0",
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "@types/node": "22.16.0",
    "tailwindcss": "4.1.10",
    "@tailwindcss/postcss": "4.1.10",
    "eslint": "9.30.1",
    "eslint-config-next": "16.1.6"
  }
}
```

Note: Exact dependency versions should be copied from the original `package.json`. The above is representative — verify against the actual file. The key addition is `"@lawyer-free/shared": "workspace:*"`.

**Step 3: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@lawyer-free/shared": ["../../packages/shared/src"],
      "@lawyer-free/shared/*": ["../../packages/shared/src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: Verify directory structure**

```bash
ls apps/web/src/
ls apps/web/public/
ls apps/web/tests/
cat apps/web/package.json | head -5
```

Expected: All source files present under `apps/web/`.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: move Next.js app to apps/web/"
```

---

### Task 3: Create Shared Package Scaffold

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Step 1: Create shared package structure**

```bash
mkdir -p packages/shared/src
```

**Step 2: Create `packages/shared/package.json`**

```json
{
  "name": "@lawyer-free/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schemas": "./src/schemas/index.ts",
    "./schemas/*": "./src/schemas/*",
    "./guided-steps": "./src/guided-steps/index.ts",
    "./guided-steps/*": "./src/guided-steps/*",
    "./rules": "./src/rules/index.ts",
    "./rules/*": "./src/rules/*",
    "./discovery": "./src/discovery/index.ts",
    "./discovery/*": "./src/discovery/*",
    "./motions": "./src/motions/index.ts",
    "./motions/*": "./src/motions/*",
    "./courts": "./src/courts/index.ts",
    "./courts/*": "./src/courts/*",
    "./subscription": "./src/subscription/index.ts",
    "./subscription/*": "./src/subscription/*",
    "./types": "./src/types/index.ts",
    "./types/*": "./src/types/*",
    "./api-client": "./src/api-client/index.ts",
    "./api-client/*": "./src/api-client/*"
  },
  "dependencies": {
    "zod": "4.3.6"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**Step 3: Create `packages/shared/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create entry point**

Create `packages/shared/src/index.ts`:

```typescript
// @lawyer-free/shared
// Re-exports for convenience — prefer deep imports for tree-shaking
export * from './schemas'
export * from './types'
```

**Step 5: Commit**

```bash
git add packages/
git commit -m "chore: create @lawyer-free/shared package scaffold"
```

---

### Task 4: Extract Zod Schemas to Shared Package

**Files:**
- Move: `apps/web/src/lib/schemas/*` → `packages/shared/src/schemas/`
- Create: `packages/shared/src/schemas/index.ts`
- Modify: All web files that import from `@/lib/schemas/*`

**Step 1: Copy schemas to shared package**

```bash
cp -r apps/web/src/lib/schemas/* packages/shared/src/schemas/
```

**Step 2: Create barrel export**

Create `packages/shared/src/schemas/index.ts` that re-exports all schemas:

```typescript
export * from './case'
export * from './task'
export * from './filing'
export * from './discovery'
export * from './deadline'
export * from './evidence'
// ... (export all 26 schema files)
```

List all schema files first:

```bash
ls packages/shared/src/schemas/
```

Then create the barrel file with an export for each `.ts` file (excluding `index.ts`).

**Step 3: Verify schemas have no web-specific imports**

```bash
cd "/Users/minwang/lawyer free"
grep -r "from '@/" packages/shared/src/schemas/ || echo "No web imports found (good)"
grep -r "from 'next" packages/shared/src/schemas/ || echo "No Next.js imports found (good)"
grep -r "from 'react" packages/shared/src/schemas/ || echo "No React imports found (good)"
```

If any schema imports from `@/lib/` (other lib files), those dependencies need to also be in shared or the import needs adjustment. Schemas should be pure Zod — most likely clean.

**Step 4: Update web imports**

Find all files importing from `@/lib/schemas`:

```bash
grep -rl "from '@/lib/schemas" apps/web/src/
```

For each file, update the import path:

```typescript
// Before:
import { createCaseSchema } from '@/lib/schemas/case'

// After:
import { createCaseSchema } from '@lawyer-free/shared/schemas/case'
```

Use a find-and-replace across the codebase:

```bash
# From the project root
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/schemas/|from '@lawyer-free/shared/schemas/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/schemas'|from '@lawyer-free/shared/schemas'|g"
```

**Step 5: Keep originals as re-exports (optional, for safety)**

If you want a gradual migration, you can leave thin re-export files at the original paths:

```typescript
// apps/web/src/lib/schemas/case.ts
export * from '@lawyer-free/shared/schemas/case'
```

This prevents breaking imports you may have missed. Remove these once everything is verified.

**Step 6: Run typecheck**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: No type errors.

**Step 7: Run unit tests**

```bash
cd apps/web && npx vitest run
```

Expected: All tests pass.

**Step 8: Commit**

```bash
git add -A
git commit -m "refactor: extract Zod schemas to @lawyer-free/shared"
```

---

### Task 5: Extract Guided Steps to Shared Package

**Files:**
- Move: `apps/web/src/lib/guided-steps/*` → `packages/shared/src/guided-steps/`
- Create: `packages/shared/src/guided-steps/index.ts`
- Modify: Web imports

**Step 1: Copy guided steps**

```bash
cp -r apps/web/src/lib/guided-steps/* packages/shared/src/guided-steps/
```

**Step 2: Check for web-specific imports**

```bash
grep -r "from '@/" packages/shared/src/guided-steps/ | head -20
```

Guided step files may import from `@/lib/schemas/*` — these now need to point to the shared package:

```bash
find packages/shared/src/guided-steps -name "*.ts" | xargs sed -i '' "s|from '@/lib/schemas/|from '../schemas/|g"
find packages/shared/src/guided-steps -name "*.ts" | xargs sed -i '' "s|from '@/lib/schemas'|from '../schemas'|g"
```

If they import from other `@/lib/` paths (e.g., `@/lib/rules/`), note those — they'll be extracted in subsequent tasks. For now, adjust to relative paths within the shared package.

**Step 3: Create barrel export**

```typescript
// packages/shared/src/guided-steps/index.ts
export * from './types'
// Export each workflow directory's main export
```

**Step 4: Update web imports**

```bash
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/guided-steps/|from '@lawyer-free/shared/guided-steps/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/guided-steps'|from '@lawyer-free/shared/guided-steps'|g"
```

**Step 5: Typecheck + test**

```bash
cd apps/web && npx tsc --noEmit && npx vitest run
```

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: extract guided steps to @lawyer-free/shared"
```

---

### Task 6: Extract Rules, Discovery, Motions, Courts, Subscription

**Files:**
- Move: `apps/web/src/lib/rules/*` → `packages/shared/src/rules/`
- Move: `apps/web/src/lib/discovery/*` → `packages/shared/src/discovery/`
- Move: `apps/web/src/lib/motions/*` → `packages/shared/src/motions/`
- Move: `apps/web/src/lib/courts/*` → `packages/shared/src/courts/`
- Move: `apps/web/src/lib/subscription/*` → `packages/shared/src/subscription/`

This follows the exact same pattern as Tasks 4-5 for each directory. For each:

**Step 1: Copy directory**

```bash
cp -r apps/web/src/lib/rules/* packages/shared/src/rules/
cp -r apps/web/src/lib/discovery/* packages/shared/src/discovery/
cp -r apps/web/src/lib/motions/* packages/shared/src/motions/
cp -r apps/web/src/lib/courts/* packages/shared/src/courts/
cp -r apps/web/src/lib/subscription/* packages/shared/src/subscription/
```

**Step 2: Fix internal imports in shared package**

Any `@/lib/schemas/*` → `../schemas/*`, `@/lib/rules/*` → `../rules/*`, etc. All cross-references within shared should use relative imports:

```bash
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/schemas/|from '../schemas/|g"
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/rules/|from '../rules/|g"
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/discovery/|from '../discovery/|g"
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/motions/|from '../motions/|g"
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/courts/|from '../courts/|g"
find packages/shared/src -name "*.ts" | xargs sed -i '' "s|from '@/lib/subscription/|from '../subscription/|g"
```

Note: Relative path depth may vary — `../schemas/` works if both dirs are siblings under `src/`. Verify the actual structure.

**Step 3: Check for Supabase/Next.js imports in rules**

Some rule files (like `auto-generate-deadlines.ts`) are **orchestrators** that call Supabase directly. These should NOT move to shared — only the pure logic functions should. Split if necessary:

- `deadline-generator.ts` (pure logic) → shared
- `auto-generate-deadlines.ts` (calls Supabase) → stays in `apps/web/src/lib/rules/`

Similarly, `subscription/check.ts` calls Supabase — the `limits.ts` (pure data) moves to shared, `check.ts` stays in web.

```bash
grep -l "supabase" packages/shared/src/rules/*.ts
grep -l "supabase" packages/shared/src/subscription/*.ts
```

Move any files with Supabase imports back to `apps/web/src/lib/`:

```bash
# Example — actual files depend on grep results above
mv packages/shared/src/rules/auto-generate-deadlines.ts apps/web/src/lib/rules/
mv packages/shared/src/subscription/check.ts apps/web/src/lib/subscription/
```

**Step 4: Create barrel exports for each**

Each directory gets an `index.ts` with `export *` for its public types and functions.

**Step 5: Update web imports**

```bash
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/rules/|from '@lawyer-free/shared/rules/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/discovery/|from '@lawyer-free/shared/discovery/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/motions/|from '@lawyer-free/shared/motions/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/courts/|from '@lawyer-free/shared/courts/|g"
find apps/web/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' "s|from '@/lib/subscription/limits|from '@lawyer-free/shared/subscription/limits|g"
```

For files that stayed in web (orchestrators with Supabase), their imports of shared logic update too:

```typescript
// apps/web/src/lib/rules/auto-generate-deadlines.ts
// Before: import { generateDeadlines } from './deadline-generator'
// After:  import { generateDeadlines } from '@lawyer-free/shared/rules/deadline-generator'
```

**Step 6: Typecheck + test**

```bash
cd apps/web && npx tsc --noEmit && npx vitest run
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: extract rules, discovery, motions, courts, subscription to @lawyer-free/shared"
```

---

### Task 7: Extract Shared Types

**Files:**
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/types/case.ts`
- Create: `packages/shared/src/types/task.ts`
- Create: `packages/shared/src/types/api.ts`

**Step 1: Identify shared types**

```bash
grep -r "export type\|export interface" apps/web/src/lib/schemas/ | head -30
grep -r "export type\|export interface" packages/shared/src/ | head -30
```

**Step 2: Create types directory**

Extract common TypeScript types that both web and mobile need — inferred from Zod schemas:

```typescript
// packages/shared/src/types/index.ts
import { z } from 'zod'
import { createCaseSchema, updateTaskSchema } from '../schemas'

// Infer types from Zod schemas
export type CreateCaseInput = z.infer<typeof createCaseSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Re-export any standalone type definitions
export * from './case'
export * from './task'
export * from './api'
```

```typescript
// packages/shared/src/types/api.ts
// Typed API response shapes (used by both web fetchers and mobile React Query)
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: create shared types package"
```

---

### Task 8: Create Shared API Client

**Files:**
- Create: `packages/shared/src/api-client/index.ts`
- Create: `packages/shared/src/api-client/cases.ts`
- Create: `packages/shared/src/api-client/tasks.ts`
- Create: `packages/shared/src/api-client/types.ts`

**Step 1: Study existing fetch patterns**

```bash
grep -r "fetch(" apps/web/src/components/ | head -20
grep -r "fetch(" apps/web/src/app/ | head -20
```

**Step 2: Create typed API client**

The API client wraps `fetch` with typed request/response. It's platform-agnostic — both web and mobile provide their own `fetch` and auth headers.

```typescript
// packages/shared/src/api-client/types.ts
export interface ApiClientConfig {
  baseUrl: string
  getHeaders: () => Promise<Record<string, string>>
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
```

```typescript
// packages/shared/src/api-client/index.ts
import type { ApiClientConfig, HttpMethod } from './types'

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const headers = await config.getHeaders()
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }))
      throw new ApiError(res.status, error.error || 'Request failed')
    }
    return res.json()
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export * from './cases'
export * from './tasks'
export * from './types'
```

```typescript
// packages/shared/src/api-client/cases.ts
import type { createApiClient } from './index'
import type { CreateCaseInput } from '../types'

export function casesApi(client: ReturnType<typeof createApiClient>) {
  return {
    list: () => client.get<{ cases: any[] }>('/api/cases'),
    get: (id: string) => client.get<{ case: any }>(`/api/cases/${id}`),
    create: (data: CreateCaseInput) => client.post<{ case: any }>('/api/cases', data),
    update: (id: string, data: Partial<any>) => client.patch<{ case: any }>(`/api/cases/${id}`, data),
    dashboard: (id: string) => client.get<any>(`/api/cases/${id}/dashboard`),
  }
}
```

```typescript
// packages/shared/src/api-client/tasks.ts
import type { createApiClient } from './index'
import type { UpdateTaskInput } from '../types'

export function tasksApi(client: ReturnType<typeof createApiClient>) {
  return {
    update: (id: string, data: UpdateTaskInput) =>
      client.patch<{ task: any }>(`/api/tasks/${id}`, data),
  }
}
```

This is a starting scaffold — more endpoints will be added as mobile features are built.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: create shared typed API client"
```

---

### Task 9: Install Dependencies and Verify Monorepo

**Step 1: Delete old node_modules and lock file**

```bash
cd "/Users/minwang/lawyer free"
rm -rf node_modules apps/web/node_modules packages/shared/node_modules
rm package-lock.json
```

**Step 2: Install all workspace dependencies**

```bash
npm install
```

**Step 3: Verify turbo can see all workspaces**

```bash
npx turbo ls
```

Expected output should list `@lawyer-free/web` and `@lawyer-free/shared`.

**Step 4: Run typecheck across all packages**

```bash
npx turbo typecheck
```

Fix any type errors. Common issues:
- Relative import depth wrong in shared package
- Missing re-exports in barrel files
- Files that didn't get their imports updated

**Step 5: Run web dev server**

```bash
cd apps/web && npm run dev
```

Verify the web app loads and works normally at `http://localhost:3000`.

**Step 6: Run all tests**

```bash
cd "/Users/minwang/lawyer free"
npx turbo test:unit
npx turbo test:rls
```

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: verify monorepo builds and all tests pass"
```

---

### Task 10: Update Vercel Deployment Config

**Files:**
- Modify: `apps/web/vercel.json`
- Create: `vercel.json` (root, if needed for monorepo)

**Step 1: Configure Vercel for monorepo**

Vercel auto-detects Turborepo. You may need to set the root directory to `apps/web` in Vercel dashboard, or create a root `vercel.json`:

```json
{
  "buildCommand": "cd ../.. && npx turbo build --filter=@lawyer-free/web",
  "installCommand": "cd ../.. && npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

Place this in `apps/web/vercel.json` (replacing the existing crons-only config). Merge the crons in:

```json
{
  "buildCommand": "cd ../.. && npx turbo build --filter=@lawyer-free/web",
  "installCommand": "cd ../.. && npm install",
  "framework": "nextjs",
  "crons": [
    { "path": "/api/cron/send-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/escalation", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/health", "schedule": "0 6 * * *" }
  ]
}
```

**Step 2: Test build**

```bash
cd "/Users/minwang/lawyer free"
npx turbo build --filter=@lawyer-free/web
```

Expected: Next.js build succeeds.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: configure Vercel for Turborepo monorepo"
```

---

## Phase 1: Mobile Shell

### Task 11: Initialize Expo App

**Files:**
- Create: `apps/mobile/` (entire Expo app scaffold)

**Step 1: Create Expo app**

```bash
cd "/Users/minwang/lawyer free/apps"
npx create-expo-app@latest mobile --template blank-typescript
```

**Step 2: Update `apps/mobile/package.json`**

Add the shared package dependency:

```json
{
  "name": "@lawyer-free/mobile",
  "dependencies": {
    "@lawyer-free/shared": "workspace:*"
  }
}
```

**Step 3: Install expo-router and core dependencies**

```bash
cd "/Users/minwang/lawyer free/apps/mobile"
npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated
```

**Step 4: Configure expo-router**

Update `apps/mobile/package.json` to set the entry point:

```json
{
  "main": "expo-router/entry"
}
```

Update `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "Lawyer Free",
    "slug": "lawyer-free",
    "scheme": "lawyerfree",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FAFAF8"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.lawyerfree.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Lawyer Free uses your camera to capture evidence photos and scan documents.",
        "NSPhotoLibraryUsageDescription": "Lawyer Free accesses your photos to upload evidence."
      }
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Step 5: Create initial route**

```bash
mkdir -p apps/mobile/app
```

Create `apps/mobile/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router'

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

Create `apps/mobile/app/index.tsx`:

```tsx
import { View, Text } from 'react-native'

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Lawyer Free</Text>
    </View>
  )
}
```

**Step 6: Verify app runs**

```bash
cd apps/mobile && npx expo start --ios
```

Expected: App launches in iOS Simulator with "Lawyer Free" text.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Expo app with expo-router"
```

---

### Task 12: Configure NativeWind

**Files:**
- Modify: `apps/mobile/app.json`
- Create: `apps/mobile/tailwind.config.ts`
- Create: `apps/mobile/global.css`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Install NativeWind**

```bash
cd apps/mobile
npx expo install nativewind tailwindcss@^4
```

**Step 2: Create `apps/mobile/global.css`**

```css
@import "tailwindcss";

/* Design tokens matching the web app */
:root {
  --color-warm-bg: #FAFAF8;
  --color-warm-text: #1C1917;
  --color-warm-muted: #78716C;
  --color-warm-border: #E7E5E4;
  --color-calm-green: #16A34A;
  --color-calm-amber: #D97706;
  --color-calm-indigo: #4F46E5;
}
```

**Step 3: Create `apps/mobile/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'warm-bg': 'var(--color-warm-bg)',
        'warm-text': 'var(--color-warm-text)',
        'warm-muted': 'var(--color-warm-muted)',
        'warm-border': 'var(--color-warm-border)',
        'calm-green': 'var(--color-calm-green)',
        'calm-amber': 'var(--color-calm-amber)',
        'calm-indigo': 'var(--color-calm-indigo)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

**Step 4: Update `apps/mobile/app/_layout.tsx`**

```tsx
import '../global.css'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
```

**Step 5: Verify NativeWind works**

Update `apps/mobile/app/index.tsx`:

```tsx
import { View, Text } from 'react-native'

export default function Home() {
  return (
    <View className="flex-1 justify-center items-center bg-warm-bg">
      <Text className="text-2xl font-bold text-warm-text">Lawyer Free</Text>
      <Text className="text-warm-muted mt-2">Your legal case assistant</Text>
    </View>
  )
}
```

```bash
npx expo start --ios --clear
```

Expected: Warm background color (#FAFAF8), styled text.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: configure NativeWind with design tokens"
```

---

### Task 13: Set Up Supabase Auth with Secure Storage

**Files:**
- Create: `apps/mobile/lib/supabase.ts`
- Create: `apps/mobile/lib/auth-context.tsx`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Install dependencies**

```bash
cd apps/mobile
npx expo install expo-secure-store @supabase/supabase-js @react-native-async-storage/async-storage
```

**Step 2: Create Supabase client**

Create `apps/mobile/lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/dist/setup'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

**Step 3: Create auth context**

Create `apps/mobile/lib/auth-context.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Step 4: Create `.env` for mobile**

Create `apps/mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-vercel-deployment.vercel.app
```

**Step 5: Wire auth provider into layout**

Update `apps/mobile/app/_layout.tsx`:

```tsx
import '../global.css'
import { Slot } from 'expo-router'
import { AuthProvider } from '../lib/auth-context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: configure Supabase auth with expo-secure-store"
```

---

### Task 14: Build Login & Signup Screens

**Files:**
- Create: `apps/mobile/app/(auth)/_layout.tsx`
- Create: `apps/mobile/app/(auth)/login.tsx`
- Create: `apps/mobile/app/(auth)/signup.tsx`
- Create: `apps/mobile/app/(auth)/reset-password.tsx`
- Modify: `apps/mobile/app/_layout.tsx` (auth routing)

**Step 1: Create auth layout**

Create `apps/mobile/app/(auth)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAF8' },
      }}
    />
  )
}
```

**Step 2: Create login screen**

Create `apps/mobile/app/(auth)/login.tsx`:

```tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '../../lib/auth-context'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.replace('/(tabs)/cases')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-warm-bg"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-warm-text mb-2">Welcome back</Text>
        <Text className="text-warm-muted mb-8">Sign in to your account</Text>

        {error ? (
          <View className="bg-calm-amber/10 rounded-lg p-3 mb-4">
            <Text className="text-calm-amber text-sm">{error}</Text>
          </View>
        ) : null}

        <Text className="text-sm font-medium text-warm-text mb-1">Email</Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 mb-4 text-warm-text bg-white"
          placeholder="you@example.com"
          placeholderTextColor="#78716C"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <Text className="text-sm font-medium text-warm-text mb-1">Password</Text>
        <TextInput
          className="border border-warm-border rounded-lg px-4 py-3 mb-6 text-warm-text bg-white"
          placeholder="Your password"
          placeholderTextColor="#78716C"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          className="bg-calm-indigo rounded-lg py-3.5 items-center mb-4"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/reset-password" asChild>
          <TouchableOpacity className="items-center mb-6">
            <Text className="text-calm-indigo text-sm">Forgot password?</Text>
          </TouchableOpacity>
        </Link>

        <View className="flex-row justify-center">
          <Text className="text-warm-muted text-sm">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-calm-indigo text-sm font-medium">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
```

**Step 3: Create signup screen**

Create `apps/mobile/app/(auth)/signup.tsx` — same pattern as login but calls `signUp` and has a confirm password field.

**Step 4: Create reset-password screen**

Create `apps/mobile/app/(auth)/reset-password.tsx` — email-only form that calls `supabase.auth.resetPasswordForEmail()`.

**Step 5: Update root layout with auth routing**

Update `apps/mobile/app/_layout.tsx`:

```tsx
import '../global.css'
import { useEffect } from 'react'
import { Slot, router, useSegments } from 'expo-router'
import { AuthProvider, useAuth } from '../lib/auth-context'
import { View, ActivityIndicator } from 'react-native'

function AuthGate() {
  const { session, loading } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/cases')
    }
  }, [session, loading, segments])

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
```

**Step 6: Test auth flow**

```bash
cd apps/mobile && npx expo start --ios --clear
```

Expected: App shows login screen. Can sign in with existing Supabase credentials. Redirects to cases (empty tab for now).

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: build login, signup, and reset-password screens"
```

---

### Task 15: Build Tab Navigation & Case List

**Files:**
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/cases/index.tsx`
- Create: `apps/mobile/app/(tabs)/settings.tsx`
- Create: `apps/mobile/lib/api.ts`

**Step 1: Install TanStack React Query**

```bash
cd apps/mobile
npm install @tanstack/react-query
```

**Step 2: Create API client instance**

Create `apps/mobile/lib/api.ts`:

```typescript
import { createApiClient } from '@lawyer-free/shared/api-client'
import { supabase } from './supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export const api = createApiClient({
  baseUrl: API_URL,
  getHeaders: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    }
  },
})
```

**Step 3: Create tab layout**

Create `apps/mobile/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router'
import { Briefcase, Calendar, Settings } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#78716C',
        tabBarStyle: { backgroundColor: '#FAFAF8', borderTopColor: '#E7E5E4' },
        headerStyle: { backgroundColor: '#FAFAF8' },
        headerTintColor: '#1C1917',
      }}
    >
      <Tabs.Screen
        name="cases"
        options={{
          title: 'Cases',
          tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
```

Note: Install `lucide-react-native`:

```bash
npm install lucide-react-native react-native-svg
npx expo install react-native-svg
```

**Step 4: Create case list screen**

Create `apps/mobile/app/(tabs)/cases/index.tsx`:

```tsx
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '../../../lib/api'
import { ChevronRight } from 'lucide-react-native'

// QueryClient should be created in _layout.tsx and provided — shown here for clarity
const queryClient = new QueryClient()

function CaseListContent() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.get<{ cases: any[] }>('/api/cases'),
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg px-6">
        <Text className="text-warm-muted text-center">Something went wrong loading your cases.</Text>
        <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-calm-indigo rounded-lg px-6 py-3">
          <Text className="text-white font-medium">Try again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const cases = data?.cases ?? []

  if (cases.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg px-6">
        <Text className="text-xl font-bold text-warm-text mb-2">No cases yet</Text>
        <Text className="text-warm-muted text-center mb-6">Create your first case to get started with your legal journey.</Text>
        <TouchableOpacity className="bg-calm-indigo rounded-lg px-6 py-3">
          <Text className="text-white font-semibold">Create a Case</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1 bg-warm-bg"
      contentContainerClassName="px-4 py-4"
      data={cases}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4F46E5" />}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="bg-white rounded-xl p-4 mb-3 border border-warm-border flex-row items-center"
          onPress={() => router.push(`/(tabs)/cases/${item.id}`)}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text className="text-warm-text font-semibold text-base">{item.dispute_type?.replace(/_/g, ' ') ?? 'Case'}</Text>
            <Text className="text-warm-muted text-sm mt-1 capitalize">{item.role} · {item.status}</Text>
          </View>
          <ChevronRight size={20} color="#78716C" />
        </TouchableOpacity>
      )}
    />
  )
}

export default function CaseListScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <CaseListContent />
    </QueryClientProvider>
  )
}
```

Note: `QueryClientProvider` should actually be in the root layout. Move it there:

Update `apps/mobile/app/_layout.tsx` to wrap with `QueryClientProvider`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

And remove the provider wrapper from the case list screen.

**Step 5: Create placeholder settings screen**

Create `apps/mobile/app/(tabs)/settings.tsx`:

```tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from '../../lib/auth-context'

export default function SettingsScreen() {
  const { user, signOut } = useAuth()

  return (
    <View className="flex-1 bg-warm-bg px-6 pt-4">
      <View className="bg-white rounded-xl p-4 border border-warm-border mb-4">
        <Text className="text-warm-muted text-sm">Signed in as</Text>
        <Text className="text-warm-text font-medium">{user?.email}</Text>
      </View>

      <TouchableOpacity
        className="bg-white rounded-xl p-4 border border-warm-border items-center"
        onPress={signOut}
        activeOpacity={0.7}
      >
        <Text className="text-calm-amber font-medium">Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}
```

**Step 6: Test the full flow**

```bash
cd apps/mobile && npx expo start --ios --clear
```

Expected: Login → Case list (pull-to-refresh) → Settings (sign out) → Back to login.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: build tab navigation with case list and settings"
```

---

### Task 16: Build Case Dashboard Shell

**Files:**
- Create: `apps/mobile/app/(tabs)/cases/[id]/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/cases/[id]/(tabs)/overview.tsx`
- Create: `apps/mobile/app/(tabs)/cases/[id]/(tabs)/deadlines.tsx`
- Create: `apps/mobile/app/(tabs)/cases/[id]/(tabs)/evidence.tsx`
- Create placeholder tabs for remaining case features

**Step 1: Create case dashboard layout with scrollable tabs**

Create `apps/mobile/app/(tabs)/cases/[id]/_layout.tsx`:

```tsx
import { Tabs, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'

export default function CaseDashboardLayout() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data } = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.get<{ case: any }>(`/api/cases/${id}`),
  })

  const caseTitle = data?.case?.dispute_type?.replace(/_/g, ' ') ?? 'Case'

  return (
    <Tabs
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#78716C',
        tabBarStyle: { backgroundColor: '#FAFAF8' },
        headerTitle: caseTitle,
        headerStyle: { backgroundColor: '#FAFAF8' },
      }}
    >
      <Tabs.Screen name="overview" options={{ title: 'Overview' }} />
      <Tabs.Screen name="deadlines" options={{ title: 'Deadlines' }} />
      <Tabs.Screen name="evidence" options={{ title: 'Evidence' }} />
      <Tabs.Screen name="discovery" options={{ title: 'Discovery' }} />
      <Tabs.Screen name="motions" options={{ title: 'Motions' }} />
      <Tabs.Screen name="research" options={{ title: 'Research' }} />
      <Tabs.Screen name="case-file" options={{ title: 'Files' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="health" options={{ title: 'Health' }} />
    </Tabs>
  )
}
```

**Step 2: Create overview tab**

Create `apps/mobile/app/(tabs)/cases/[id]/(tabs)/overview.tsx`:

```tsx
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../../lib/api'

export default function CaseOverview() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['case-dashboard', id],
    queryFn: () => api.get<any>(`/api/cases/${id}/dashboard`),
  })

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-warm-bg">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-warm-bg" contentContainerClassName="px-4 py-4">
      {/* Next Step Card */}
      {data?.nextTask && (
        <View className="bg-white rounded-xl p-4 border border-warm-border mb-3">
          <Text className="text-sm text-warm-muted mb-1">Next Step</Text>
          <Text className="text-warm-text font-semibold">{data.nextTask.title}</Text>
        </View>
      )}

      {/* Upcoming Deadlines Card */}
      <View className="bg-white rounded-xl p-4 border border-warm-border mb-3">
        <Text className="text-sm text-warm-muted mb-2">Upcoming Deadlines</Text>
        {(data?.deadlines ?? []).length === 0 ? (
          <Text className="text-warm-muted text-sm">No upcoming deadlines</Text>
        ) : (
          data.deadlines.slice(0, 3).map((d: any) => (
            <View key={d.id} className="flex-row justify-between py-2 border-b border-warm-border last:border-b-0">
              <Text className="text-warm-text text-sm flex-1">{d.title}</Text>
              <Text className="text-calm-amber text-sm">{new Date(d.due_at).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>

      {/* Case Info Card */}
      <View className="bg-white rounded-xl p-4 border border-warm-border">
        <Text className="text-sm text-warm-muted mb-2">Case Details</Text>
        <Text className="text-warm-text text-sm">Status: {data?.case?.status ?? '—'}</Text>
        <Text className="text-warm-text text-sm mt-1">Role: {data?.case?.role ?? '—'}</Text>
        <Text className="text-warm-text text-sm mt-1">Court: {data?.case?.court_type ?? '—'}</Text>
      </View>
    </ScrollView>
  )
}
```

**Step 3: Create placeholder tabs**

For each remaining tab (deadlines, evidence, discovery, motions, research, case-file, activity, health), create a placeholder:

```tsx
// Template for each placeholder — e.g., apps/mobile/app/(tabs)/cases/[id]/(tabs)/deadlines.tsx
import { View, Text } from 'react-native'

export default function DeadlinesTab() {
  return (
    <View className="flex-1 justify-center items-center bg-warm-bg">
      <Text className="text-warm-muted">Deadlines — coming in Phase 2</Text>
    </View>
  )
}
```

Create this pattern for: `deadlines.tsx`, `evidence.tsx`, `discovery.tsx`, `motions.tsx`, `research.tsx`, `case-file.tsx`, `activity.tsx`, `health.tsx`.

**Step 4: Test case dashboard**

```bash
cd apps/mobile && npx expo start --ios --clear
```

Expected: Login → Case list → Tap case → Dashboard with scrollable tabs, overview shows case data.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: build case dashboard shell with overview and placeholder tabs"
```

---

### Task 17: Set Up EAS Build & CI

**Files:**
- Create: `apps/mobile/eas.json`
- Modify: `.github/workflows/ci.yml` (or create if doesn't exist)

**Step 1: Install EAS CLI**

```bash
npm install -g eas-cli
```

**Step 2: Configure EAS**

```bash
cd apps/mobile
eas init
```

**Step 3: Create `apps/mobile/eas.json`**

```json
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id"
      }
    }
  }
}
```

**Step 4: Test EAS build**

```bash
cd apps/mobile
eas build --platform ios --profile development
```

Expected: Build starts on EAS servers. First build takes ~15 min.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure EAS Build for iOS"
```

---

### Task 18: Final Phase 0+1 Verification

**Step 1: Run full monorepo typecheck**

```bash
cd "/Users/minwang/lawyer free"
npx turbo typecheck
```

**Step 2: Run all web tests**

```bash
npx turbo test:unit
npx turbo test:rls
```

**Step 3: Run web build**

```bash
npx turbo build --filter=@lawyer-free/web
```

**Step 4: Run mobile app**

```bash
cd apps/mobile && npx expo start --ios
```

**Step 5: Manual verification checklist**

- [ ] Web app runs at localhost:3000 with no regressions
- [ ] All existing web tests pass
- [ ] Mobile app launches in simulator
- [ ] Login/signup flow works
- [ ] Case list loads real data from Supabase
- [ ] Case dashboard shows overview with real data
- [ ] Tab navigation works (all placeholder tabs accessible)
- [ ] Settings shows user email and sign out works
- [ ] Pull-to-refresh works on case list
- [ ] Auth redirect works (unauthenticated → login, authenticated → cases)

**Step 6: Merge to main (or create PR)**

```bash
cd "/Users/minwang/lawyer free"
git checkout main
git merge feat/monorepo-setup
```

Or create a PR for review first.

---

## What's Next: Phase 2-5 Plans

Phase 0+1 gives you a working monorepo with a mobile shell. The remaining phases should be planned in detail when you're ready:

- **Phase 2 plan** — Step runner, deadlines, push notifications, evidence vault
- **Phase 3 plan** — AI streaming, document generation, legal research, motions
- **Phase 4 plan** — Discovery, exhibits, trial binders, Gmail, case file
- **Phase 5 plan** — Settings, onboarding, polish, App Store submission

Each phase follows the same pattern: shared logic first, then mobile UI, then test.
