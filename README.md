# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/de6e16e2-b666-4422-98d3-19645b61a23b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/de6e16e2-b666-4422-98d3-19645b61a23b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage, Edge Functions)
- **AI Features**: n8n workflows, OpenAI API (optional)
- **Vector Search**: Supabase Vector Store (optional)

## AI Features Setup (Optional)

Aura Study can work in two modes:

### Simple Mode (Current - Default)
- ✅ File upload and management
- ✅ Basic chat functionality
- ✅ Notes and flashcards
- ✅ File-based titles and icons
- ❌ No AI-generated content
- ❌ No semantic search

### Full AI Mode (Requires n8n)
- ✅ All Simple Mode features
- ✅ AI-generated titles and descriptions
- ✅ Smart document summaries
- ✅ Example questions generation
- ✅ Vector-based semantic search
- ✅ Citation-aware responses

**To enable Full AI Mode:**
1. Follow the guide: [N8N_SETUP_GUIDE.md](./N8N_SETUP_GUIDE.md)
2. Or quick start: [N8N_QUICK_START.md](./N8N_QUICK_START.md)

**Estimated setup time**: 15-20 minutes  
**Monthly cost**: $1-5 (for typical usage)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/de6e16e2-b666-4422-98d3-19645b61a23b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
