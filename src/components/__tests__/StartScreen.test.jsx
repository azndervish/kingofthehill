import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StartScreen from '../StartScreen.jsx'
describe('StartScreen', () => {
  let onStartGame
  beforeEach(() => { onStartGame = vi.fn() })
  it('renders title', () => {
    render(<StartScreen onStartGame={onStartGame} />)
    expect(screen.getByText('King of the Hill')).toBeInTheDocument()
  })
  it('calls onStartGame', async () => {
    render(<StartScreen onStartGame={onStartGame} />)
    await userEvent.click(screen.getByRole('button', { name: /Start Game/i }))
    expect(onStartGame).toHaveBeenCalled()
  })
})
