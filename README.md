# CORTEX – Community Resource Intelligence Engine

AI-powered crisis response and volunteer management platform.

## Features

- **Multimodal Data Ingestion**: Forms, WhatsApp, Voice, OCR
- **AI-Powered Priority Scoring**: Gemini AI calculates urgency, severity, and location risk
- **Smart Volunteer Matching**: AI-optimized matching with skill, distance, and workload factors
- **Real-time Dashboards**: Heatmaps, priority feeds, and analytics
- **Role-Based Access**: Admin and Volunteer dashboards
- **Hybrid AI Architecture**: Works offline with rule-based fallback

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5-Flash, Tesseract.js (OCR)
- **Authentication**: JWT + bcrypt

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project
- Google Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Gemini API keys

# Start backend
cd server
npm install
npm run dev

# Start frontend (in another terminal)
npm run dev
```

### Development

- Frontend: http://localhost:8080
- Backend: http://localhost:5000

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── store/          # Zustand state management
├── services/       # API and AI services
├── types/          # TypeScript type definitions
└── lib/            # Utility functions
```

## License

MIT
