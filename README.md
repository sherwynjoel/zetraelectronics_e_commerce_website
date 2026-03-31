# Zetra Electronics — E-Commerce Platform

A full-stack e-commerce platform for electronic components, sensors, IoT modules, and robotics kits.

## Architecture

```
apps/
├── api/    → NestJS backend (REST API, Prisma ORM, SQLite)
└── web/    → Next.js 16 frontend (App Router, TailwindCSS v4, Zustand)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Install dependencies

```bash
# Install API dependencies
cd apps/api && npm install

# Install Web dependencies
cd apps/web && npm install
```

### 2. Configure environment

**API** — copy and fill in `apps/api/.env`:
```
DATABASE_URL="file:./dev.db"
PORT=4000
JWT_SECRET="your-strong-random-secret"
JWT_EXPIRATION="7d"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
```

**Web** — `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Setup the database

```bash
cd apps/api
npx prisma db push
node prisma/seed-zetra.js     # Create admin user
npx ts-node prisma/seed.ts    # Seed products
```

### 4. Run the project

Open **two terminals**:

```bash
# Terminal 1 — API (http://localhost:4000)
cd apps/api
npm run start:dev

# Terminal 2 — Web (http://localhost:3000)
cd apps/web
npm run dev
```

## Admin Panel

| URL | Description |
|---|---|
| http://localhost:3000/admin | Dashboard |
| http://localhost:3000/admin/products | Product management |
| http://localhost:3000/admin/orders | Order management |
| http://localhost:3000/admin/customers | Customer list |
| http://localhost:3000/admin/settings | Store settings |

**Default admin credentials:**
- Email: `admin@zetraelectronics.com`
- Password: `Zetra@13122024`

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TailwindCSS v4 |
| State | Zustand with persistence |
| Auth (client) | Firebase Authentication |
| Backend | NestJS 11, TypeScript |
| ORM | Prisma 5 |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Auth (server) | JWT + Passport |  
| Email | Nodemailer + Handlebars |
| PDF | PDFKit (invoices) |
| Animations | Framer Motion |
