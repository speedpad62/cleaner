# Netlify Deployment Guide

This guide will help you deploy the Lua Deobfuscator application to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. A Supabase database (already provisioned)
3. OpenAI API access through Replit AI Integrations

## Deployment Steps

### 1. Connect Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to Netlify
3. Click "Add new site" > "Import an existing project"
4. Connect your Git provider and select your repository

### 2. Configure Build Settings

Netlify will automatically detect the `netlify.toml` configuration file. Verify the settings:

- **Build command:** `npm run build:netlify`
- **Publish directory:** `dist/public`
- **Functions directory:** `netlify/functions`

### 3. Set Environment Variables

In your Netlify site settings, go to "Environment variables" and add:

```
DATABASE_URL=your_supabase_database_url
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

To get these values:
- **DATABASE_URL**: From your Supabase project settings > Database > Connection string (use the "URI" format)
- **AI_INTEGRATIONS_OPENAI_API_KEY**: Your OpenAI API key
- **AI_INTEGRATIONS_OPENAI_BASE_URL**: Use the default OpenAI endpoint or Replit's proxy

### 4. Deploy Database Schema

Before deploying, ensure your database schema is up to date:

```bash
npm install
npm run db:push
```

### 5. Deploy

Click "Deploy site" in Netlify. The deployment will:
1. Install dependencies
2. Build the React frontend
3. Bundle serverless functions
4. Deploy everything to Netlify's CDN

### 6. Test Your Deployment

Once deployed, test the following:
- Visit your Netlify URL
- Try deobfuscating some Lua code
- Check that the history sidebar loads previous snippets
- Verify the upload zip functionality works

## API Routes

The following API endpoints are available as serverless functions:

- `POST /api/clean` - Deobfuscate Lua code
- `GET /api/history` - Get all snippets
- `GET /api/history/:id` - Get a specific snippet
- `POST /api/upload-zip` - Upload and process a zip file of Lua scripts

## Troubleshooting

### Function Timeouts
Netlify functions have a 10-second timeout on the free tier (26 seconds on Pro). Large zip files may timeout.

### Database Connection Issues
Ensure your DATABASE_URL is correct and includes the password. Use the connection pooler URL if available.

### Build Failures
Check the build logs in Netlify. Common issues:
- Missing environment variables
- TypeScript errors
- Node version mismatch (should be Node 20)

### Cold Starts
Serverless functions may take 1-2 seconds on the first request. Subsequent requests are faster.

## Local Development

To develop locally:

```bash
npm install
npm run dev
```

The Express server will run on http://localhost:5000

## Comparison: Netlify vs Replit

**Netlify Advantages:**
- Better for production deployments
- Global CDN for fast static asset delivery
- Automatic HTTPS
- Custom domains included
- Better scalability

**Replit Advantages:**
- Instant development environment
- No deployment configuration needed
- Integrated database provisioning
- Better for prototyping and learning

## Support

For issues specific to Netlify deployment, consult:
- Netlify Documentation: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com

For application issues, check the browser console and Netlify function logs.
