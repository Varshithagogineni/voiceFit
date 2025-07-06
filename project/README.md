# VoiceFit - Voice-Powered Workout Tracker

A mobile-first, voice-powered workout tracking app that enables users to log workouts, sets, weights, and reps using only their voice, and view real-time session logs and analytics. Designed for seamless integration with n8n workflows, Supabase, and AI-powered intent detection.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend Orchestration:** n8n (Webhook workflows)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **AI Processing:** OpenAI Whisper (Speech-to-Text), OpenAI Assistant (Intent parsing)
- **Hosting:** Netlify (default), Vercel (supported)
- **Other:** PWA capabilities, GitHub Codespaces/local dev

---

## 📁 Folder Structure

```
├── public/                # Static assets for the web app
│   ├── _redirects         # Netlify/Vercel redirect rules
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO and crawler rules
├── src/                   # Main application source code
│   ├── components/        # React UI components
│   │   ├── ExerciseCard.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── QuickStats.tsx
│   │   ├── RecentWorkouts.tsx
│   │   ├── TodaySession.tsx
│   │   └── VoiceRecorder.tsx
│   ├── lib/               # Library code and API clients
│   │   └── supabase.ts    # Supabase client initialization
│   ├── services/          # API and service layer
│   │   ├── api.ts         # n8n and Supabase API calls
│   │   └── supabase-api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main React app component
│   ├── index.css          # Global styles (Tailwind)
│   ├── main.tsx           # React entry point
│   └── vite-env.d.ts      # Vite environment types
├── supabase/              # Database and migration scripts
│   └── migrations/
│       └── 20250630030443_floral_ocean.sql
├── .gitignore             # Git ignore rules
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── netlify.toml           # Netlify deployment config
├── package.json           # Project metadata and dependencies
├── package-lock.json      # Dependency lockfile
├── postcss.config.js      # PostCSS config for Tailwind
├── tailwind.config.js     # Tailwind CSS config
├── tsconfig.json          # TypeScript config (base)
├── tsconfig.app.json      # TypeScript config (app-specific)
├── tsconfig.node.json     # TypeScript config (Node-specific)
├── vite.config.ts         # Vite build config
└── README.md              # Project documentation
```

### Key Folders & Files

- **public/**: Static files served at the root. Includes PWA manifest, robots.txt, and Netlify redirects.
- **src/components/**: Modular React components for UI (e.g., voice recorder, session cards, navigation).
- **src/services/**: API logic for n8n webhooks and Supabase.
- **src/lib/**: Supabase client setup.
- **src/types/**: TypeScript types/interfaces for app data.
- **supabase/migrations/**: SQL migration scripts for database schema.
- **netlify.toml**: Netlify build and deploy configuration.
- **package.json**: Project dependencies and scripts.

---

## ⚡ Setup Instructions

### Prerequisites

- **Node.js** v18+ (see `netlify.toml`)
- **npm** v9+ (or compatible)
- **Supabase** project (for database and auth)
- **n8n** instance (for webhook orchestration)
- **OpenAI API keys** (for Whisper and Assistant, configured in n8n)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd voicefit-workout-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the project root.
   - Set the following variables:
     ```
     VITE_N8N_BASE_URL=<your-n8n-webhook-base-url>
     VITE_SUPABASE_URL=<your-supabase-url>
     VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🚀 Deployment

### Netlify (default) / Vercel

- **Build:** `npm run build`
- **Deploy:** Upload the `dist/` folder to your hosting provider.
- **Environment Variables:** Set `VITE_N8N_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in your hosting dashboard.

**Netlify-specific:**  
- Uses `netlify.toml` for build and redirect rules.
- Node version is pinned to 18.

### n8n Workflows

- Ensure your n8n instance is running and accessible.
- Configure the workflow with ID: `57ce16fe-2090-4d87-84cb-7f3806d083cc`.
- Set up OpenAI and Supabase credentials in n8n.

### Supabase

- Run the SQL scripts in `supabase/migrations/` to set up tables.
- Enable Row Level Security (RLS) as needed.
- Configure authentication if required.

---

## 📡 API Reference

### n8n Webhook Endpoints

- **POST** `/webhook/57ce16fe-2090-4d87-84cb-7f3806d083cc/log_exercise`
  - Log exercise set via audio (FormData: `user_id`, `data0`)
- **POST** `/webhook/57ce16fe-2090-4d87-84cb-7f3806d083cc/log_mood`
  - Log mood via audio (FormData: `user_id`, `data0`)
- **POST** `/webhook/57ce16fe-2090-4d87-84cb-7f3806d083cc/log_workout_session`
  - Log workout session via audio (FormData: `user_id`, `data0`)

**All endpoints:**  
- Audio is transcribed (Whisper), parsed (OpenAI Assistant), and stored in Supabase.

### Supabase REST Endpoints

- `/rest/v1/workout_sessions`
- `/rest/v1/exercises`
- `/rest/v1/exercise_sets`

---

## ✨ Features Overview

- 🎙️ **Voice Recording** with real-time waveform and visual feedback
- 📝 **Voice-to-Text Logging** for exercises, sets, and mood
- 🤖 **Smart Intent Detection** (auto-routes to correct n8n endpoint)
- 📊 **Analytics Dashboard** (workout history, volume, progress)
- 📅 **Session Tracking** (today's workout, progress cards)
- 📱 **Mobile-First, PWA-ready** UI with smooth animations
- 🔗 **n8n Integration** for flexible backend workflows
- 🔒 **Supabase Auth & RLS** (optional, ready for secure user data)

---

## 🔐 Authentication & Authorization

- **Supabase** is used for authentication and user management.
- **Row Level Security (RLS)** is recommended for user data isolation.
- **API keys** are required for Supabase REST calls (see environment variables).

---

## 🧩 Third-Party Services / SDKs

- **Supabase:** Database, Auth, REST API
- **n8n:** Workflow automation and orchestration
- **OpenAI Whisper:** Speech-to-text transcription
- **OpenAI Assistant:** Intent parsing and entity extraction
- **Netlify/Vercel:** Hosting and deployment

---

## 🗝️ Environment Variables

| Variable                  | Description                                 |
|---------------------------|---------------------------------------------|
| `VITE_N8N_BASE_URL`       | Base URL for your n8n webhook endpoints     |
| `VITE_SUPABASE_URL`       | Supabase project URL                        |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anon/public API key                |

> **Note:** Never commit your `.env` file or secrets to version control.

---

## 🤝 Contribution Guidelines

1. Fork the repository and create a new branch for your feature or bugfix.
2. Write clear, concise commit messages.
3. Ensure code passes linting (`npm run lint`) and builds successfully.
4. Submit a pull request with a detailed description.

---

## 🐞 Known Issues / Roadmap

- Native iOS app (planned)
- Offline mode and local sync (planned)
- AI-powered workout recommendations (planned)
- Social features and workout sharing (planned)
- Wearable device integration (planned)
- Advanced analytics and progress photos (planned)

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

**Ready to get started?**  
Update your environment variables, deploy your n8n workflow, and start logging workouts with your voice!