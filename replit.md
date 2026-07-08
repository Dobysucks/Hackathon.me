# MediExplain

A React + Vite + TypeScript app that lets users upload a photo of a medical lab report and receive an AI-powered plain-language explanation — including a summary, flagged abnormal values, and suggested questions for their doctor.

## Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase Edge Function (`supabase/functions/analyze-report`) powered by Google Gemini

## How to run

```bash
npm run dev
```

The dev server starts on port 5000. The workflow "Start application" is configured to run this automatically.

## Environment variables

Copy the values from your Supabase project dashboard and add them as Replit Secrets:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public API key |

The app will build and display fine without these, but the "Analyze Report" button will fail at runtime until they are set.

## User preferences

_None recorded yet._
