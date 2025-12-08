# Aura Study - Integration Guide

## Database Schema & Hooks Usage

### 📊 Database Tables

#### 1. `notebooks` - Main study notebooks
```typescript
{
  id: string (uuid)
  user_id: string (uuid, FK to profiles)
  title: string
  description: string | null
  icon: string (default: '📝')
  color: string (default: 'gray')
  generation_status: string | null (pending/processing/completed/failed)
  audio_overview_generation_status: string | null
  audio_overview_url: string | null
  audio_url_expires_at: timestamp | null
  example_questions: string[] | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### 2. `sources` - Documents/files attached to notebooks
```typescript
{
  id: string (uuid)
  notebook_id: string (FK to notebooks)
  title: string
  type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio'
  url: string | null
  file_path: string | null  // Path trong Supabase Storage: {notebook_id}/{source_id}.{ext}
  file_size: number | null
  display_name: string | null
  content: string | null    // Extracted text content
  summary: string | null
  processing_status: string | null (pending/uploading/processing/completed/failed)
  metadata: jsonb | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### 3. `notes` - User notes
```typescript
{
  id: string (uuid)
  notebook_id: string (FK to notebooks)
  title: string
  content: string
  source_type: string | null (user/generated)
  extracted_text: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### 4. `profiles` - User profiles
```typescript
{
  id: string (uuid, FK to auth.users)
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

#### 5. `n8n_chat_histories` - Chat messages
```typescript
{
  id: number (serial)
  session_id: uuid
  message: jsonb  // Complex structure with type, content, citations
  // No explicit timestamp - relies on insertion order
}
```

#### 6. `documents` - Vector embeddings for semantic search
```typescript
{
  id: number (bigserial)
  content: string | null
  metadata: jsonb | null
  embedding: vector(1536) | null  // OpenAI/Gemini embeddings
}
```

---

## 🎣 Hooks Usage Guide

### 1. **useNotebooks** - Manage notebooks

```tsx
import { useNotebooks } from '@/hooks/useNotebooks';

const MyComponent = () => {
  const {
    notebooks,        // Array of notebooks with source counts
    isLoading,
    error,
    addNotebook,      // Mutation: create new notebook
    isAdding
  } = useNotebooks();

  // Create new notebook
  const handleCreate = async () => {
    const newNotebook = await addNotebook.mutateAsync({
      title: 'My Notebook',
      description: 'Study materials',
      icon: '📚',
      color: 'blue'
    });
    console.log('Created:', newNotebook.id);
  };

  return (
    <div>
      {notebooks.map(nb => (
        <div key={nb.id}>
          {nb.icon} {nb.title} ({nb.sources[0].count} sources)
        </div>
      ))}
    </div>
  );
};
```

**Key Points:**
- Automatically fetches for current user (`user_id`)
- Includes source count via separate query
- Real-time subscription auto-updates on changes
- Returns empty array if no user authenticated

---

### 2. **useSources** - Manage document sources

```tsx
import { useSources } from '@/hooks/useSources';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';

const AddDocumentComponent = ({ notebookId }) => {
  const {
    sources,
    isLoading,
    addSourceAsync,    // Create source record
    updateSource       // Update source (e.g., processing_status)
  } = useSources(notebookId);

  const { uploadFile } = useFileUpload();
  const { processDocumentAsync } = useDocumentProcessing();
  const { generateNotebookContentAsync } = useNotebookGeneration();

  const handleFileUpload = async (file: File) => {
    try {
      // Step 1: Create source record in database
      const newSource = await addSourceAsync({
        notebookId,
        title: file.name,
        type: 'pdf',  // or 'audio', 'text', etc.
        processing_status: 'pending'
      });

      // Step 2: Upload file to Supabase Storage (bucket: 'sources')
      const filePath = await uploadFile(file, notebookId, newSource.id);
      // filePath format: {notebookId}/{sourceId}.pdf

      // Step 3: Update source with file_path
      updateSource({
        sourceId: newSource.id,
        updates: {
          file_path: filePath,
          file_size: file.size,
          processing_status: 'processing'
        }
      });

      // Step 4: Trigger Edge Function to process document
      await processDocumentAsync({
        sourceId: newSource.id,
        filePath,
        sourceType: 'pdf'
      });
      // Edge Function: process-document → N8N Extract Text workflow

      // Step 5: Generate notebook metadata (title, description, questions)
      await generateNotebookContentAsync({
        notebookId,
        filePath,
        sourceType: 'pdf'
      });
      // Edge Function: generate-notebook-content → N8N workflow

    } catch (error) {
      console.error('Failed:', error);
      updateSource({
        sourceId: newSource.id,
        updates: { processing_status: 'failed' }
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => {
        if (e.target.files[0]) handleFileUpload(e.target.files[0]);
      }} />
      
      {sources.map(source => (
        <div key={source.id}>
          {source.title} - {source.processing_status}
        </div>
      ))}
    </div>
  );
};
```

**Key Points:**
- `addSourceAsync` creates DB record, returns `{ id, ... }`
- Upload to Storage bucket `'sources'` with path: `{notebookId}/{sourceId}.{ext}`
- Call Edge Functions to trigger N8N workflows
- Real-time subscription updates `processing_status` automatically

---

### 3. **useChatMessages** - AI Chat/Q&A

```tsx
import { useChatMessages } from '@/hooks/useChatMessages';

const ChatComponent = ({ notebookId }) => {
  const {
    messages,         // Transformed chat messages with citations
    isLoading,
    sendMessage,      // Mutation: send message to AI
    isSending
  } = useChatMessages(notebookId);

  const handleSend = async (userMessage: string) => {
    try {
      await sendMessage.mutateAsync({
        message: userMessage,
        notebookId
      });
      // Calls Edge Function: send-chat-message → N8N Chat workflow
      // Response stored in n8n_chat_histories
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.message.type === 'human' ? 'You' : 'AI'}:</strong>
          {msg.message.type === 'ai' && msg.message.content.segments ? (
            <div>
              {msg.message.content.segments.map((seg, i) => (
                <span key={i}>
                  {seg.text}
                  {seg.citation_id && (
                    <sup>[{seg.citation_id}]</sup>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span>{typeof msg.message.content === 'string' ? msg.message.content : ''}</span>
          )}
        </div>
      ))}
      
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSend(e.currentTarget.value);
        }}
      />
    </div>
  );
};
```

**Key Points:**
- Fetches from `n8n_chat_histories` filtered by `session_id = notebookId`
- Messages have complex structure with citations
- `sendMessage` calls Edge Function `send-chat-message`
- Real-time subscription updates chat history

---

### 4. **useFileUpload** - Upload files to Storage

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

const { uploadFile, getFileUrl, isUploading } = useFileUpload();

// Upload
const filePath = await uploadFile(file, notebookId, sourceId);
// Returns: "{notebookId}/{sourceId}.pdf"

// Get public URL
const url = getFileUrl(filePath);
// Returns: "https://...supabase.co/storage/v1/object/public/sources/..."
```

**Storage Structure:**
```
Bucket: sources
├── {notebook_id_1}/
│   ├── {source_id_1}.pdf
│   ├── {source_id_2}.docx
│   └── {source_id_3}.mp3
└── {notebook_id_2}/
    └── {source_id_4}.pdf
```

---

### 5. **useNotebookGeneration** - Generate AI content

```tsx
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';

const { generateNotebookContentAsync, isGenerating } = useNotebookGeneration();

// Generate title, description, example questions
await generateNotebookContentAsync({
  notebookId: 'uuid-here',
  filePath: 'notebook_id/source_id.pdf',
  sourceType: 'pdf'
});
```

**What it does:**
- Calls Edge Function: `generate-notebook-content`
- Edge Function triggers N8N workflow: `InsightsLM___Generate_Notebook_Details.json`
- Updates `notebooks` table: `title`, `description`, `example_questions`

---

### 6. **useDocumentProcessing** - Extract text from files

```tsx
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';

const { processDocumentAsync, isProcessing } = useDocumentProcessing();

await processDocumentAsync({
  sourceId: 'source-uuid',
  filePath: 'notebook_id/source_id.pdf',
  sourceType: 'pdf'
});
```

**What it does:**
- Calls Edge Function: `process-document`
- Edge Function triggers N8N workflow: `InsightsLM___Extract_Text.json`
- Extracts text via OCR/transcription
- Updates `sources.content` with extracted text
- Creates embeddings in `documents` table

---

### 7. **useNotes** - User notes CRUD

```tsx
import { useNotes } from '@/hooks/useNotes';

const {
  notes,
  isLoading,
  addNote,
  updateNote,
  deleteNote
} = useNotes(notebookId);

// Create
await addNote.mutateAsync({
  notebookId,
  title: 'My Note',
  content: '# Notes\n\nContent here'
});

// Update
await updateNote.mutateAsync({
  noteId: 'note-uuid',
  updates: { content: 'Updated content' }
});

// Delete
await deleteNote.mutateAsync('note-uuid');
```

---

### 8. **useAudioOverview** - Generate audio summary

```tsx
import { useAudioOverview } from '@/hooks/useAudioOverview';

const { generateAudioOverview, refreshAudioUrl } = useAudioOverview();

// Generate audio podcast
await generateAudioOverview.mutateAsync({
  notebookId: 'uuid',
  content: 'Text to convert to audio'
});

// Refresh expired URL
const newUrl = await refreshAudioUrl.mutateAsync('notebook-uuid');
```

---

## 🔄 Complete Upload Flow Example

```tsx
import { useState } from 'react';
import { useSources } from '@/hooks/useSources';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
import { useNotebookGeneration } from '@/hooks/useNotebookGeneration';
import { useToast } from '@/hooks/use-toast';

const UploadDocument = ({ notebookId }: { notebookId: string }) => {
  const { addSourceAsync, updateSource } = useSources(notebookId);
  const { uploadFile } = useFileUpload();
  const { processDocumentAsync } = useDocumentProcessing();
  const { generateNotebookContentAsync } = useNotebookGeneration();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleUpload = async (file: File) => {
    setProcessing(true);
    let sourceId: string | null = null;

    try {
      // 1. Create source record
      const newSource = await addSourceAsync({
        notebookId,
        title: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'text',
        processing_status: 'pending'
      });
      sourceId = newSource.id;

      // 2. Upload to Storage
      updateSource({
        sourceId,
        updates: { processing_status: 'uploading' }
      });

      const filePath = await uploadFile(file, notebookId, sourceId);
      if (!filePath) throw new Error('Upload failed');

      // 3. Update with file path
      updateSource({
        sourceId,
        updates: {
          file_path: filePath,
          file_size: file.size,
          processing_status: 'processing'
        }
      });

      // 4. Process document (extract text)
      await processDocumentAsync({
        sourceId,
        filePath,
        sourceType: file.type.includes('pdf') ? 'pdf' : 'text'
      });

      // 5. Generate notebook content
      await generateNotebookContentAsync({
        notebookId,
        filePath,
        sourceType: file.type.includes('pdf') ? 'pdf' : 'text'
      });

      toast({
        title: 'Success',
        description: 'Document uploaded and processed!'
      });

    } catch (error) {
      console.error('Upload failed:', error);
      
      if (sourceId) {
        updateSource({
          sourceId,
          updates: { processing_status: 'failed' }
        });
      }

      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={processing}
      />
      {processing && <p>Processing...</p>}
    </div>
  );
};

export default UploadDocument;
```

---

## 🚀 Quick Start Checklist

1. ✅ **Database connected** - `.env` has correct Supabase credentials
2. ✅ **Types synced** - `types.ts` matches database schema
3. ✅ **Hooks copied** - All hooks from insights-lm-public in place
4. ✅ **Storage bucket created** - Create bucket `'sources'` in Supabase Storage
5. ⚠️ **Edge Functions deployed** - Already done in insights-lm-public project
6. ⚠️ **N8N workflows active** - Import and activate workflows
7. ⚠️ **Test upload flow** - Try uploading a document

---

## 📝 Important Notes

- **Realtime subscriptions**: Hooks automatically subscribe to database changes
- **Processing status**: Track via `sources.processing_status` and `notebooks.generation_status`
- **File paths**: Always format as `{notebookId}/{sourceId}.{extension}`
- **Edge Functions**: Already deployed in `insights-lm-public` Supabase project
- **N8N webhooks**: Configured in Edge Function environment variables
- **Session ID**: For chat, use `notebookId` as `session_id`

---

## 🔧 Troubleshooting

### Sources not updating after upload
- Check Realtime subscription in browser console
- Verify `processing_status` is being updated
- Check Edge Function logs in Supabase Dashboard

### Chat not working
- Verify `session_id` matches `notebookId`
- Check `n8n_chat_histories` table for messages
- Ensure Edge Function `send-chat-message` is deployed

### File upload fails
- Check Storage bucket `'sources'` exists and has public access
- Verify file path format: `{notebookId}/{sourceId}.{ext}`
- Check file size limits (default 50MB)
