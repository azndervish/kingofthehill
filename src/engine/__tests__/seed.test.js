import { describe, it, expect, vi } from 'vitest'
import engine from '../engine.js'

describe('engine seeded random', () => {
  it('produces same roll for same seed', async () => {
    await engine.initializeItems()
    engine.setSeed('test-seed-123')
    const r1 = engine.roll(6)
    engine.setSeed('test-seed-123')
    const r2 = engine.roll(6)
    expect(r1).toEqual(r2)
    expect(r1.length).toBe(6)
  })

  it('produces different rolls for different seeds', async () => {
    await engine.initializeItems()
    engine.setSeed('seed-a')
    const r1 = engine.roll(6)
    engine.setSeed('seed-b')
    const r2 = engine.roll(6)
    expect(r1).not.toEqual(r2)
  })

  it('supports numeric seed', async () => {
    await engine.initializeItems()
    engine.setSeed('12345')
    const r1 = engine.roll(6)
    engine.setSeed('12345')
    const r2 = engine.roll(6)
    expect(r1).toEqual(r2)
    engine.setSeed(12345)
    const r3 = engine.roll(6)
    expect(r1).toEqual(r3)
  })

  it('shuffle is deterministic with seed', async () => {
    await engine.initializeItems()
    engine.setSeed('shuffle-test')
    const list1 = engine.shuffle(['a','b','c','d','e'])
    engine.setSeed('shuffle-test')
    const list2 = engine.shuffle(['a','b','c','d','e'])
    expect(list1).toEqual(list2)
  })

  it('resetSeed restores randomness', async () => {
    await engine.initializeItems()
    engine.setSeed('fixed')
    const r1 = engine.roll(6)
    engine.resetSeed()
    expect(engine.getSeed()).toBeNull()
    const r2 = engine.roll(6)
    // not deterministic, but should not throw and likely different
    expect(r2.length).toBe(6)
  })

  it('getSeed returns set value', () => {
    engine.setSeed('my-seed')
    expect(engine.getSeed()).toBe('my-seed')
    engine.resetSeed()
    expect(engine.getSeed()).toBeNull()
  })

  it('createGame and nextTurn are deterministic with seed', async () => {
    await engine.initializeItems()
    engine.setSeed('game-seed')
    const g1 = engine.createGame([{name:'Human',sub:'human',bot:false},{name:'Bot1',sub:'bot1',bot:true}])
    const s1 = engine.nextTurn(g1)
    engine.setSeed('game-seed')
    const g2 = engine.createGame([{name:'Human',sub:'human',bot:false},{name:'Bot1',sub:'bot1',bot:true}])
    const s2 = engine.nextTurn(g2)
    expect(s1.currentPlayer.roll).toEqual(s2.currentPlayer.roll)
    // deck shuffle also deterministic
    expect(s1.item.deck.slice(0,3)).toEqual(s2.item.deck.slice(0,3))
  })
})
