# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ca0c2560-95df-4669-9440-a19ae7e92585

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key (optional, fallback text parser will be used if not set)
3. Run the app:
   `npm run dev` and `npm run server` in two separate terminals (or configure concurrently)

