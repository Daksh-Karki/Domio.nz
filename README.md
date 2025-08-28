# Domio - Property Rental Platform

A modern property rental platform built with React and Vite.

## Project Structure

This repo contains two React applications:

- `domio.com/` – Main web application (Property listings, user dashboard, authentication)
- `domio-admin/` – Admin application (separate admin interface)

## Setup & Development

### Main Web App (domio.com)

```bash
cd domio.com
npm install
npm run dev
```

The application will be available at `http://localhost:5173/` (or next available port).

### Admin App (domio-admin)

```bash
cd domio-admin
npm install
npm run dev
```

## Features

- **Landing Page**: Modern property showcase with search functionality
- **User Authentication**: Login/signup with simulated authentication
- **Property Dashboard**: Manage properties and view analytics
- **User Profiles**: Profile management and verification
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Frontend**: React 19, Vite
- **Routing**: React Router DOM
- **Styling**: Custom CSS with modern design
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Development

The application currently uses simulated authentication and mock data for development purposes. All forms and interactions work as expected in the UI.

## Deployment

Deploy the main web app (`domio.com`) to your preferred hosting platform:

```bash
cd domio.com
npm run build
# Deploy the dist/ folder to your hosting service
```

Keep the admin app (`domio-admin`) for local development and admin access only.