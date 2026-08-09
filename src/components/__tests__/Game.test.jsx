import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Game from '../Game.jsx'
vi.mock('../GameLog.jsx', () => ({ default: () => React.createElement('div', { 'data-testid': 'gamelog' }) }))
vi.mock('../GamePlayers.jsx', () => ({ default: () => React.createElement('div', { 'data-testid': 'gameplayers' }) }))
vi.mock('../Items.jsx', () => ({ default: () => React.createElement('div', { 'data-testid': 'items' }) }))
vi.mock('../HillStrategy.jsx', () => ({ default: () => React.createElement('div', { 'data-testid': 'hillstrategy' }) }))
function makeGame() {
  return {
    uid: 'test', players: [{name:'Human',sub:'human',bot:false,health:10,maxHealth:10,points:0,money:5,items:[],hillStrategy:'stay',stayThreshold:5},{name:'Bot1',sub:'bot1',bot:true,health:10,maxHealth:10,points:0,money:5,items:[],hillStrategy:'stay',stayThreshold:5}],
    playersOnHill: [], maxHillSpots:1, gameLog:[], over:false, phase:'PHASE_ROLL', currentPlayer:{playerIndex:0,roll:['A','H','$','1','2','3'],usedRerolls:0}, item:{sale:[],deck:[],discard:[]}
  }
}
describe('Game', () => {
  it('renders', () => {
    const game = makeGame()
    render(React.createElement(Game, { game, items:{}, onGameUpdate:vi.fn(), onPlayAgain:vi.fn() }))
    expect(screen.getByTestId('gamelog')).toBeInTheDocument()
  })
  it('shows roll buttons', () => {
    const game = makeGame()
    render(React.createElement(Game, { game, items:{}, onGameUpdate:vi.fn(), onPlayAgain:vi.fn() }))
    expect(screen.getByText('Reroll Unchecked')).toBeInTheDocument()
  })
  it('moves held dice 2 and 4 to 0 and 1 after reroll', async () => {
    const game = makeGame()
    const ref = React.createRef()
    const onGameUpdate = vi.fn()
    const { container } = render(React.createElement(Game, { ref, game, items:{}, onGameUpdate, onPlayAgain:vi.fn() }))
    // initial diceToKeep is all false after mount, toggle to keep only indices 2 and 4
    const diceSpans = container.querySelectorAll('.die')
    // diceSpans[0] corresponds to roll[0]='A', etc.
    // toggle on 2,4 to keep them
    diceSpans[2].click()
    diceSpans[4].click()
    // now diceToKeep should be [F,F,T,F,T,F]
    expect(ref.current.state.diceToKeep).toEqual([false,false,true,false,true,false])
    // click reroll
    const rerollBtn = screen.getByText('Reroll Unchecked')
    rerollBtn.click()
    // immediately after handleReroll, diceToKeep should be front-concat [T,T,F,F,F,F]
    expect(ref.current.state.diceToKeep).toEqual([true,true,false,false,false,false])
    // and engine should have been called with values at 2,4 => ['$','2']
    expect(onGameUpdate).not.toHaveBeenCalled() // delayed by 100ms
    await new Promise(r => setTimeout(r, 150))
    expect(onGameUpdate).toHaveBeenCalled()
    const updatedGame = onGameUpdate.mock.calls[0][0]
    expect(updatedGame.currentPlayer.roll.slice(0,2)).toEqual(['$','2'])
    expect(updatedGame.currentPlayer.usedRerolls).toBe(1)
  })
})
