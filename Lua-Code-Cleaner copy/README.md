# Lua Code Deobfuscator

A powerful web application for deobfuscating Lua scripts, specifically designed for FiveM and QBCore scripts.

## Features

- **AI-Powered Deobfuscation**: Uses GPT-5.1 to intelligently clean and rename obfuscated Lua code
- **History Tracking**: All deobfuscated scripts are saved with full history
- **Batch Processing**: Upload zip files containing multiple Lua scripts for batch deobfuscation
- **Modern UI**: Clean, responsive interface with syntax highlighting and code comparison

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Netlify Serverless Functions
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI GPT-5.1
- **Code Editor**: PrismJS for syntax highlighting

## Deployment

### Netlify (Production)

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

Quick start:
1. Connect your GitHub/GitLab/Bitbucket repository to Netlify
2. Set environment variables (DATABASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY)
3. Deploy automatically via `netlify.toml` configuration

### Local Development

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL=postgresql://user:password@host:port/database
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

## Project Structure

```
.
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── netlify/
│   └── functions/       # Serverless API endpoints
├── server/              # Original Express server (for local dev)
├── shared/              # Shared types and schemas
└── netlify.toml         # Netlify configuration
```

## API Endpoints

All endpoints are available as serverless functions:

- `POST /api/clean` - Deobfuscate Lua code
- `GET /api/history` - Get all snippets
- `GET /api/history/:id` - Get specific snippet
- `POST /api/upload-zip` - Batch process zip files

## Features in Detail

### Code Deobfuscation

The AI analyzes obfuscated Lua code and:
- Identifies variable purposes (e.g., L0_1 → QBCore)
- Restores meaningful function names
- Fixes indentation and formatting
- Removes redundant intermediate variables
- Recognizes QBCore/ESX patterns

### History Sidebar

- View all previously deobfuscated scripts
- Click to reload and compare
- Automatic timestamping
- Persistent storage in PostgreSQL

### Batch Processing

- Upload zip files containing multiple .lua files
- Automatically processes all scripts
- Groups results by batch ID
- Download all cleaned scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
