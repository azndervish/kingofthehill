import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HillStrategy from '../HillStrategy.jsx'

function makeGame(over = false) {
  return { over }
}

describe('HillStrategy', () => {
  it('renders current stay strategy', () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={vi.fn()} />)
    expect(screen.getByText(/Always stay on the hill/)).toBeInTheDocument()
    expect(screen.getByText(/Hill Strategy:/)).toBeInTheDocument()
  })

  it('renders leave strategy', () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'leave', stayThreshold: 5 }
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={vi.fn()} />)
    expect(screen.getByText(/Leave at first opportunity/)).toBeInTheDocument()
  })

  it('renders stayUntil strategy with threshold', () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'stayUntil', stayThreshold: 7 }
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={vi.fn()} />)
    expect(screen.getByText(/Stay while health is above 7/)).toBeInTheDocument()
  })

  it('shows create button when game not over', () => {
    const game = makeGame(false)
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={vi.fn()} />)
    expect(screen.getByText('create')).toBeInTheDocument()
  })

  it('hides create button when game over', () => {
    const game = makeGame(true)
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={vi.fn()} />)
    expect(screen.queryByText('create')).not.toBeInTheDocument()
  })

  it('opens dialog and updates strategy', async () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    const onUpdate = vi.fn()
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={onUpdate} />)
    // open dialog
    fireEvent.click(screen.getByText('create'))
    expect(screen.getByText('Update Hill Strategy')).toBeInTheDocument()
    expect(screen.getByText('Always stay on the hill')).toBeInTheDocument()
    // click stay
    fireEvent.click(screen.getByText('Always stay on the hill'))
    expect(onUpdate).toHaveBeenCalledWith('stay', undefined)
  })

  it('handles stayUntil with threshold', async () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    const onUpdate = vi.fn()
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={onUpdate} />)
    fireEvent.click(screen.getByText('create'))
    // threshold default 5
    expect(screen.getByText('Stay while health is above 5')).toBeInTheDocument()
    // increase threshold
    fireEvent.click(screen.getByText('add'))
    expect(screen.getByText('Stay while health is above 6')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Stay while health is above 6'))
    expect(onUpdate).toHaveBeenCalledWith('stayUntil', 6)
  })

  it('cancel does not call update', () => {
    const game = makeGame()
    const myPlayer = { hillStrategy: 'stay', stayThreshold: 5 }
    const onUpdate = vi.fn()
    render(<HillStrategy game={game} myPlayer={myPlayer} onUpdateStrategy={onUpdate} />)
    fireEvent.click(screen.getByText('create'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
