<div align="center">

# Ongato Serverless API

**A production-ready serverless REST API for animal and banner management.**  
Built with Cloudflare Workers, D1, R2, JWT auth, and OpenAPI docs.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Database](https://img.shields.io/badge/Database-D1-000000?style=flat)](https://developers.cloudflare.com/d1/)
[![Storage](https://img.shields.io/badge/Storage-R2-F38020?style=flat)](https://developers.cloudflare.com/r2/)
[![ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat)](https://orm.drizzle.team/)

</div>

---

## Overview

This API is designed around feature modules and clean separation of responsibilities:

- JWT-based authentication and role authorization
- User management
- Animal management with image upload to R2
- Banner management with image upload to R2
- OpenAPI specification + interactive docs

### Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **File storage:** Cloudflare R2
- **ORM:** Drizzle ORM
- **Validation and schema:** Zod
- **Docs:** OpenAPI + Scalar

---

## How It Works

- `src/index.ts` receives all HTTP requests
- `src/router.ts` resolves route handlers and applies CORS
- each feature module (`auth`, `user`, `animal`, `banner`) contains `controller`, `service`, `repository`, and `schema`
- protected routes use `Authorization: Bearer <token>`
- role checks happen in `withAuth` middleware
- responses are normalized via shared response helpers

### Public Endpoints

- `POST /auth/login`
- `GET /animals` (filters: `name`, `age`, `gender`, `size`, `type`, `featured=0|1`; pagination: `cursor`, `limit`)
- `GET /banners`
- `GET /openapi.json`
- `GET /docs`

### Protected Endpoints (`dev`)

- `POST /users`
- `DELETE /users/:id`
- `PATCH /users/me`
- `POST /animals`
- `PATCH /animals/:id`
- `DELETE /animals/:id`
- `POST /banners`
- `PATCH /banners/:id`
- `DELETE /banners/:id`

### Protected Endpoints (`admin` or `dev`)

- `GET /users`

---

## Entities

Entities are defined in `src/db/schema.ts`.

### `users`

- `id`
- `name`
- `email`
- `password`
- `role` (`admin` | `dev`)
- `created_at`

### `animals`

- `id`
- `name`
- `image_url`
- `age`
- `gender`
- `size`
- `type`
- `description`
- `created_at`
- `updated_at`

### `banners`

- `id`
- `title`
- `image_url`
- `description`
- `created_at`

### `events`

- `id`
- `title`
- `image_url`
- `text`
- `created_at`

> Note: event feature files exist, but routes are not currently mounted in the main router.

---

## Requirements

- Node.js + npm
- Cloudflare account
- Wrangler CLI
- D1 database configured
- R2 bucket configured

### Required Bindings / Variables

- `DB` (D1 binding)
- `IMAGES_BUCKET` (R2 binding)
- `R2_PUBLIC_URL` (public base URL for images)
- `JWT_SECRET` (JWT secret key)
- `ENVIRONMENT` (optional: `development` or `production`)
- `CORS_ALLOWED_ORIGINS` (optional, comma-separated)

---

## Setup

1. Install dependencies

```bash
npm install
```

2. Start local development

```bash
npm run dev
```

3. Run D1 migrations (remote)

```bash
npx wrangler d1 execute ongato-db --remote --file drizzle/{filename} --yes
```

4. Deploy

```bash
npm run deploy
```

---

## API Documentation

When running the app:

- OpenAPI JSON: `/openapi.json`
- Interactive docs: `/docs`

---

## Key Files

### Core

- `src/index.ts` (Worker entry point)
- `src/router.ts` (routing + CORS)
- `src/openapi.ts` (OpenAPI document generation)

### Database and Migrations

- `src/db/schema.ts` (table/entity definitions)
- `src/db/db.ts` (Drizzle + D1 connection)
- `drizzle/0000_fair_kronos.sql` (migration)
- `drizzle/meta/*` (Drizzle migration metadata)

### Auth and Security

- `src/shared/auth/middleware.ts` (JWT guard and role checks)
- `src/shared/auth/jwt.ts` (token generation/verification)
- `src/features/auth/*` (login flow)

### Features

- `src/features/user/*` (user CRUD and role-protected routes)
- `src/features/animal/*` (animal CRUD + image upload)
- `src/features/banner/*` (banner CRUD + image upload)

### Shared Infrastructure

- `src/shared/response/api-response.ts` (API response patterns)
- `src/shared/validation/*` (validation helpers and schemas)
- `src/shared/storage/image-storage.ts` (R2 upload/delete abstraction)
