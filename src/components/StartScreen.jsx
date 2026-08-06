import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

const MONSTER_NAMES = [
  'Godzilla', 'Mothra', 'King Ghidorah', 'Rodan', 'Mechagodzilla',
  'Gigan', 'Destoroyah', 'SpaceGodzilla', 'Biollante', 'Orga'
]

class StartScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      playerCount: 2
    }
  }

  handleChange = (e) => {
    const value = parseInt(e.target.value) || 2
    this.setState({ playerCount: Math.min(6, Math.max(2, value)) })
  }

  handleSubmit = () => {
    const { playerCount } = this.state
    const players = []
    const usedNames = new Set()
    
    const getRandomName = () => {
      const available = MONSTER_NAMES.filter(n => !usedNames.has(n))
      if (available.length === 0) return `Monster ${usedNames.size + 1}`
      const name = available[Math.floor(Math.random() * available.length)]
      usedNames.add(name)
      return name
    }
    
    players.push({
      name: getRandomName(),
      sub: 'human',
      bot: false
    })
    
    for (let i = 1; i < playerCount; i++) {
      players.push({
        name: getRandomName(),
        sub: `bot${i}`,
        bot: true
      })
    }
    
    this.props.onStartGame(players)
  }

  render() {
    return (
      <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
        <Typography variant="h2" gutterBottom>
          King of the Hill
        </Typography>
        <Typography variant="h6" style={{ marginBottom: '40px' }}>
          A King of Tokyo Style Game
        </Typography>
        
        <div style={{ marginBottom: '40px' }}>
          <TextField
            type="number"
            label="Number of Players"
            value={this.state.playerCount}
            onChange={this.handleChange}
            inputProps={{ min: 2, max: 6 }}
            style={{ width: '150px', marginBottom: '20px' }}
          />
          <Typography variant="body2" color="textSecondary">
            You + {this.state.playerCount - 1} bots
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={this.handleSubmit}
        >
          Start Game
        </Button>
      </Container>
    )
  }
}

export default StartScreen
