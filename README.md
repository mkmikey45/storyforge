# StoryForge

A responsive AI story generator starter app for the web and Android.

## What works

- Story idea prompt, length, genre, and writing-style controls
- AI story generation through a server-side API route
- Copy and regenerate story actions
- Local story library saved in the browser
- Responsive dark UI
- PWA manifest so the web app can be installed from a supported mobile browser

## Requirements

- Node.js 20 or newer
- An API key from an AI provider that supports the OpenAI-compatible Chat Completions API
- If the provider account requires billing or an adult account holder, ask a parent/guardian to help set it up.

## Run locally

1. Extract this folder.
2. Open a terminal in the folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
5. Put your provider details in `.env`:

   ```env
   AI_API_KEY=your_private_key
   AI_BASE_URL=https://api.openai.com/v1
   AI_MODEL=gpt-4o-mini
   PORT=8787
   ```

   Keep `.env` private. Never paste the API key into the React files, a public repository, or a chat.

6. Start the app:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite, usually `http://localhost:5173`.

The AI generation endpoint is served by the local Node server on port 8787. Vite forwards `/api` requests to it.

## Production build

```bash
npm run build
npm start
```

The server serves the built website and handles `/api/story`.

## Install on Android

Deploy the app over HTTPS. Open the deployed website in Chrome on Android, then use the browser menu and choose **Install app** or **Add to Home screen** (the exact wording can vary).

This creates an installable web app. To publish a native APK/AAB later, the project can be wrapped with Capacitor and tested in Android Studio.

## Important notes

- AI API usage may cost money depending on the provider and model. Set provider spending limits where available.
- The API key is read only by the Node server. Do not expose it in client-side code.
- Saved stories are stored in the current browser's local storage. They are not synced across devices or accounts yet.
- This is a starter project. Before public launch, add authentication, rate limiting, abuse protection, privacy/terms pages, and hosting.
