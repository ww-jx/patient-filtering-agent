# Paper AI Assistant Integration

GiraffeGuru now includes an integrated AI-powered assistant for academic papers from arXiv, medRxiv, and bioRxiv.

## 🎯 Features

- **Multi-Source Support**: Works with arXiv, medRxiv, and bioRxiv papers
- **AI Chat Interface**: Ask questions about any paper and get intelligent responses
- **Clickable Page References**: AI cites specific pages, click to jump to that page in the PDF
- **Context-Aware Suggestions**: Get relevant follow-up questions based on your conversation
- **CORS-Free PDF Loading**: Built-in proxy ensures PDFs load without issues

## 📍 URL Mapping

### arXiv Papers
**Original**: `https://arxiv.org/pdf/2510.01309`  
**GiraffeGuru**: `https://giraffeguru.com/pdf/2510.01309`

### medRxiv Papers
**Original**: `https://www.medrxiv.org/content/10.1101/2023.12.06.23299426v1.full.pdf`  
**GiraffeGuru**: `https://www.giraffeguru.com/content/10.1101/2023.12.06.23299426v1.full.pdf`

### bioRxiv Papers
**Original**: `https://www.biorxiv.org/content/10.1101/2025.03.13.642940v2.full.pdf`  
**GiraffeGuru**: `https://www.giraffeguru.com/content/10.1101/2025.03.13.642940v2.full.pdf`

## 🏗️ Architecture

### Directory Structure

```
src/
├── lib/papers/              # Shared paper utilities
│   ├── types.ts            # Type definitions
│   ├── arxiv.ts            # arXiv-specific utilities
│   ├── medrxiv.ts          # medRxiv-specific utilities
│   ├── biorxiv.ts          # bioRxiv-specific utilities
│   ├── chatTypes.ts        # Chat interface types
│   └── index.ts            # Unified API exports
│
├── components/papers/       # Paper-related UI components
│   ├── ChatWidget.tsx      # Main chat interface
│   └── ChatWidget.module.css
│
├── app/
│   ├── pdf/[...paperId]/   # arXiv paper viewer
│   │   └── page.tsx
│   ├── content/[...doi]/   # medRxiv/bioRxiv paper viewer
│   │   └── page.tsx
│   └── api/
│       ├── papers/chat/    # AI chat endpoint
│       │   └── route.ts
│       └── pdf-proxy/      # PDF proxy for CORS
│           └── route.ts
```

### Key Components

#### 1. Paper Utilities (`/src/lib/papers/`)

Generalized utilities that handle:
- Paper ID parsing and validation
- URL generation for PDFs and abstracts
- Source detection (arXiv vs medRxiv vs bioRxiv)
- AI context generation for different paper types

#### 2. Chat Widget (`/src/components/papers/ChatWidget.tsx`)

Client-side React component that:
- Manages chat conversation state
- Handles user input and AI responses
- Renders markdown with clickable page references
- Shows context-aware suggested questions

#### 3. API Routes

**`/api/papers/chat`**: 
- Integrates with Google Gemini API
- Uploads PDFs to Gemini for analysis
- Generates structured responses with page citations
- Caches uploaded PDFs to avoid re-uploading

**`/api/pdf-proxy`**:
- Fetches PDFs from original sources
- Serves with proper CORS headers
- Enables PDF.js viewer to load papers without issues

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

New dependencies added:
- `@google/genai@^1.18.0` - Google Gemini AI SDK
- `react-markdown@^10.1.0` - Markdown rendering
- `remark-gfm@^4.0.1` - GitHub Flavored Markdown
- `rehype-highlight@^7.0.2` - Code syntax highlighting
- `@vercel/analytics@^1.5.0` - Analytics

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Google Gemini API for paper chat assistant
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

Get your Gemini API key: https://aistudio.google.com/app/apikey

### 3. Deploy

Deploy to Vercel as usual:

```bash
vercel deploy
```

## 🎨 Usage Examples

### Example 1: arXiv Paper
```
https://www.giraffeguru.com/pdf/2510.01309
```
Opens the cosmology paper with AI assistant for questions about dark radiation

### Example 2: medRxiv Paper
```
https://www.giraffeguru.com/content/10.1101/2023.12.06.23299426v1
```
Opens the medical research paper with AI assistant

### Example 3: bioRxiv Paper
```
https://www.giraffeguru.com/content/10.1101/2025.03.13.642940v2
```
Opens the biological sciences paper with AI assistant

## 💡 How It Works

1. **User visits paper URL** on giraffeguru.com
2. **Paper ID is parsed** and validated
3. **PDF is loaded** in PDF.js viewer via proxy
4. **ChatWidget initializes** and requests welcome message
5. **PDF is uploaded to Gemini** for the first query
6. **AI analyzes PDF** and provides contextualized responses
7. **Page references are clickable** and navigate the PDF viewer
8. **Follow-up questions** use conversation history without re-uploading

## 🔧 Customization

### Adding New Paper Sources

To add support for a new paper source (e.g., SSRN, HAL):

1. Create `src/lib/papers/newsource.ts` with:
   - Parser function
   - URL generator
   - Validation pattern
   - AI context generator

2. Add to `src/lib/papers/types.ts`:
   ```typescript
   export type PaperSource = 'arxiv' | 'medrxiv' | 'biorxiv' | 'newsource';
   ```

3. Update `src/lib/papers/index.ts` to include new source

4. Create route in `src/app/newsource-path/[...id]/page.tsx`

### Customizing AI Behavior

Edit the prompt in `/src/app/api/papers/chat/route.ts`:

```typescript
const promptText = `${aiContext}

Your custom instructions here...
`;
```

## 📊 Monitoring

### API Usage

Track Gemini API usage at: https://aistudio.google.com/app/apikey

### Analytics

Vercel Analytics automatically tracks:
- Page views per paper
- Chat interactions
- API response times

## 🐛 Troubleshooting

### PDF Won't Load
- Check that the paper ID is valid
- Verify the source is accessible
- Check browser console for CORS errors

### Chat Not Working
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota at Google AI Studio
- Review API route logs in Vercel

### Large PDF Files
- Gemini has a ~2GB file size limit
- Consider using a smaller model for very large files
- Add file size checks in the proxy route

## 🔒 Security Notes

- PDF proxy validates paper IDs before fetching
- Gemini API key should never be exposed to client
- All API routes use server-side execution
- CORS headers are properly configured

## 📝 Code Reusability

The asxiv folder remains separate and functional. To update it with changes:

1. asxiv can import from main app utilities:
   ```typescript
   import { parseArxivId } from '@/lib/papers';
   ```

2. Or keep it independent with its own utils (current setup)

3. Both share the same logic but can evolve independently

## 🚢 Deployment Checklist

- [ ] Set `GEMINI_API_KEY` in Vercel environment variables
- [ ] Set `GEMINI_MODEL` (optional, defaults to gemini-2.0-flash-exp)
- [ ] Run `npm install` to install new dependencies
- [ ] Test all three paper sources locally
- [ ] Deploy to Vercel
- [ ] Verify paper URLs work in production
- [ ] Test chat functionality with real papers

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Built with ❤️ for the research community**
