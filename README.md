# 💪 AuraStrength AI

> Your AI-powered strength coach that learns, adapts, and maximizes every rep.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

## ✨ Features

- 🤖 **AI Coach**: Gemini-powered intelligent training plans that adapt to your progress
- 📊 **Progressive Overload**: Automatic weight recommendations based on RIR and performance
- 🎨 **Muscle Heatmap**: Visual recovery tracking with interactive split-screen body view
- ⏱️ **Rest Timers**: Smart rest period notifications between sets
- 🔐 **Secure Auth**: Email + Google/Apple OAuth via Supabase
- 📈 **Data Export**: Monthly workout cycle management with CSV export

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- Google Gemini API key ([get one here](https://ai.google.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aura-strength
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Your `.env.local` should already have:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tzyjfgcasifincmfnerj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   ```

4. **Set up the database**
   
   - Go to your [Supabase Dashboard](https://tzyjfgcasifincmfnerj.supabase.co)
   - Navigate to SQL Editor
   - Copy the contents of `supabase_schema.sql`
   - Paste and run the query

5. **Configure OAuth (Optional but Recommended)**
   
   In Supabase Dashboard → Authentication → Providers:
   - Enable **Google** and add your OAuth credentials
   - Enable **Apple** if desired
   - Add redirect URL: `http://localhost:3000/auth/callback`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

Detailed documentation is available in the `/docs` folder (local only):
- Setup guides and troubleshooting
- Phase implementation details
- GitHub project management guides

**Quick References:**
- Database schema: See `supabase_schema.sql`
- Setup scripts: See `/scripts` folder
- Project structure: See below

## 🏗️ Project Structure

```
aura-strength/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth group (login, signup)
│   │   ├── dashboard/         # Main dashboard
│   │   ├── profile/           # Profile management
│   │   └── api/               # API routes (AI coach)
│   ├── components/
│   │   ├── aura/              # Design system components
│   │   ├── auth/              # Authentication UI
│   │   └── workout/           # Workout tracking components
│   └── lib/
│       ├── supabase/          # Database clients
│       ├── ai/                # AI coach logic
│       └── utils/             # Helper functions
├── supabase_schema.sql        # Database setup
└── public/                    # Static assets
```

## 🎨 Design Philosophy

AuraStrength uses a unique **"Aura"** aesthetic:

- **Deep Obsidian Background** (#020617) - Professional, focused
- **Radiant Purple/Indigo** (#A855F7, #6366F1) - Energy, power
- **Glassmorphism** - Modern, premium feel
- **Animated Gradients** - Living, breathing interface
- **Mouse-reactive Elements** - Interactive, responsive

## 🔐 Security

- Row-Level Security (RLS) on all Supabase tables
- Secure session management via middleware
- OAuth 2.0 for third-party authentication
- Personal data encrypted at rest

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Backend** | Supabase (PostgreSQL), Vercel Edge Functions |
| **AI** | Google Gemini 1.5 Pro via Vercel AI SDK |
| **Auth** | Supabase Auth (Email, Google, Apple) |
| **Icons** | Lucide React |

## 📊 Database Schema

- `profiles` - User fitness profiles (age, weight, goals)
- `workouts` - Workout sessions with metadata
- `exercises` - Exercise details per workout
- `sets` - Set-by-set performance tracking
- `muscle_groups` - Reference table for body parts
- `all_time_prs` - Historical personal records archive

See [supabase_schema.sql](./supabase_schema.sql) for complete schema.

## 🚦 Development Status

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Authentication (Email + OAuth)
- [x] Dashboard with muscle heatmap
- [x] Profile setup flow
- [x] Database schema with RLS
- [x] Aura design system

### 🔄 Phase 2: AI Coach Integration (NEXT)
- [ ] AI workout session generator
- [ ] Context injection system
- [ ] Streaming responses
- [ ] Exercise database

### ⏳ Phase 3: Live Workout Logger
- [ ] Set-by-set tracking
- [ ] Rest timers with notifications
- [ ] Progressive overload indicators
- [ ] PR detection

### ⏳ Phase 4: Data Visualization
- [ ] Workout history calendar
- [ ] Performance charts
- [ ] CSV export system
- [ ] 30-workout cycle management

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue to discuss major changes.

## 📄 License

MIT License - feel free to use this project as inspiration for your own fitness apps.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing framework
- **Supabase** - Backend-as-a-Service done right
- **Google** - Gemini AI capabilities
- **Vercel** - AI SDK and deployment platform

---

**Built with 💜 by Muhammad Naseem**

*"Your aura precedes your reputation. Build both in the gym."*

