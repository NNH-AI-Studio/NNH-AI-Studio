# NNH Local - GMB AI Studio Platform

A comprehensive platform for managing Google My Business locations with AI-powered automation, review management, and analytics.

## Features

- **Google My Business Integration** - Connect and manage multiple GMB accounts
- **AI-Powered Automation** - Automated review responses and content generation
- **Multi-Location Management** - Manage all your business locations from one dashboard
- **Advanced Analytics** - Real-time insights into views, searches, calls, and actions
- **Review Management** - Track and respond to reviews with AI assistance
- **Smart Posting** - Create and schedule posts across all locations
- **GMB Studio** - Comprehensive tools for rankings, citations, media, and more

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI Integration**: Multiple providers (OpenAI, Anthropic, Google AI, Groq, etc.)
- **Testing**: Playwright E2E tests

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console project with GMB API enabled
- AI provider API keys (optional, for AI features)

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run migrations in Supabase
5. Start dev server: `npm run dev`

## Security

**IMPORTANT**: Never commit the `.env` file. It contains sensitive API keys and secrets.

For production deployment, set environment variables in your hosting platform's dashboard.

## Demo Account

- Email: `demo@aistudio.com`
- Password: `demo123456`

## Support

For support, visit [www.nnh.ae](https://www.nnh.ae)
