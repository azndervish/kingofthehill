---
type: project
description: Agent memory for next session
---

# kingofthehill — Agent Memory

## Stack
Vite + React + MUI v4, Vitest (jsdom, globals, setupFiles src/test-setup.js), Playwright firefox only (chromium headless_shell missing). Base `/kingofthehill/`, outDir `dist` (gh-pages branch), `define __APP_VERSION__/__COMMIT_HASH__/__BUILD_TIME__`.

## Env & Proxy (critical)
`ALL_PROXY=http://127.0.0.1:*` blocks localhost + github. Always use `NO_PROXY="*" no_proxy="*"`, `curl --noproxy '*'`, `env -u http_proxy -u https_proxy` for vite, vitest collect, gh-pages push. Jenkins: `JENKINS_URL=http://host.docker.internal:8080`, `JENKINS_USER=admin`, `JENKINS_TOKEN` (redact). Verify via `curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/api/json"`.

## Dev Server
`setsid -f bash -c 'no_proxy="*" NO_PROXY="*" npx vite preview --port 4174 --host 127.0.0.1 > /tmp/vite.log 2>&1'` ; dev `5173`. Must use `page.goto('./?seed=x')` not `/?seed` (base). `curl --noproxy '*' http://127.0.0.1:4174/kingofthehill/`.

## Build/Deploy
`no_proxy="*" npm run build` → `dist/index-*.js` (~348k). Check `grep -a version-marker dist/assets/*.js`. Deploy `env -u http_proxy npx gh-pages -d dist` (not docs). Live CDN max-age 600.

## Engine
33 items in `src/items/` (sweep excluded from deck). `engine.initializeItems()` needs `x.default||x` (ESM). `createGame` shuffles, `nextTurn` pushes 3 to sale. Seeded RNG `mulberry32` via `setSeed` string|number, `roll`/`shuffle` use `seededRandom`. Query param `seed|randomSeed|...` in `App.jsx`. `MAX_REROLLS=2`, `getTotalRerolls` for giantbrain.

## UI Fixes Applied
- fa→hearts: Material Icons font in index.html
- dice hold: `reinitDice`→false (unchecked), front-concat `newKeep=[T*kept,F*rest]`, key `hand_die${n}-${die}-${keep?'keep':'reroll'}` + keys on label/checkbox to fix Mui-checked visual desync (check both input.checked and Mui-checked)
- items empty: `||` fallback fixed
- reroll end: button shows `(2)/(1)`/`No rerolls left`, disabled when `!canReroll`, `canReroll` guard, auto-apply after last reroll (350ms), `handleNextTurn` resets diceToKeep and spreads new object so React sees uid change (engine mutates)
- turn reset: next human turn all false

## Tests
`NO_PROXY="*" npx vitest run` (60-90s, jsdom). `NO_PROXY="*" npx playwright test --project=firefox` (needs preview). 7 files ~37 vitest, 10 e2e (dice-hold 5, items-sale 2, reroll-turn 3). Strict locator for `Items for Sale` heading.

## Jenkins
23 jobs total (aws upload, docker logs/ps/start, ra_* , etc). Auth required.

## Git
Never commit/push without ask; use `workspace-recovery.sh save before-discard`. `dist` ignored.
