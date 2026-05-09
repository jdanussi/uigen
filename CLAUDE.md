# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly — only on complex or non-obvious logic.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run dev:daemon   # Start dev server in background (logs → logs.txt)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run all tests with Vitest
npx vitest run src/path/to/file.test.tsx  # Run a single test file
npm run db:reset     # Wipe and re-migrate the SQLite database
```

All `next` commands require `NODE_OPTIONS='--require ./node-compat.cjs'` — the npm scripts handle this automatically.

The Prisma client is generated into `src/generated/prisma` (not the default `node_modules` location). Always import from `@/generated/prisma` or use the singleton at `src/lib/prisma.ts`.

After changing `prisma/schema.prisma`, run `npx prisma migrate dev` and `npx prisma generate`.

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in a chat, Claude generates code using tool calls, and the result renders live in an iframe — all without writing any files to disk.

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` is an in-memory tree of `FileNode` objects. It is the source of truth for all generated code. It serializes to/from plain `Record<string, FileNode>` for API transport and database storage. Projects in SQLite store the serialized VFS as a JSON string in the `data` column.

### AI Integration (`src/app/api/chat/route.ts`)

The chat API route uses the Vercel AI SDK (`streamText`) with two tools:

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — creates files, does string replacement, and line insertions on the VFS.
- **`file_manager`** (`src/lib/tools/file-manager.ts`) — renames and deletes VFS files.

When `ANTHROPIC_API_KEY` is absent, `getLanguageModel()` in `src/lib/provider.ts` returns a `MockLanguageModel` that streams pre-baked component code. The real model is `claude-haiku-4-5`.

The system prompt (`src/lib/prompts/generation.tsx`) requires every project to have `/App.jsx` as its entry point, use Tailwind for styling, and use `@/` aliases for all local imports.

### Live Preview Pipeline

`PreviewFrame` → `createImportMap` → `createPreviewHTML` → `iframe.srcdoc`

`src/lib/transform/jsx-transformer.ts`:
1. Compiles each `.jsx`/`.tsx` file using **Babel standalone** in the browser.
2. Wraps each compiled module as a **blob URL**.
3. Builds a native ES module **import map** mapping file paths and `@/` aliases to their blob URLs. Third-party packages resolve to `https://esm.sh/<package>`.
4. Generates an HTML document that loads `App.jsx` via a `<script type="module">` with an error boundary.

Tailwind CSS is loaded from CDN in the preview iframe (`cdn.tailwindcss.com`), so Tailwind classes work in generated components without any build step.

### React Context Architecture

- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — wraps the `VirtualFileSystem` instance, exposes CRUD operations, and dispatches `handleToolCall` to apply AI tool results to the VFS. Incrementing `refreshTrigger` signals `PreviewFrame` to re-render.
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — wraps the Vercel AI SDK `useChat` hook, serializes the VFS on every request, and routes `onToolCall` callbacks to `FileSystemContext.handleToolCall`.

### Auth

JWT sessions stored in an `httpOnly` cookie (`auth-token`), signed with `JWT_SECRET` env var (defaults to a dev key). `src/lib/auth.ts` is server-only. `src/middleware.ts` protects `/api/projects` and `/api/filesystem` routes.

Anonymous users can generate components without signing in. `src/lib/anon-work-tracker.ts` persists their in-progress work in `localStorage` so it survives until they register.

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` (email/bcrypt password) and `Project` (stores `messages` and `data` as JSON strings). Projects are only saved when the user is authenticated and a `projectId` is present in the chat request.
