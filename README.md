# FitMatch.AI

Upload a clothing item photo and get AI-powered style inspiration.

## Setup

1. Add your Anthropic API key to `server/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. Run (two terminals):
   ```bash
   # Terminal 1
   cd server && npm run dev

   # Terminal 2
   cd client && npm run dev
   ```

4. Open http://localhost:5173
