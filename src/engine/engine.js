import gameLogTemplates from './gameLogTemplates.js'
import bot from './bot.js'
import { uid } from 'uid'

// Explicitly import all item modules
import alphamonster from '../items/alphamonster.js'
import apartmentbuilding from '../items/apartmentbuilding.js'
import commutertrain from '../items/commutertrain.js'
import completedestruction from '../items/completedestruction.js'
import cornerstore from '../items/cornerstore.js'
import deathfromabove from '../items/deathfromabove.js'
import dedicatednewsteam from '../items/dedicatednewsteam.js'
import energize from '../items/energize.js'
import energyhoarder from '../items/energyhoarder.js'
import evacuationorders from '../items/evacuationorders.js'
import evenbigger from '../items/evenbigger.js'
import extrahead from '../items/extrahead.js'
import extrahead2 from '../items/extrahead2.js'
import fireblast from '../items/fireblast.js'
import frenzy from '../items/frenzy.js'
import gasrefinery from '../items/gasrefinery.js'
import giantbrain from '../items/giantbrain.js'
import gourmet from '../items/gourmet.js'
import heal from '../items/heal.js'
import highaltitudebombing from '../items/highaltitudebombing.js'
import jetfighters from '../items/jetfighters.js'
import nationalguard from '../items/nationalguard.js'
import novabreath from '../items/novabreath.js'
import nuclearpowerplant from '../items/nuclearpowerplant.js'
import omnivore from '../items/omnivore.js'
import poisonquills from '../items/poisonquills.js'
import rootingfortheunderdog from '../items/rootingfortheunderdog.js'
import skyscraper from '../items/skyscraper.js'
import solarpowered from '../items/solarpowered.js'
import spikedtail from '../items/spikedtail.js'
import sweep from '../items/sweep.js'
import tanks from '../items/tanks.js'
import vaststorm from '../items/vaststorm.js'

const INIT_HEALTH = 10
const MAX_DICE = 6
const DICE_MAP = ['A', 'H', '$', '1', '2', '3']
const SCORE_TO_WIN = 20
const PHASE_ROLL = 'PHASE_ROLL'
const PHASE_BUY = 'PHASE_BUY'
const NUM_ITEMS_FOR_SALE = 3

const ITEMS = {}

function applyScoreBonus(baseValue, totalRolls) {
    const MIN_SCORE_ROLL = 3
    if(totalRolls >= MIN_SCORE_ROLL) {
        let scoreBonus = baseValue
        scoreBonus += (totalRolls - MIN_SCORE_ROLL)
        return scoreBonus
    }
    return 0
}

function loadItems() {
    const itemModules = import.meta.glob('./items/*.js')
    return itemModules
}

export default {
    gameLogTemplates,
    ITEMS,
    MAX_REROLLS: 2,
    PHASE_ROLL: 'PHASE_ROLL',
    PHASE_BUY: 'PHASE_BUY',
    uid,
    loadItems,
    
    async initializeItems() {
        ITEMS['alphamonster'] = alphamonster.default
        ITEMS['apartmentbuilding'] = apartmentbuilding.default
        ITEMS['commutertrain'] = commutertrain.default
        ITEMS['completedestruction'] = completedestruction.default
        ITEMS['cornerstore'] = cornerstore.default
        ITEMS['deathfromabove'] = deathfromabove.default
        ITEMS['dedicatednewsteam'] = dedicatednewsteam.default
        ITEMS['energize'] = energize.default
        ITEMS['energyhoarder'] = energyhoarder.default
        ITEMS['evacuationorders'] = evacuationorders.default
        ITEMS['evenbigger'] = evenbigger.default
        ITEMS['extrahead'] = extrahead.default
        ITEMS['extrahead2'] = extrahead2.default
        ITEMS['fireblast'] = fireblast.default
        ITEMS['frenzy'] = frenzy.default
        ITEMS['gasrefinery'] = gasrefinery.default
        ITEMS['giantbrain'] = giantbrain.default
        ITEMS['gourmet'] = gourmet.default
        ITEMS['heal'] = heal.default
        ITEMS['highaltitudebombing'] = highaltitudebombing.default
        ITEMS['jetfighters'] = jetfighters.default
        ITEMS['nationalguard'] = nationalguard.default
        ITEMS['novabreath'] = novabreath.default
        ITEMS['nuclearpowerplant'] = nuclearpowerplant.default
        ITEMS['omnivore'] = omnivore.default
        ITEMS['poisonquills'] = poisonquills.default
        ITEMS['rootingfortheunderdog'] = rootingfortheunderdog.default
        ITEMS['skyscraper'] = skyscraper.default
        ITEMS['solarpowered'] = solarpowered.default
        ITEMS['spikedtail'] = spikedtail.default
        ITEMS['sweep'] = sweep.default
        ITEMS['tanks'] = tanks.default
        ITEMS['vaststorm'] = vaststorm.default
    },
    
    createGame: function(players) {
        const playersForGame = players.map(it => {
            return this.createPlayer(it)
        })
        const shuffledDeck = this.shuffle(Object.keys(ITEMS).filter(it => {return it !== "sweep"}))
        let game = {
            players: playersForGame,
            playersOnHill: [],
            gameLog: [],
            deadPlayers: [],
            uid: uid(),
            over: false,
            hillPlayerAttacked: false,
            item: {
                deck: shuffledDeck,
                sale: [],
                discard: [],
            },
            takeAnotherTurn: false
        }
        game = this.updateHillSpots(game)
        return game
    },
    
    addPlayer: function(game, player) {
        const newPlayer = this.createPlayer(player)
        game.players.push(newPlayer)
        game = this.updateHillSpots(game)
        game.uid = uid()
        return game
    },
    
    addBot: function(game) {
        const botCounter = game.players.reduce((acc,p) => {
            return p.bot ? acc+1 : acc
        }, 0)
        const botId = `bot${botCounter}`
        const newPlayer = {
            ...this.createPlayer({name: botId, sub: botId}),
            bot: true
        }
        game.players.push(newPlayer)
        game = this.updateHillSpots(game)
        game.uid = uid()
        return game
    },
    
    updateHillSpots: function(game) {
        let maxHillSpots = 1
        const livingPlayers = game.players.filter(p => { return p.health > 0})
        if(livingPlayers.length > 4) {
            maxHillSpots = 2
        }
        game.maxHillSpots = maxHillSpots
        return game
    },
    
    createPlayer: function (player) {
        return {
            ...player,
            health: INIT_HEALTH,
            maxHealth: INIT_HEALTH,
            points: 0,
            items: [],
            hillStrategy: 'leave',
            stayThreshold: 10,
            money: 0,
        }
    },
    
    roll: function(numDice) {
        let rollResult = []
        for(let i = 0; i < numDice; i++) {
            rollResult.push(DICE_MAP[Math.floor(Math.random()*DICE_MAP.length)])
        }
        return rollResult
    },
    
    isStarted: function(game) {
        return game.currentPlayer !== undefined
    },
    
    nextTurn: function(game, playerKilledSelf) {
        if(game.over) {
            return game
        }
        if(playerKilledSelf === undefined) {
            playerKilledSelf = false
        }
        let nextPlayerName;
        let nextPlayerIndex;
        if(!this.isStarted(game)) {
            nextPlayerName = game.players[0].name
            nextPlayerIndex = 0
            for(let i = 0; i < NUM_ITEMS_FOR_SALE && i < game.item.deck.length; i++) {
                game.item.sale.push(game.item.deck[i])
            }
            game.item.deck = game.item.deck.filter((item, index) => {
                return index >= game.item.sale.length
            })
        }
        else {
            if(!playerKilledSelf) {
                game.players[game.currentPlayer.playerIndex].items.forEach(it => {
                    if(ITEMS[it].nextTurn !== undefined) {
                        game = ITEMS[it].nextTurn(game, game.currentPlayer.playerIndex, this)
                    }
                })
            }
            game.players.forEach((p, pin) => {
                p.items.forEach(it => {
                    if(ITEMS[it].nextTurnAnyPlayer !== undefined) {
                        game = ITEMS[it].nextTurnAnyPlayer(game, pin, this)
                    }
                })
            })

            if(game.takeAnotherTurn) {
                nextPlayerIndex = game.currentPlayer.playerIndex
            }
            else {
                nextPlayerIndex = (game.currentPlayer.playerIndex >= game.players.length-1) ?
                        0 : game.currentPlayer.playerIndex + 1
                while(game.players[nextPlayerIndex].health <= 0) {
                    if(nextPlayerIndex === game.currentPlayer.playerIndex) {
                        break;
                    }
                    nextPlayerIndex = (nextPlayerIndex >= game.players.length-1) ? 0 : nextPlayerIndex + 1
                }
            }
            nextPlayerName = game.players[nextPlayerIndex].name
        }
        game.currentPlayer = {
            playerIndex: nextPlayerIndex,
            roll: this.roll(this.getDiceCount(game, nextPlayerIndex)),
            usedRerolls: 0
        }
        game.gameLog.push(this.gameLogTemplates.startTurn(nextPlayerIndex, game.currentPlayer.roll))
        const isOnHill = game.playersOnHill.indexOf(nextPlayerIndex) != -1
        if(isOnHill) {
            game = this.score(game, nextPlayerIndex, 2, 'for starting on the hill')
        }

        game.phase = PHASE_ROLL
        game.takeAnotherTurn = false
        game = bot.run(game, this)
        game.uid = uid()
        return game
    },
    
    applyRoll: function(game) {
        if(game.over) {
            return game
        }
        const roll = game.currentPlayer.roll
        let currentPlayerIndex = game.currentPlayer.playerIndex
        const currentPlayerName = game.players[currentPlayerIndex].name
        const isOnHill = game.playersOnHill.indexOf(currentPlayerIndex) != -1

        const numMoney = roll.filter(it => {
            return it === '$'
        }).length
        if(numMoney > 0) {
            game = this.money(game, currentPlayerIndex, numMoney)
        }

        const numHeals = roll.filter(it => {
            return it === 'H'
        }).length
        if(!isOnHill) {
            game = this.heal(game, currentPlayerIndex, numHeals)
        }

        let scoreBonus = 0
        const numOnes = roll.filter(it => {
            return it == '1'
        }).length
        scoreBonus += applyScoreBonus(1, numOnes)
        
        const numTwos = roll.filter(it => {
            return it == '2'
        }).length
        scoreBonus += applyScoreBonus(2, numTwos)

        const numThree = roll.filter(it => {
            return it == '3'
        }).length
        scoreBonus += applyScoreBonus(3, numThree)

        this.score(game, currentPlayerIndex, scoreBonus)

        const numAttacks = roll.filter(it => {
            return it == 'A'
        }).length
        if(numAttacks > 0) {
            let playerIndicesToAttack = game.playersOnHill
            if(isOnHill) {
                playerIndicesToAttack = []
                for(let i = 0; i < game.players.length; i++) {
                    if(game.playersOnHill.indexOf(i) == -1) {
                        playerIndicesToAttack.push(i)
                    }
                }
            }
            else {
                game.hillPlayerAttacked = true
            }
            playerIndicesToAttack.forEach(playerIndex => {
                game = this.attack(game, numAttacks, currentPlayerIndex, playerIndex)
            });
        }
        currentPlayerIndex = game.currentPlayer.playerIndex
        game.players[currentPlayerIndex].items.forEach(it => {
            if(ITEMS[it].applyRoll !== undefined) {
                game = ITEMS[it].applyRoll(game, currentPlayerIndex, this)
            }
        })
        game = this.checkPlayerDeath(game)
        game.phase = PHASE_BUY
        return game
    },
    
    enterHill: function(game) {
        if(game.over) {
            return game
        }
        if(game.hillPlayerAttacked) {
            game.playersOnHill = game.playersOnHill.reduce((acc, pin) => {
                if(this.hillStrategy(game.players[pin])) {
                    acc.push(pin)
                }
                else {
                    game.gameLog.push(this.gameLogTemplates.leaveHill(pin))
                }
                return acc
            }, [])
        }
        game.hillPlayerAttacked = false

        const emptyHillSpots = game.playersOnHill.length < game.maxHillSpots
        if(emptyHillSpots && !game.playersOnHill.includes(game.currentPlayer.playerIndex)) {
            game.playersOnHill.push(game.currentPlayer.playerIndex)
            this.score(game, game.currentPlayer.playerIndex, 1, 'for entering the hill')
        }
        const tooManyPlayersOnHill = game.playersOnHill.length > game.maxHillSpots
        if(tooManyPlayersOnHill) {
            for(let i = game.maxHillSpots; i < game.playersOnHill.length; i++) {
                const pin = game.playersOnHill[i];
                game.gameLog.push(this.gameLogTemplates.leaveHill(pin))
            }
            game.playersOnHill = game.playersOnHill.filter((pin, hillIndex) => {
                return hillIndex < game.maxHillSpots
            })
        }
        game.uid = uid()
        return game
    },
    
    canReroll: function(game, playerSub, diceToKeep) {
        const playerIndex = game.players.map(p => {return p.sub}).indexOf(playerSub)
        if(playerIndex === -1
                || playerIndex !== game.currentPlayer.playerIndex
                || diceToKeep.length === game.currentPlayer.roll.length) {
            return false;
        }

        const totalRerolls = this.getTotalRerolls(game, game.currentPlayer.playerIndex)
        if(game.currentPlayer.usedRerolls >= totalRerolls) {
            return false;
        }
        const validateDiceToKeep = DICE_MAP.reduce((acc, dieValue) => {
            if(!acc) {
                return acc
            }
            let dieToKeepSum = diceToKeep.filter(d => { return d == dieValue }).length
            let currentRollSum = game.currentPlayer.roll.filter(d => { return d == dieValue }).length
            if(currentRollSum < dieToKeepSum) {
                return false
            }
            return acc
        }, true)
        if(!validateDiceToKeep) {
            return false;
        }
        return true;
    },
    
    reroll: function(game, playerSub, diceToKeep) {
        if(!this.canReroll(game, playerSub, diceToKeep)) {
            return game;
        }
        const playerIndex = game.players.map(p => {return p.sub}).indexOf(playerSub)
        const newDice = this.roll(this.getDiceCount(game, playerIndex) - diceToKeep.length);
        game.currentPlayer.roll = diceToKeep.concat(newDice);
        game.currentPlayer.usedRerolls++;
        game.gameLog.push(this.gameLogTemplates.reroll(game.currentPlayer.playerIndex, diceToKeep, newDice));
        game.uid = uid();
        return game;
    },
    
    getTotalRerolls: function(game, playerIndex) {
        return game.players[playerIndex].items.reduce((acc, it) => {
            if(ITEMS[it].getRerolls !== undefined) {
                return ITEMS[it].getRerolls(acc)
            }
            return acc
        }, this.MAX_REROLLS)
    },
    
    checkForVictory: function(game) {
        if(game.over) {
            return game
        }
        const livingPlayersIndex = game.players.reduce((acc, p, pin) => {
            if(p.health > 0) {
                acc.push(pin)
            }
            return acc
        }, [])
        if(livingPlayersIndex.length == 1) {
            game.over = true
            game.gameLog.push(this.gameLogTemplates.lastPlayerStanding(livingPlayersIndex[0]))
        }
        else if(livingPlayersIndex.length == 0) {
            game.over = true
            game.gameLog.push(this.gameLogTemplates.allPlayersDead())
        }
        const playerIndexOverScore = game.players.reduce((acc, p, pin) => {
            if(p.points >= SCORE_TO_WIN) {
                acc.push(pin)
            }
            return acc
        }, [])
        if(playerIndexOverScore.length > 0) {
            game.over = true
            playerIndexOverScore.forEach(pin => {
                game.gameLog.push(this.gameLogTemplates.wonByScore(pin))
            })
        }
        if(!game.over) {
            
            const nonBotLivingPlayers = livingPlayersIndex.reduce((acc, pin) => {
                return game.players[pin].bot ? acc : acc + 1
            }, 0)
            if(nonBotLivingPlayers === 0) {
                game.over = true
                game.gameLog.push(this.gameLogTemplates.botsWin())
            }

        }
        if(game.over) {
            game.uid = uid()
        }
        return game
    },
    
    hillStrategy: function(player) {
        const strategyName = player.hillStrategy
        if(strategyName === 'stay') {
            return true
        }
        else if(strategyName === 'leave') {
            return false
        }
        else if(strategyName === 'stayUntil') {
            return player.health > player.stayThreshold
        }
    },
    
    updateHillStrategy: function(game, playerSub, strategy, threshold) {
        if(['stay', 'leave', 'stayUntil'].indexOf(strategy) !== -1) {
            const playerIndex = game.players.reduce((acc, p, pin) => {
                if(p.sub === playerSub) {
                    return pin
                }
                return acc
            }, undefined)
            if(playerIndex !== undefined) {
                game.players[playerIndex].hillStrategy = strategy
                if(threshold !== undefined) {
                    game.players[playerIndex].stayThreshold = threshold
                }
            }
        }
        return game
    },
    
    shuffle: function(list) {
        for(let index = 0; index < list.length; index++) {
            const randomIndex = Math.floor(Math.random()*(list.length-index))+index
            const currentItem = list[index]
            list[index] = list[randomIndex]
            list[randomIndex] = currentItem
        }
        return list
    },
    
    canBuy: function(game, itemName, playerSub) {
        if(!this.isStarted(game)) {
            return false
        }

        const currentPlayer = game.players[game.currentPlayer.playerIndex]
        if(game.phase !== PHASE_BUY
                || (game.item.sale.indexOf(itemName) === -1 && itemName !== 'sweep')
                || currentPlayer.sub !== playerSub
                || ITEMS[itemName].cost > currentPlayer.money) {
            return false
        }
        return true
    },
    
    buy: function(game, itemName, playerSub) {
        if(!this.canBuy(game, itemName, playerSub)) {
            return game
        }
        const currentPlayer = game.players[game.currentPlayer.playerIndex]
        game.gameLog.push(this.gameLogTemplates.buy(game.currentPlayer.playerIndex, itemName))
        currentPlayer.money -= ITEMS[itemName].cost

        currentPlayer.items.forEach(it => {
            if(ITEMS[it].onBuy !== undefined) {
                game = ITEMS[it].onBuy(game, game.currentPlayer.playerIndex, this)
            }
        })

        if(ITEMS[itemName].type === 'discard') {
            game = ITEMS[itemName].discard(game, game.currentPlayer.playerIndex, this)
            if(itemName !== 'sweep') {
                game.item.discard.push(itemName)
            }
        }
        else {
            currentPlayer.items.push(itemName)
            if(ITEMS[itemName].onEquip !== undefined) {
                game = ITEMS[itemName].onEquip(game, game.currentPlayer.playerIndex, this)
            }
        }

        game.item.sale = game.item.sale.filter(saleItemName => {
            return saleItemName !== itemName
        })


        while(game.item.sale.length < NUM_ITEMS_FOR_SALE
                && (game.item.deck.length + game.item.discard.length) > 0) {
            if(game.item.deck.length === 0 && game.item.discard.length > 0) {
                game.item.deck = this.shuffle(game.item.discard)
                game.item.discard = []
            }
            game.item.sale.push(game.item.deck[0])
            game.item.deck = game.item.deck.filter((it, index) => {
                return index > 0
            })
        }

        game.players[game.currentPlayer.playerIndex] = currentPlayer
        const playerKilledSelf = currentPlayer.health <= 0
        game = this.checkPlayerDeath(game)
        if(playerKilledSelf && !game.over) {
            game.takeAnotherTurn = false
            game = this.nextTurn(game, playerKilledSelf)
        }
        game.uid = uid()
        return game
    },
    
    heal: function(game, playerIndex, numHeals) {
        if(game.deadPlayers.indexOf(playerIndex) !== -1) {
            return game
        }
        if(numHeals !== 0) {
            let currentHealth = game.players[playerIndex].health
            game.players[playerIndex].health += numHeals
            game.players[playerIndex].health =
                    (game.players[playerIndex].health > game.players[playerIndex].maxHealth) ?
                    game.players[playerIndex].maxHealth : game.players[playerIndex].health
            if(currentHealth < game.players[playerIndex].health) {
                game.gameLog.push(this.gameLogTemplates.heal(playerIndex, game.players[playerIndex].health - currentHealth))
            }
        }
        return game
    },
    
    score: function(game, playerIndex, numScore, reason) {
        if(game.deadPlayers.indexOf(playerIndex) !== -1) {
            return game
        }
        if(numScore !== 0) {
            const currentPoints = game.players[playerIndex].points
            game.players[playerIndex].points += numScore
            if(game.players[playerIndex].points < 0) {
                game.players[playerIndex].points = 0
            }
            const scoreDiff = game.players[playerIndex].points - currentPoints
           if(scoreDiff !== 0) {
                game.gameLog.push(this.gameLogTemplates.score(playerIndex, scoreDiff, reason))
           }
        }
        return game
    },
    
    damage: function(game, playerIndex, damage) {
        if(game.deadPlayers.indexOf(playerIndex) !== -1) {
            return game
        }

        if(damage !== 0) {
            let currentHealth = game.players[playerIndex].health
            game.players[playerIndex].health -= damage
            if(currentHealth > game.players[playerIndex].health) {
                game.gameLog.push(this.gameLogTemplates.damage(playerIndex, currentHealth - game.players[playerIndex].health))
            }
        }
        return game
    },
    
    money: function(game, playerIndex, money) {
        if(money !== 0) {
            let currentMoney = game.players[playerIndex].money
            game.players[playerIndex].money += money
            if(game.players[playerIndex].money < 0) {
                game.players[playerIndex].money = 0
            }
            const moneyDiff = game.players[playerIndex].money - currentMoney
            if(moneyDiff !== 0) {
                game.gameLog.push(this.gameLogTemplates.money(playerIndex, moneyDiff))
            }
        }
        return game
    },
    
    getDiceCount: function(game, playerIndex) {
        const currentPlayer = game.players[playerIndex]
        return currentPlayer.items.reduce((acc, it) => {
            if(ITEMS[it].getDiceCount !== undefined) {
                acc = ITEMS[it].getDiceCount(acc)
            }
            return acc
        }, MAX_DICE)
    },
    
    attack: function(game, numAttacks, attackerPlayerIndex, targetPlayerIndex) {
        if(game.deadPlayers.indexOf(attackerPlayerIndex) !== -1
                || game.deadPlayers.indexOf(targetPlayerIndex) !== -1) {
            return game
        }

        const adjustedAttack = game.players[attackerPlayerIndex].items.reduce((acc, it) => {
            if(ITEMS[it].getAttackBonus !== undefined) {
                return ITEMS[it].getAttackBonus(acc, game)
            }
            return acc
        }, numAttacks)
        game.players[targetPlayerIndex].health -= adjustedAttack
        game.gameLog.push(this.gameLogTemplates.attack(attackerPlayerIndex, targetPlayerIndex, adjustedAttack))
        return game
    },
    
    checkPlayerDeath: function(game) {
        for(let playerIndex = game.players.length-1; playerIndex >=0; playerIndex--) {
            if(game.players[playerIndex].health <= 0 && game.deadPlayers.indexOf(playerIndex) === -1) {
                let indexToRemoveFromHill = game.playersOnHill.indexOf(playerIndex)
                if(indexToRemoveFromHill != -1) {
                    game.playersOnHill = game.playersOnHill.filter((p, pin) => {
                        return pin != indexToRemoveFromHill
                    })
                }
                game.deadPlayers.push(playerIndex)
                game.item.discard = game.item.discard.concat(game.players[playerIndex].items)
                game.players[playerIndex].items = []
                game.gameLog.push(this.gameLogTemplates.death(playerIndex))
            }
        }
        game = this.updateHillSpots(game)
        game = this.checkForVictory(game)
        return game
    }
}
