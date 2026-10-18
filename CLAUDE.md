# Web Tracer Reporting System (Next.js)

Next.js rewrite of the Laravel Tracer Reporting System, deployed on Netlify + Neon PostgreSQL.

## Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS 4)
- Prisma ORM + Neon PostgreSQL
- xlsx (SheetJS) for Excel reading
- docx npm package for Word report generation
- Chart.js + react-chartjs-2 for browser charts

## Architecture
- src/lib/services/ — business logic (statistics, narrative, chart config, docx builder)
- src/lib/config/ — parameter config & narrative templates (ported from Laravel config/)
- src/app/api/ — API routes for upload, reports, deletions
- src/app/ — pages (dashboard, upload, analysis, reports, guide)
- prisma/schema.prisma — database schema

## Conventions
- No authentication — single personal user
- Export only to Word (.docx) — no PDF
- No data cleaning/validation — reads Excel as-is
- All UI labels in Bahasa Indonesia
