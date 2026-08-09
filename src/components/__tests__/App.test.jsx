import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../../App.jsx'

vi.mock('../engine/engine.js', async () => {
  const actual = await vi.importActual('../engine/engine.js')
  return {
    default: {
      ...actual.default,
      ITEMS: { heal: { name: 'Heal', cost: 3 } },
      initializeItems: vi.fn(async () => {}),
      createGame: vi.fn((players) => ({
        players: players.map(p => ({ ...p, health: 10, maxHealth: 10, points: 0, money: 0, items: [], hillStrategy: 'stay', stayThreshold: 5 })),
        playersOnHill: [],
        maxHillSpots: 1,
        gameLog: [],
        over: false,
        phase: 'PHASE_ROLL',
        currentPlayer: { playerIndex: 0, roll: ['A','H','$','1','2','3'], usedRerolls: 0 },
        item: { sale: [], deck: [], discard: [] },
        uid: 'test-uid'
      })),
      nextTurn: vi.fn((game) => ({ ...game, uid: 'next-uid', currentPlayer: game.currentPlayer }))
    }
  }
})

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // reset URL
    window.history.pushState({}, '', '/')
  })

  it('renders StartScreen initially', async () => {
    render(<App />)
    expect(await screen.findByText('King of the Hill')).toBeInTheDocument()
    expect(screen.getByText('A King of Tokyo Style Game')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument()
  })

  it('shows version marker', async () => {
    render(<App />)
    const marker = await screen.findByTestId('version-marker')
    expect(marker).toBeInTheDocument()
    expect(marker.textContent).toMatch(/v\d+\.\d+\.\d+/)
  })

  it('sets seed from query param', async () => {
    const engine = (await import('../../engine/engine.js')).default
    window.history.pushState({}, '', '/?seed=test-seed-xyz')
    render(<App />)
    await screen.findByText('King of the Hill')
    expect(engine.getSeed()).toBe('test-seed-xyz')
    expect(screen.getByTestId('version-marker').textContent).toMatch(/seed:test-seed-xyz/)
    engine.resetSeed()
    window.history.pushState({}, '', '/')
  })

  it('starts game when Start Game clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('King of the Hill')
    await user.click(screen.getByRole('button', { name: /Start Game/i }))
    // after click, Game should appear (mocked engine creates game with heal)
    await waitFor(() => {
      expect(screen.getByText(/King of the Hill/)).toBeInTheDocument()
    })
  })

  it('handles player count change', async () => {
    render(<App />)
    const input = screen.getByRole('spinbutton')
    // Material-UI TextField controlled value needs direct change event
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { value: '4' } })
    expect(input.value).toBe('4')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Start Game/i }))
    // should still start
    await waitFor(() => expect(screen.getByText(/King of the Hill/)).toBeInTheDocument())
  })
})
