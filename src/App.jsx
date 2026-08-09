import React, { useState, useEffect } from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { CssBaseline } from '@material-ui/core'
import { deepPurple, teal } from '@material-ui/core/colors'
import StartScreen from './components/StartScreen.jsx'
import Game from './components/Game.jsx'
import engine from './engine/engine.js'
import './components/App.css'

const theme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: teal,
    type: 'dark'
  }
})

const APP_VERSION = "1.0.0"
const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev'
const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : new Date().toISOString()

function App() {
  const [gameState, setGameState] = useState(null)
  const [items, setItems] = useState({})
  const [seed, setSeed] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const qsSeed = params.get('seed') || params.get('randomSeed') || params.get('random_seed') || params.get('rngSeed') || params.get('rng')
    if (qsSeed) {
      engine.setSeed(qsSeed)
      setSeed(qsSeed)
      console.log('Seed set from query param:', qsSeed)
    } else {
      const stored = engine.getSeed()
      if (stored) setSeed(stored)
    }
    const loadItems = async () => {
      await engine.initializeItems()
      console.log('Engine ITEMS after loading:', Object.keys(engine.ITEMS).length, 'items')
      setItems({ ...engine.ITEMS })
    }
    loadItems()
  }, [])

  const handleStartGame = async (players) => {
    if (Object.keys(items).length === 0) {
      await engine.initializeItems()
      setItems({ ...engine.ITEMS })
    }
    const game = engine.createGame(players)
    const startedGame = engine.nextTurn(game)
    setGameState({ ...startedGame, item: { ...startedGame.item }, currentPlayer: startedGame.currentPlayer ? { ...startedGame.currentPlayer } : null })
  }

  const handlePlayAgain = () => {
    setGameState(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {gameState ? (
        <Game 
          game={gameState} 
          items={items}
          onGameUpdate={setGameState}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <StartScreen onStartGame={handleStartGame} />
      )}
      <div data-testid="version-marker" style={{ position: 'fixed', bottom: 4, right: 8, fontSize: '11px', opacity: 0.7, background: 'rgba(0,0,0,0.35)', color: '#fff', padding: '2px 6px', borderRadius: 4, zIndex: 9999 }}>
        v{APP_VERSION} • {COMMIT_HASH} • {BUILD_TIME ? new Date(BUILD_TIME).toLocaleString() : ''} {seed ? `• seed:${seed}` : ''}
      </div>
    </ThemeProvider>
  )
}

export default App
