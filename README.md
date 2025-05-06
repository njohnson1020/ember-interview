# Bus Route Tracking Application

A Next.js application that displays bus route information and route status tracking using Google Maps integration.

## Features

- Vehicle information display (plate number, type, amenities)
- Interactive map visualization of bus location and route
- Server-side rendering with Next.js

## Prerequisites

- Node.js 18 or later
- Google Maps API key
- npm package manager

## Environment Setup

Create a `.env.local` file in the root directory:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

The application accepts a `routeId` query parameter to display specific bus route information:

- Example: `http://localhost:3000?routeId=123`

## Project Structure

- `src/app/` - Main application code
  - `actions/` - Server actions for data fetching
  - `components/` - Reusable React components
  - `hooks/` - Custom react hooks
  - `lib/` - Domain logic
  - `utils/` - Collection of utility functions
  - `page.tsx` - Main route page component

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [Google Maps API](https://developers.google.com/maps) - Map visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
