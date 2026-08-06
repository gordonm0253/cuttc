# Cornell Table Tennis

Official website for Cornell Table Tennis Club, a registered student organization of Cornell University.

## Features

- **Club info pages** — About, team roster, and e-board sections
- **Photo gallery, Archive** — Highlights from tournaments and club events
- **Events calendar** — Upcoming practices, tournaments, and socials
- **Match logging** — Members record match results and set scores
- **Internal club rating system** — Automatically computed player ratings based on match history
- **Member profiles** — Google sign-in via Firebase Auth
- **Admin dashboard** — Manage rankings access, events, and match records

## Tech Stack

- **Frontend:** React, HTML/CSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Auth:** Firebase Authentication

## Getting Started

### Backend

```bash
cd backend
yarn install
cp .env.example .env   # fill in DATABASE_URL, FIREBASE_SERVICE_ACCOUNT_JSON, etc.
yarn prisma:migrate
yarn dev
```

### Frontend

In a separate terminal, from the project root:

```bash
yarn install
yarn dev
```

Create a `.env` file in the project root with your Firebase client config and API URL:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=
```

Open the URL Vite prints (typically http://localhost:5173) in your browser.
