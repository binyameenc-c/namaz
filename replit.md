# Caliph Attendance

## Overview
A prayer attendance tracking application built with React, Express, and PostgreSQL. The app helps track daily prayer attendance (Fajr, Dhuhr, Asr, Maghrib, Isha) for students and classes.

## Project Architecture
- **Frontend**: React 19 with Vite, Tailwind CSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS v4 with custom theme

## Directory Structure
```
Caliph-Attendance/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and config
│   └── public/          # Static assets
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   ├── storage.ts    # Data storage layer
│   ├── static.ts     # Static file serving (production)
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle schema definitions
└── attached_assets/  # Project assets
```

## Development
- Run `npm run dev` to start the development server on port 5000
- The server handles both API routes and frontend serving in development

## Database
- Uses PostgreSQL with Drizzle ORM
- Run `npm run db:push` to push schema changes to the database

## Production Build
- Run `npm run build` to build for production
- Run `npm run start` to start the production server
