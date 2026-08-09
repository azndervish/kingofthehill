# Agent Handbook — kingofthehill

Generated 2026-08-09 from session `ff657186` + follow-ups. Read this first.

## 1. Repo Map
```
kingofthehill/
  src/
    App.jsx              # Theme, version-marker, seed via URLSearchParams, items/game state
    engine/engine.js     # Core rules, seeded RNG, roll/shuffle, createGame/nextTurn/reroll/applyRoll/buy, 33 items
    items/*.js           # alphamonster … vaststorm, sweep (33 total; sweep excluded from deck)
    components/
      StartScreen.jsx
      Game.jsx           # class component, diceToKeep local state, front-concat, turn logic
      GamePlayers.jsx, GameLog.jsx, HillStrategy.jsx, Items.jsx
      __tests__/         # Vitest + jsdom (StartScreen, Game, GameLog, GamePlayers, HillStrategy, Items, App)
    engine/__tests__/seed.test.js
  e2e/                   # Playwright (firefox)
    dice-hold.spec.js    # 5 tests: init unchecked, reroll-all, hold 2+4→0,1, single 4→0, double reroll
    items-sale.spec.js   # 2 tests: 3+ sweep =4 cards
    reroll-turn.spec.js  # 3 tests: count/disable/auto-keep, next-turn reset, disabled no-op
  vite.config.js         # base '/kingofthehill/', outDir 'dist', test{jsdom,globals,setupFiles}, define __APP_VERSION__/__COMMIT_HASH__/__BUILD_TIME__
  playwright.config.js   # baseURL http://127.0.0.1:4174/kingofthehill/, firefox, reuseExistingServer
  index.html             # Material Icons + Roboto fonts (fa→hearts fix)
  package.json           # scripts: dev/vite, build, preview, deploy (gh-pages -d dist), test=vitest run
  dist/                  # prod build (gitignored), gh-pages branch serves this
  test-deployed.js       # legacy firefox check against localhost:5173
  DEV_SERVER_SETUP.md    # dev server notes (some stale — see §2)
```

## 2. Dev Server + Proxy Gotchas (critical)
- Vite dev: `http://localhost:5173/kingofthehill/` (base `/kingofthehill/` required). Preview prod: `http://127.0.0.1:4174/kingofthehill/` (port 4174, falls to 4175 if occupied).
- Env has `ALL_PROXY=http://127.0.0.1:*` and `http_proxy` etc. **All localhost fetches need `NO_PROXY="*"` / `no_proxy="*"` or `curl --noproxy '*'` / `env -u http_proxy -u https_proxy`.** Without it `curl` and `npm install`/`gh-pages push` fail (`ENOTEMPTY`, `Could not resolve host: github.com`).
- Start detached: `setsid -f bash -c 'no_proxy="*" NO_PROXY="*" npm run dev > /tmp/vite.log 2>&1' </dev/null >>/tmp/vite.log 2>&1` ; verify with `curl --noproxy '*' http://localhost:5173/kingofthehill/`. Same for `vite preview --port 4174`.
- `vite preview` with `base` must be hit at `/kingofthehill/` — `page.goto('/?seed=x')` is **wrong** (goes to `/`), use `page.goto('./?seed=x')`.
- Kill: `pkill -f "vite preview"` or `pkill -f vite`; preview logs in `/tmp/vite-*.log`.

## 3. Build / Deploy
- `vite.config.js`: `base '/kingofthehill/'`, `outDir 'dist'` (NOT `docs`), `define` injects `__APP_VERSION__` (from package.json version), `__COMMIT_HASH__` (`git rev-parse --short HEAD`), `__BUILD_TIME__` (ISO). Hardcoded fallback `1.0.0` if define fails. Verify with `grep -a -c version-marker dist/assets/*.js` (1) and `1.0.0`.
- Build: `no_proxy="*" NO_PROXY="*" npm run build` → `dist/index.html` 0.6kB + `dist/assets/index-*.js` ~348kB + css.
- Deploy: `rm -rf node_modules/.cache/gh-pages; env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY npx gh-pages -d dist` → `gh-pages` branch root. **Do not use `docs`**. Live `https://azndervish.github.io/kingofthehill/` CDN `max-age=600` — `raw.githubusercontent` may lag. `curl -s https://raw.githubusercontent.com/azndervish/kingofthehill/gh-pages/index.html | grep index-` to confirm.
- Local `dist` is gitignored; `gh-pages` history is separate. `git push origin main` for source, then `gh-pages -d dist` for site.

## 4. Engine Details
- Seeded RNG: `src/engine/engine.js` exports `hashSeed`, `mulberry32`, `seededRandom`, `setSeed/getSeed/resetSeed/_random`. `roll`/`shuffle` use `seededRandom` else `Math.random`. Supports numeric or string seed (`hashSeed` via `Math.imul(31,h)+charCode`). Deterministic: `seed 12345` → `['3','H','$','2','1','$']` and deck order.
- Query param seed read in `App.jsx` `useEffect` via `URLSearchParams` keys `seed|randomSeed|random_seed|rngSeed|rng` → `engine.setSeed(qsSeed)`.
- Items: 33 files in `src/items/`; `engine.initializeItems()` does `ITEMS['x']=x.default||x` (ESM interop — bare `x.default` is `undefined`). Must be `||` fallback. `createGame` shuffles `Object.keys(ITEMS).filter(it!=='sweep')` into `deck`; `nextTurn` when `!isStarted` pushes `NUM_ITEMS_FOR_SALE=3` from deck to `sale`. `Items.jsx` renders `sale.concat(['sweep'])` via `props.items[it]` — if `props.items` empty, sale renders empty.
- `App.jsx` `handleStartGame` checks `if (!items.length) await initializeItems` then `createGame`+`nextTurn` with `setGameState({...startedGame, item:{...}, currentPlayer:{...}})` (spread to new ref — engine mutates in place, React needs new ref to detect `uid` change).
- Reroll: `engine.reroll(game, sub, diceToKeep)` does `newDice=roll(n - kept.length)`, `game.currentPlayer.roll = diceToKeep.concat(newDice)`, `usedRerolls++`, `uid=uid()`, returns same object (mutated). `canReroll` checks `usedRerolls < getTotalRerolls` and `diceToKeep.length !== roll.length`.
- `getTotalRerolls` adds `giantbrain` etc. `MAX_REROLLS=2` base.
- `applyRoll` → `PHASE_BUY`, `nextTurn` → next player `roll`, `usedRerolls:0`.

## 5. UI Bugs Fixed (and how to avoid regress)
- **Fa→hearts:** Added `https://fonts.googleapis.com/icon?family=Material+Icons` + Roboto in `index.html`.
- **Dice hold front-concat:** Held dice must move to `0..K-1`. `handleReroll` computes `newKeep=Array(kept.length).fill(true).concat(Array(6-kept).fill(false))`. Test `hold 2,4→0,1`.
- **Init unchecked:** `reinitDice` now `push(false)` (not `true`). Initially all dice `false` → `not.toBeChecked()`, first click checks. Previously `true` caused silent `Reroll Unchecked` keeping all.
- **Visual desync (Mui-checked):** `key={`hand_die${dieNum}`}` reused DOM; after reroll `input.checked` correct at new index but `Mui-checked` class stuck at old. Fix: `key={`hand_die${dieNum}-${die}-${isChecked?'keep':'reroll'}`}` plus keys on `FormControlLabel`/`Checkbox` (`isChecked=!!diceToKeep[dieNum]`). Tests now check both `isChecked()` and `innerHTML.includes('Mui-checked')`.
- **Items empty:** Fixed via `||` fallback above. Added `e2e/items-sale.spec.js` expecting 4 `.item-card` (3+ sweep).
- **Reroll end:** `diceRolls()` now shows `rerollsLeft = getTotalRerolls - usedRerolls`, `canReroll`, disables `Reroll Unchecked` when `!canReroll`, shows `No rerolls left` caption. `handleReroll` guards `canReroll` and after last reroll auto-applies after 350ms (`applyRoll` → `PHASE_BUY`). `handleNextTurn` resets `diceToKeep` to `reinitDice(newGame.currentPlayer)` and spreads to new ref. `componentDidUpdate` still resets on `uid` change when `usedRerolls===0` & human.
- **Turn reset:** `handleNextTurn`/`handleReroll`/`handleApplyRoll`/`handleBuy`/`hillStrategy` all spread to new object (`{...game, item:{...}, currentPlayer:{...}}`) so `uid` change is detected. Next human turn now correctly `all false` + `2 rerolls`.

## 6. Testing
- **Vitest (jsdom):** `npx vitest run` via `vite.config.test` (`environment jsdom`, `globals true`, `setupFiles ['./src/test-setup.js']` which `import '@testing-library/jest-dom'`). Need `NO_PROXY` for `collect` phase (20-40s). `fast-glob` bundled now; `setupFiles` fixes `toBeInTheDocument`. Files matched `src/**/*.test.jsx` + `*.test.js`. Current 7 files, ~37 tests. Run targeted: `NO_PROXY="*" npx vitest run src/engine/__tests__/seed.test.js src/components/__tests__/Game.test.jsx --reporter=verbose`.
- **Playwright (firefox only — chromium headless_shell missing):** `playwright.config.js` `firefox` project, `baseURL` preview `4174`. Run with `NO_PROXY="*" npx playwright test --project=firefox`. Use `page.goto('./?seed=x')` (not `/?seed`). Check `input.checked` **and** `Mui-checked` for visual sync. WebServer `reuseExistingServer:true` — start preview manually first. Screenshots to `/tmp/*.png`.
- Common pitfalls: `getByText('Reroll Unchecked')` now `Reroll Unchecked (2)` — use `/Reroll/` regex. `locator('text=Items for Sale')` matches description too — use `getByRole('heading', {name:'Items for Sale'})`.

## 7. Jenkins (from env)
- Vars: `JENKINS_URL=http://host.docker.internal:8080` (also `http://192.168.1.174:8080` in job URLs), `JENKINS_USER=admin`, `JENKINS_TOKEN=***REDACTED***` (never log plain). `env | grep -i JENKINS | sed 's/TOKEN.*=.*/TOKEN=***REDACTED***/'`.
- Verify: `curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/api/json" > /tmp/jenkins.json` (no proxy). Anonymous `curl -s "$JENKINS_URL/api/json"` → `Authentication required`. Total 23 jobs (e.g. `aws upload`, `docker logs`, `ra_ingest`, `vpn-playwright-browser`, ...). Use `python3 -c "import json; print(...)"` to list.

## 8. Git Safety
- Never `commit/push/tag/rebase/reset --hard` without explicit ask. Use `bash <skill>/scripts/workspace-recovery.sh save before-discard` before discarding. Current `main` ahead of `origin/main` previously 11 commits; now up to date. `gh-pages` branch is separate.
- `dist`, `node_modules`, `test-results`, `.DS_Store` ignored.

## 9. Quick Start for Next Session
```bash
# 1. Prev preview may still be on 4174
pkill -f "vite preview"; sleep 2
setsid -f bash -c 'no_proxy="*" NO_PROXY="*" npx vite preview --port 4174 --host 127.0.0.1 > /tmp/vite.log 2>&1' </dev/null >>/tmp/vite.log 2>&1; sleep 3
curl --noproxy '*' -s http://127.0.0.1:4174/kingofthehill/ | head

# 2. Verify items + dice
NODE_PATH=... node --input-type=module # import engine, check ITEMS sweep

# 3. Run tests
NO_PROXY="*" npx vitest run src/components/__tests__/Game.test.jsx --reporter=verbose
NO_PROXY="*" npx playwright test --project=firefox --reporter=list  # needs preview running

# 4. Build & deploy (if needed)
no_proxy="*" NO_PROXY="*" npm run build
env -u http_proxy -u https_proxy npx gh-pages -d dist
curl -s https://raw.githubusercontent.com/azndervish/kingofthehill/gh-pages/index.html | grep index-
```

## 10. Open Risks
- `execSync git rev-parse` fallback to `dev` if no git; `BUILD_TIME` ISO string; `ALL_PROXY` still blocks `gh-pages` push unless `env -u`.
- `hashSeed` simple `31*h+char` may collide; `seededRandom` global `_rng` not per-game.
- `dist` vs `docs` confusion — ensure `outDir dist`.
- CDN `max-age=600` delays live visibility.
