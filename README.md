# CorbelBase

**A workspace for engineering team operations.**

CorbelBase is a team operations platform designed to help engineering teams organize their work, manage projects, and control access through role-based permissions.

## Overview

CorbelBase uses a modular architecture with a Next.js frontend, a Fastify API, and PostgreSQL for persistent data storage.

```text
                    CorbelBase
                        |
              +---------+---------+
              |                   |
           Frontend             Backend
           Next.js              Node.js
           TypeScript           Fastify
                                   |
                              PostgreSQL
                              Drizzle ORM
                                   |
                                Redis
                            (planned usage)
```
- Working on basic setup first, ui is mostly pending.

## Features

### Organizations and Members
- Create and manage organizations.
- Add existing users to an organization.
- Assign and update member roles.
- Remove members with role-based restrictions.

### Project Management
- Create projects with a name, unique project key, and optional description.
- View project details and status.
- Update project names and descriptions.
- Change project status.
- Delete projects with confirmation.
- Restrict project management operations to authorized organization roles.

### Access Control
- Organization roles: Owner, Admin, Developer, and Viewer.
- Server-side authorization for protected operations.
- Role-based restrictions on member and project management.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js, Fastify, TypeScript |
| Database | PostgreSQL |
| ORM and Migrations | Drizzle ORM |
| Caching and Background Jobs | Redis (planned) |
| Package Management | pnpm |

## Project Structure

```text
CorbelBase/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Fastify backend
├── package.json
└── pnpm-workspace.yaml
```

## Development

### Prerequisites

- Node.js
- pnpm
- Docker Desktop
- Git

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Jitendra227/CorbelBase.git
   cd CorbelBase
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure the environment variables required by the web application and API.

4. Start the required services, including PostgreSQL, using your local development configuration.

5. Start the application:

   ```bash
   pnpm dev
   ```

### Build

Build the frontend:

```bash
pnpm --filter @corbelbase/web build
```

## Roadmap

- [x] Organization management
- [x] Organization membership and role management
- [x] Project creation and listing
- [x] Project editing, status updates, and deletion
- [x] Role-based authorization for project management
- [ ] Task management and assignment
- [ ] Concurrency-safe task numbering
- [ ] Sprint management
- [ ] Redis-backed background jobs and workers
- [ ] Activity tracking and notifications

## Project Status

CorbelBase is under active development. Features are being implemented incrementally, with a focus on backend fundamentals, authorization, data integrity, and maintainable architecture.

## License

No license has been specified yet.
