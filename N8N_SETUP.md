# N8N Integration Setup Guide

## Overview
Aura Study uses N8N workflows (via Supabase Edge Functions) to process documents, generate content, and handle AI operations.

## Architecture
```
Frontend (aura-study) 
  ↓ calls Supabase Edge Functions
  ↓
Supabase Edge Functions (proxy layer)
  ↓ triggers N8N webhooks
  ↓
N8N Workflows
  ↓ calls AI APIs (Gemini/GPT-4)
  ↓ returns results
  ↓
Supabase Database (stores results)
```

## Required N8N Workflows

### 1. **Process Document** (`InsightsLM___Extract_Text.json`)
- **Webhook URL**: `DOCUMENT_PROCESSING_WEBHOOK_URL`
- **Purpose**: Extract text from uploaded files (PDF, Word, images via OCR, audio transcription)
- **Input**: `{ sourceId, filePath, sourceType }`
- **Output**: Updates `sources` table with extracted content

### 2. **Generate Notebook Content** (`InsightsLM___Generate_Notebook_Details.json`)
- **Webhook URL**: `NOTEBOOK_GENERATION_WEBHOOK_URL`
- **Purpose**: Generate notebook title, description, example questions using AI
- **Input**: `{ notebookId, filePath, sourceType }`
- **Output**: Updates `notebooks` table

### 3. **Send Chat Message** (`InsightsLM___Chat.json`)
- **Webhook URL**: `CHAT_WEBHOOK_URL`
- **Purpose**: Handle Q&A with AI based on document context
- **Input**: `{ message, sessionId, notebookId }`
- **Output**: Stores in `n8n_chat_histories` and returns AI response

### 4. **Process Additional Sources** (`InsightsLM___Process_Additional_Sources.json`)
- **Webhook URL**: `PROCESS_ADDITIONAL_SOURCES_WEBHOOK_URL`
- **Purpose**: Handle adding new sources to existing notebook
- **Input**: `{ notebookId, sourceId, filePath, sourceType }`

### 5. **Generate Audio Overview** (`InsightsLM___Podcast_Generation.json`)
- **Webhook URL**: `AUDIO_OVERVIEW_WEBHOOK_URL`
- **Purpose**: Generate audio podcast/summary from notebook content
- **Input**: `{ notebookId }`
- **Output**: Updates `notebooks.audio_overview_url`

### 6. **Upsert to Vector Store** (`InsightsLM___Upsert_to_Vector_Store.json`)
- **Webhook URL**: `VECTOR_STORE_WEBHOOK_URL`
- **Purpose**: Create embeddings for semantic search
- **Input**: `{ notebookId, content }`
- **Output**: Stores in `documents` table with embeddings

## Setup Instructions

### Step 1: Import N8N Workflows
1. Open your N8N instance
2. Import all workflows from `n8n/` folder:
   ```
   n8n/InsightsLM___Extract_Text.json
   n8n/InsightsLM___Generate_Notebook_Details.json
   n8n/InsightsLM___Chat.json
   n8n/InsightsLM___Process_Additional_Sources.json
   n8n/InsightsLM___Podcast_Generation.json
   n8n/InsightsLM___Upsert_to_Vector_Store.json
   ```

### Step 2: Configure N8N Webhook URLs
After activating each workflow, copy the webhook URLs.

### Step 3: Set Supabase Edge Function Environment Variables
Go to Supabase Dashboard → Edge Functions → Settings and add:

```bash
# Required
DOCUMENT_PROCESSING_WEBHOOK_URL=https://your-n8n.com/webhook/extract-text
NOTEBOOK_GENERATION_WEBHOOK_URL=https://your-n8n.com/webhook/generate-notebook
CHAT_WEBHOOK_URL=https://your-n8n.com/webhook/chat
PROCESS_ADDITIONAL_SOURCES_WEBHOOK_URL=https://your-n8n.com/webhook/process-sources
AUDIO_OVERVIEW_WEBHOOK_URL=https://your-n8n.com/webhook/generate-audio
VECTOR_STORE_WEBHOOK_URL=https://your-n8n.com/webhook/upsert-vectors

# Authentication (if N8N requires)
NOTEBOOK_GENERATION_AUTH=Bearer your-secret-token

# Supabase (auto-injected by Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Deploy Edge Functions
```bash
cd aura-study
npx supabase functions deploy process-document
npx supabase functions deploy generate-notebook-content
npx supabase functions deploy send-chat-message
npx supabase functions deploy process-additional-sources
npx supabase functions deploy generate-audio-overview
npx supabase functions deploy audio-generation-callback
npx supabase functions deploy process-document-callback
npx supabase functions deploy refresh-audio-url
npx supabase functions deploy generate-note-title
npx supabase functions deploy webhook-handler
```

### Step 5: Test Integration
1. Start dev server: `npm run dev`
2. Login to the app
3. Create a new notebook
4. Upload a document → should trigger `process-document` Edge Function → N8N workflow
5. Check Supabase logs and N8N execution history

## Hooks Usage in Frontend

### Upload and Process Document
```tsx
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';

const { uploadFile } = useFileUpload();
const { processDocumentAsync } = useDocumentProcessing();

// Upload file
const filePath = await uploadFile(file, notebookId);

// Trigger processing
await processDocumentAsync({
  sourceId: newSource.id,
  filePath,
  sourceType: 'pdf'
});
```

### Generate Notebook Content
```tsx
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';

const { generateNotebookContent } = useNotebookGeneration();

await generateNotebookContent.mutateAsync({
  notebookId,
  filePath,
  sourceType: 'pdf'
});
```

### Chat with AI
```tsx
import { useChatMessages } from '@/hooks/useChatMessages';

const { sendMessage, messages } = useChatMessages(notebookId);

await sendMessage.mutateAsync({
  message: 'Summarize this document',
  notebookId
});
```

## Database Schema Reference

### `notebooks`
- `id`, `user_id`, `title`, `description`, `icon`, `color`
- `generation_status`: 'pending' | 'processing' | 'completed' | 'failed'
- `audio_overview_url`, `audio_overview_generation_status`
- `example_questions`: string[]

### `sources`
- `id`, `notebook_id`, `title`, `type`, `file_path`, `url`
- `processing_status`: 'pending' | 'processing' | 'completed' | 'failed'
- `content`, `summary`, `metadata`

### `notes`
- `id`, `notebook_id`, `title`, `content`
- `source_type`: 'user' | 'generated'

### `documents` (Vector embeddings)
- `id`, `content`, `metadata`, `embedding` (vector 1536)

## Troubleshooting

### Edge Function not calling N8N
- Check Edge Function logs in Supabase Dashboard
- Verify webhook URLs are correct
- Check N8N workflow is activated

### Document processing stuck at "pending"
- Check N8N execution history
- Verify callback URL is accessible
- Check `sources.processing_status` in database

### Chat not returning responses
- Verify `CHAT_WEBHOOK_URL` is set
- Check `n8n_chat_histories` table for stored messages
- Test N8N workflow manually with sample data

## Next Steps
1. Configure AI API keys in N8N (Gemini, OpenAI, etc.)
2. Setup storage buckets in Supabase for file uploads
3. Configure RLS policies for security
4. Test end-to-end workflow
