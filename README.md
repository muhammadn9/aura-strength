# Lightstack 💪

A high-performance workout tracking and AI-coaching web application built with Next.js, Supabase, and Google Gemini AI.

## Features

- **AI Workout Generation** — Gemini-powered coach that adapts to your history, energy level, and available time
- **Multiple Training Splits** — PPL, Arnold, Upper/Lower, Bro Split, Full Body
- **Real-Time Set Logging** — Track weight, reps, and RIR with per-set feedback
- **Muscle Heatmap** — Interactive anatomical SVG showing training volume by muscle group
- **Imperial & Metric Units** — Toggle between lb/ft/in and kg/cm
- **Progressive Overload Tracking** — PR detection and "Previous Best" display
- **Data Export** — CSV export after 30 workouts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email, Google, Apple) |
| AI | Vercel AI SDK + Google Gemini |
| Icons | Lucide React |
| Analytics | Vercel Analytics |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GOOGLE_GENERATIVE_AI_API_KEY

# Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini |

## Project Structure

```
src/
├── app/           # Pages and API routes (App Router)
├── components/    # Reusable UI components
│   ├── aura/      # Design system (GlassCard, MuscleHeatmap, etc.)
│   ├── auth/      # Authentication components
│   ├── coach/     # AI session generator, exercise cards
│   ├── dashboard/ # Dashboard widgets
│   ├── history/   # Workout history
│   └── workout/   # Session logging, provider
├── lib/           # Utilities, AI logic, Supabase clients
│   ├── ai/        # Coach prompt, types
│   ├── supabase/  # Client & server Supabase instances
│   └── utils/     # Unit conversion, muscle volume, etc.
└── types/         # TypeScript type definitions
```

## License

Private — All rights reserved.
