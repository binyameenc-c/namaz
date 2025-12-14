# Caliph Attendance

## Overview
A prayer attendance tracking application built with React, Express, and PostgreSQL. The app helps track daily prayer attendance (Fajr, Dhuhr, Asr, Maghrib, Isha) for students and classes. Supports up to 5 teachers with individual logins.

## Project Architecture
- **Frontend**: React 19 with Vite, Tailwind CSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
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

## Database
- Uses PostgreSQL with Drizzle ORM
- Tables: users, teachers (with 5-teacher limit), classes, students
- Run `npm run db:push` to push schema changes to the database

## Mobile App (Android)
- Run `npm run build:mobile` to build and sync with Android
- Run `npm run android:open` to open in Android Studio
- See `Caliph-Attendance/MOBILE_BUILD_INSTRUCTIONS.md` for full APK build guide

## Production Build
- Run `npm run build` to build for production
- Run `npm run start` to start the production server

## Recent Changes (December 2025)
- **Database-backed Students & Classes**: Students and classes are now stored in PostgreSQL database, syncing across all devices instead of browser localStorage
- **Teacher Authentication**: Login/registration system supporting up to 5 teachers with secure password hashing
- **Mobile App Support**: Added Capacitor for Android APK generation
- **Auto-save attendance**: Attendance is automatically saved when leaving the attendance page
- **Real-time Summary**: Summary page now shows actual attendance data from localStorage
- **All-present default**: Classes that are not opened are treated as "all present" in reports
- **PDF/WhatsApp sharing**: Reports can be downloaded as PDF or shared via WhatsApp with real attendance data
