# Domio Monorepo

This repo contains two React apps:

- `domio.com/` – Web app (Landing, Landlord, Tenant) – deploy this
- `domio-admin/` – Admin app – run locally only (admin-only access)

## Setup

1. Web app
```
cd domio.com
npm install
npm run dev
```

2. Admin app (local only)
```
cd domio-admin
npm install
# create .env with Firebase config – VITE_FIREBASE_*
npm run dev
```

## Firestore Rules
Rules in `domio.com/firebase.rules` enforce roles: Admin, Landlord, Tenant.
Deploy them:
```
firebase deploy --only firestore:rules
```

## Auth Roles (Custom Claims)
Use the Node script to assign roles:
```
# requires GOOGLE_APPLICATION_CREDENTIALS for admin SDK
node scripts/setCustomClaims.mjs <uid> <Admin|Landlord|Tenant>
```

Clients must refresh ID token after role changes (sign out/in or force refresh).

## Deployment
- Deploy ONLY the web app (`domio.com`).
- Keep `domio-admin` running locally for admin users.

Example with Firebase Hosting (assuming hosting set in domio.com):
```
cd domio.com
npm run build
firebase deploy --only hosting
```
