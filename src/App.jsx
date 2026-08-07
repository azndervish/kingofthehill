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

function App() {
  const [gameState, setGameState] = useState(null)
  const [items, setItems] = useState({})

  useEffect(() => {
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
    setGameState(startedGame)
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
    </ThemeProvider>
  )
}

export default App
