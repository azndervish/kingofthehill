import React, { Component } from 'react';
import './App.css';
import GameLog from './GameLog.jsx';
import GamePlayers from './GamePlayers.jsx';
import HillStrategy from './HillStrategy.jsx';
import Items from './Items.jsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button, Grid, Checkbox, FormControlLabel, Box, Icon, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import './Game.scss';
import engine from '../engine/engine.js';

const PHASE_BUY = "PHASE_BUY"
const PHASE_ROLL = "PHASE_ROLL"
const NUM_PLAYER_COLORS = 12;

const styles = {
    'loading-screen': {
        'width': '100vw',
        'height': '100vh',
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'center',
    },
};

class GameComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            diceToKeep: [],
            awaitUpdate: false,
            playerColorMap: [],
            botTimeoutId: undefined,
        }
        this.handleKeepDiceUpdate = this.handleKeepDiceUpdate.bind(this)
        this.handleReroll = this.handleReroll.bind(this)
        this.handleApplyRoll = this.handleApplyRoll.bind(this)
        this.handleNextTurn = this.handleNextTurn.bind(this)
        this.handleBuy = this.handleBuy.bind(this)
        this.handlePlayAgain = this.handlePlayAgain.bind(this)
    }

    componentDidMount() {
        const playerColorMap = this.props.game.players.map(assignColors)
        this.setState({ playerColorMap })
        
        if(this.props.game.currentPlayer) {
            this.initDiceState(this.props.game)
        }
        
        this.checkBotTurn(this.props.game)
    }

    componentDidUpdate(prevProps) {
        if(prevProps.game.uid !== this.props.game.uid) {
            if(this.props.game.currentPlayer && this.isHumanTurn(this.props.game)) {
                if(this.props.game.phase === PHASE_ROLL) {
                    // only auto-select all on new turn (usedRerolls === 0), not after a reroll
                    if(this.props.game.currentPlayer.usedRerolls === 0) {
                        this.initDiceState(this.props.game)
                    }
                }
            }
            this.checkBotTurn(this.props.game)
        }
    }

    componentWillUnmount() {
        if(this.state.botTimeoutId) {
            clearTimeout(this.state.botTimeoutId)
        }
    }

    initDiceState(game) {
        if(game.currentPlayer && game.phase === PHASE_ROLL) {
            const diceToKeep = reinitDice(game.currentPlayer)
            this.setState({ diceToKeep })
        }
    }

    checkBotTurn(game) {
        if(game.over) return
        
        if(game.currentPlayer && !this.isHumanTurn(game)) {
            if(this.state.botTimeoutId) {
                clearTimeout(this.state.botTimeoutId)
            }
            
            const timeoutId = setTimeout(() => {
                this.executeBotTurn()
            }, 1000)
            
            this.setState({ botTimeoutId: timeoutId })
        }
    }

    executeBotTurn() {
        const game = this.props.game
        if(game.over) return
        
        const botPlayer = game.players[game.currentPlayer.playerIndex]
        if(!botPlayer.bot) return
        
        if(game.phase === PHASE_ROLL) {
            this.handleApplyRoll()
        } else if(game.phase === PHASE_BUY) {
            this.handleNextTurn()
        }
    }

    isHumanTurn(game) {
        if(!game || !game.currentPlayer) return false
        const currentPlayer = game.players[game.currentPlayer.playerIndex]
        return currentPlayer && !currentPlayer.bot
    }

    render() {
        const game = this.props.game
        
        if(game.over) {
            return this.renderGameOver()
        }
        
        return (<div>
            <GameLog gameLog={game.gameLog} 
                    players={game.players}
                    playerColorMap={this.state.playerColorMap}
                    items={this.props.items}/>
            {this.diceRolls()}
            <GamePlayers game={game}
                    items={this.props.items}
                    playerColorMap={this.state.playerColorMap}/>
            <Items game={game} 
                    isMyTurn={this.isHumanTurn(game)}
                    items={this.props.items}
                    onBuy={this.handleBuy}
                    awaitUpdate={this.state.awaitUpdate}/>
            {this.hillStrategy()}
        </div>)
    }

    renderGameOver() {
        const game = this.props.game
        let winner = null
        
        const livingPlayers = game.players.filter(p => p.health > 0)
        if(livingPlayers.length === 1) {
            winner = livingPlayers[0]
        } else {
            const scoreWinners = game.players.filter(p => p.points >= 20)
            if(scoreWinners.length > 0) {
                winner = scoreWinners[0]
            }
        }
        
        return (
            <Dialog open={true} fullWidth maxWidth="sm">
                <DialogTitle>Game Over</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">
                        {winner ? `${winner.name} wins!` : 'No winners'}
                    </Typography>
                    <Box mt={2}>
                        <Typography>
                            {winner && winner.points >= 20 ? 
                                `${winner.name} reached ${winner.points} points!` :
                                winner && livingPlayers.length === 1 ?
                                `${winner.name} is the last player standing!` :
                                'All players have been eliminated.'}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={this.handlePlayAgain}>
                        Play Again
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    diceRolls() {
        const game = this.props.game
        
        if(this.isHumanTurn(game) && !game.over) {
            if(game.phase === PHASE_ROLL) {
                const currentHand = game.currentPlayer.roll.map((die, dieNum) => {
                    const isChecked = !!this.state.diceToKeep[dieNum]
                    const key = `hand_die${dieNum}-${die}-${isChecked ? 'keep' : 'reroll'}`
                    return (
                        <span className="die" key={key} onClick={() => {
                            this.handleKeepDiceUpdate(dieNum)
                        }}>
                            <FormControlLabel
                                key={`${key}-label`}
                                control={<Checkbox key={`${key}-cb`} checked={isChecked} readOnly/>}
                                label={die}
                                labelPlacement="top"
                            />
                        </span>
                    )
                })
                return (
                    <Grid container direction="column" alignItems="center">
                        <Grid item container justify="center" wrap="wrap">
                            {currentHand}
                        </Grid>
                        <Box mt="10px">
                            <Button
                                disabled={this.state.awaitUpdate} 
                                onClick={this.handleReroll}
                                variant="contained"
                                color="primary"
                                style={{'marginRight': '36px'}}
                            >
                                Reroll Unchecked
                            </Button>
                            <Button
                                disabled={this.state.awaitUpdate} 
                                onClick={this.handleApplyRoll}
                                variant="contained"
                                color="primary"
                            >
                                Keep All Dice
                            </Button>
                        </Box>
                    </Grid>
                )
            }
            else if(game.phase === PHASE_BUY) {
                const currentHand = game.currentPlayer.roll.map((die, dieNum) => {
                    const key = `hand_die${dieNum}`
                    return (<span className="dieNoCheckBox" key={key}>{die}</span>)
                })
                return (
                    <Grid container
                          direction="column"
                          alignItems="center" 
                          justify="center"
                          className="section">
                        <Typography>{currentHand}</Typography>
                        <Button variant="contained"
                                color="primary"
                                disabled={this.state.awaitUpdate}
                                onClick={this.handleNextTurn}>
                            End Turn
                        </Button>
                    </Grid>
                )
            }
        }
        else {
            return (<div/>)
        }
    }

    hillStrategy() {
        const game = this.props.game
        const humanPlayer = game.players.find(p => !p.bot)
        
        if(!humanPlayer) {
            return (<span></span>)
        }
        
        return (<HillStrategy 
                game={game}
                myPlayer={humanPlayer}
                items={this.props.items}
                onUpdateStrategy={(strategy, threshold) => {
                    const playerSub = humanPlayer.sub
                    const updatedGame = engine.updateHillStrategy(game, playerSub, strategy, threshold)
                    this.props.onGameUpdate(updatedGame)
                }}/>)
    }

    handleKeepDiceUpdate(dieNum) {
        const newState = this.state.diceToKeep.map((v, index) => {
            return (index === dieNum) ? !v : v
        })
        this.setState({ diceToKeep: newState })
    }

    handleReroll() {
        const game = this.props.game
        const humanPlayer = game.players.find(p => !p.bot)
        
        const diceToKeep = this.state.diceToKeep.reduce((acc, bool, index) => {
            if(bool) {
                acc.push(game.currentPlayer.roll[index])
            }
            return acc
        }, [])
        
        const updatedGame = engine.reroll(game, humanPlayer.sub, diceToKeep)
        // front-concat moves held dice to 0..K-1, so update UI selection to match
        const newKeep = Array(diceToKeep.length).fill(true).concat(Array(game.currentPlayer.roll.length - diceToKeep.length).fill(false))
        this.setState({ awaitUpdate: true, diceToKeep: newKeep })
        
        setTimeout(() => {
            this.props.onGameUpdate(updatedGame)
            this.setState({ awaitUpdate: false })
        }, 100)
    }

    handleApplyRoll() {
        const game = this.props.game
        const updatedGame = engine.applyRoll(game)
        this.setState({ awaitUpdate: true })
        
        setTimeout(() => {
            this.props.onGameUpdate(updatedGame)
            this.setState({ awaitUpdate: false })
        }, 100)
    }

    handleNextTurn() {
        const game = this.props.game
        const updatedGame = engine.nextTurn(game)
        this.setState({ awaitUpdate: true })
        
        setTimeout(() => {
            this.props.onGameUpdate(updatedGame)
            this.setState({ awaitUpdate: false })
        }, 100)
    }

    handleBuy(itemName) {
        const game = this.props.game
        const humanPlayer = game.players.find(p => !p.bot)
        const updatedGame = engine.buy(game, itemName, humanPlayer.sub)
        this.setState({ awaitUpdate: true })
        
        setTimeout(() => {
            this.props.onGameUpdate(updatedGame)
            this.setState({ awaitUpdate: false })
        }, 100)
    }

    handlePlayAgain() {
        this.props.onPlayAgain()
    }
}

function reinitDice(currentPlayer) {
    let diceToKeep = []
    for(let i = 0; i < currentPlayer.roll.length; i++) {
        diceToKeep.push(false)
    }
    return diceToKeep
}

function assignColors(p, pin) {
    return `playerColor${(pin % NUM_PLAYER_COLORS)}`
}

export default GameComponent
