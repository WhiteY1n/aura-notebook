# Aura Study

A modern AI-powered study and research platform built with React, TypeScript, and Supabase. Transform your documents into interactive learning experiences with AI-generated summaries, notes, and audio overviews.

## Features

- **Document Management**: Upload and organize PDFs, add web links, or paste content directly
- **AI Chat**: Interactive conversations with your documents using RAG (Retrieval-Augmented Generation)
- **Smart Notes**: Save and organize insights from AI conversations with citation tracking
- **Audio Overviews**: Generate podcast-style audio summaries of your content
- **Vector Search**: Semantic search across your document collection (optional)
- **Modern UI**: Clean, responsive interface built with shadcn/ui and Tailwind CSS
- **Secure Auth**: Email authentication powered by Supabase
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

This project is built with:

- **Frontend**: 
  - [Vite](https://vitejs.dev/) - Next generation frontend tooling
  - [React 18](https://react.dev/) - UI library
  - [TypeScript](https://www.typescriptlang.org/) - Type safety
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
  - [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
  - [Framer Motion](https://www.framer.com/motion/) - Animation library
  - [TanStack Query](https://tanstack.com/query) - Data fetching and caching

- **Backend**: 
  - [Supabase](https://supabase.com/) - Database, Authentication, Storage, Edge Functions
  - PostgreSQL with pgvector extension for semantic search

- **AI & Automation** (Optional):
  - [n8n](https://n8n.io/) - Workflow automation
  - OpenAI API - Text generation and embeddings
  - Supabase Vector Store - Semantic search capabilities

## Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier available)
- (Optional) n8n instance and OpenAI API key for AI features

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aura-study.git
   cd aura-study
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migrations:
     ```bash
     # Install Supabase CLI if you haven't
     npm install -g supabase
     
     # Link your project
     supabase link --project-ref your-project-ref
     
     # Push migrations
     supabase db push
     ```

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Type check
pnpm exec tsc --noEmit
```

## Build & Deployment

### Build
```bash
pnpm build
```

The optimized production build will be in the `dist/` directory.

### Deploy

**Vercel** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Other platforms**: Upload the `dist/` folder to any static hosting service (Cloudflare Pages, GitHub Pages, etc.)


## AI Features Setup (Optional)

Aura Study works in two modes:

### Simple Mode (Default)
Perfect for getting started quickly:
- File upload and management
- Basic chat functionality
- Notes organization
- File-based metadata

### Full AI Mode (Requires n8n + OpenAI)
Unlock the full potential:
- All Simple Mode features
- AI-generated titles, descriptions, and icons
- Smart document summaries with key insights
- Automated example questions generation
- Vector-based semantic search with citations
- Context-aware AI responses with source references
- Audio podcast generation

**Setup guides:**
- Detailed setup: [N8N_SETUP_GUIDE.md](./N8N_SETUP_GUIDE.md)
- Quick start: [N8N_QUICK_START.md](./N8N_QUICK_START.md)

**Requirements:**
- n8n instance (self-hosted or cloud)
- OpenAI API key
- ~15-20 minutes setup time
- Monthly cost: $1-5 for typical usage

## Project Structure

```
aura-study/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── chat/        # Chat-related components
│   │   ├── project/     # Project/studio components
│   │   ├── sources/     # Document management
│   │   ├── ui/          # shadcn/ui components
│   │   └── viewer/      # Document viewer components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── features/        # Feature-based modules
│   │   ├── auth/        # Authentication features
│   │   └── dashboard/   # Dashboard features
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── providers/       # React providers
│   └── mocks/           # Mock data for development
├── supabase/
│   ├── functions/       # Supabase Edge Functions
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: n8n webhooks (for AI features)
VITE_N8N_WEBHOOK_URL=your-n8n-webhook-url
```

### Supabase Edge Functions

If using AI features, deploy the edge functions:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy generate-notebook-content
supabase functions deploy process-document-callback
supabase functions deploy audio-generation-callback
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made for learners and researchers**
