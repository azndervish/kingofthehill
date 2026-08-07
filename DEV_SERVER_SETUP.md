# Dev Server Setup Guide

## Starting the Dev Server

The Vite dev server must be started in the background to allow Playwright tests to run. Use this command:

```bash
cd /home/azndervish/workspace/kingofthehill
rm /tmp/vite.pid 2>/dev/null
nohup npm run dev >/dev/null 2>&1 &
sleep 3
```

This will:
1. Kill any existing vite processes
2. Start Vite in the background with nohup (survives terminal close)
3. Redirect output to /dev/null to keep the session clean
4. Wait 3 seconds for the server to start

## Verify Server is Running

```bash
ps aux | grep vite | grep -v grep
curl -s http://localhost:5173/kingofthehill/ | head -20
```

## Stopping the Dev Server

```bash
pkill -f "vite"
```

## Important Notes

- The server listens on http://localhost:5173/kingofthehill/
- The vite base URL is set to `/kingofthehill/` in vite.config.js
- Playwright tests connect via Playwright's Firefox browser instance
- The server must be running BEFORE tests execute
- Hot-reload works but browser caching can be an issue; use cache-busting query params if needed

## Running Tests

After starting the dev server:

```bash
cd /home/azndervish/workspace/kingofthehill
timeout 30 node test-deployed.js
```

This will:
1. Connect to the local dev server at http://localhost:5173/kingofthehill/
2. Launch a Playwright Firefox browser
3. Navigate to the app
4. Click "Start Game"
5. Wait for the game component to load
