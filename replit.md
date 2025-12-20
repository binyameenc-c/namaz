# Caliph Attendance

## Overview
A prayer attendance tracking application built with React, Express, and PostgreSQL. The app helps track daily prayer attendance (Fajr, Dhuhr, Asr, Maghrib, Isha) for students and classes. Supports up to 5 teachers with individual logins.

## Project Architecture
- **Frontend**: React 19 with Vite, Tailwind CSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Render external database)
- **Mobile**: Capacitor for Android APK generation
- **Styling**: Tailwind CSS v4 with custom theme
- **Auth**: Teacher login with bcrypt password hashing

## Directory Structure
```
Caliph-Attendance/
├── android/          # Android project (Capacitor)
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components (including Login)
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and config
│   └── public/          # Static assets
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes (teacher auth endpoints)
│   ├── storage.ts    # PostgreSQL storage layer
│   ├── static.ts     # Static file serving (production)
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle schema (users, teachers tables)
└── attached_assets/  # Project assets
```

## Development
- Run `npm run dev` to start the development server on port 5000
- The server handles both API routes and frontend serving in development

## Database Configuration
- **External Database**: Render PostgreSQL (production-grade)
- **Connection**: `postgresql://caliph_namaz_user:iYCze0gVzEi79XzZNiSCQLG8IsKfBvQN@dpg-d50im4ngi27c73am89s0-a.singapore-postgres.render.com/caliph_namaz?sslmode=require`
- **Environment Variable**: `EXTERNAL_DATABASE_URL` (stored in shared environment)
- **Tables**: users, teachers, classes, students
- **ORM**: Drizzle with `npm run db:push` for schema synchronization
- **SSL Mode**: Enabled for secure connection to Render database

## Mobile App (Android)
- Run `npm run build:mobile` to build and sync with Android
- Run `npm run android:open` to open in Android Studio
- See `Caliph-Attendance/MOBILE_BUILD_INSTRUCTIONS.md` for full APK build guide

## Production Build & Deployment
- Run `npm run build` to build for production
- Run `npm run start` to start the production server
- **Published on Replit**: Configured for autoscale deployment
- **Build command**: `npm run build`
- **Start command**: `npm run start`
- **Database**: Connects to Render database via EXTERNAL_DATABASE_URL

## Recent Changes (December 20, 2025)
- **External Database Migration**: Migrated to Render PostgreSQL (not Replit internal DB)
- **Database URL Updated**: New Render database with SSL mode enabled
- **Tables Created**: All tables (users, teachers, classes, students) created in new database
- **Deployment Configured**: Autoscale deployment set up for Replit publishing
- **SSL Connection**: Verified SSL connection working with `?sslmode=require`
- **Previous Features**: Database-backed students/classes, teacher authentication, mobile support, auto-save attendance

## Admin Features
- **Enable Admin Mode**: Tap the logo on Home page, enter password (default: 123456)
- **Admin Capabilities**:
  - Create/Edit/Delete Classes
  - Add/Edit/Delete Students  
  - Import students from Excel
  - Edit attendance (toggle present/absent)
  - Clear attendance for prayer or all
  - Change admin password (Settings > Admin section)

## Important Notes
- **Data Persistence**: All data is stored on Render's PostgreSQL server
- **Downloading/Building APK**: Does NOT affect database - data stays on Render servers
- **No Local Storage**: Database connection is server-based via connection string
- **GitHub Repository**: https://github.com/binyameenc-c/namaz.git
