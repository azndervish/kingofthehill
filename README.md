# King of the Hill

A single-player "King of Tokyo" style board game with AI opponents, deployable to GitHub Pages.

## How to Play

1. Select the number of players (2-6)
2. Click "Start Game" - you'll play as the first monster
3. Each turn consists of:
   - **Roll Phase**: Roll dice and choose which to keep (up to 2 rerolls)
   - **Buy Phase**: Purchase items from the shop (optional)
   - **End Turn**: Your turn ends automatically after buying phase

## Dice Symbols

- **A** - Attack: Deal damage to opposing monsters
- **H** - Heal: Restore 1 health (only when not on the hill)
- **$** - Money: Gain 1 energy
- **1, 2, 3** - Points: Roll 3+ of the same number to score points

## Winning

First to reach **20 points** OR the **last monster standing** wins!

## The Hill

- Being on the hill earns you bonus points
- Players on the hill attack all other players
- Players not on the hill attack only those on the hill
- You can set your strategy for staying/leaving the hill

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
# Deploy the 'docs' folder to GitHub Pages
```

## Technologies

- React 16
- Material-UI v4
- Vite
- Pure JavaScript game engine (no backend)
