export default {
    startTurn: function(playerIndex, roll) {
        return {
            template: 'startTurn',
            timestamp: this.timestamp(),
            playerIndex,
            roll,
        }
    },
    score: function(playerIndex, score, reason) {
        const template = {
            template: 'score',
            timestamp: this.timestamp(),
            playerIndex,
            score,
        }
        if(reason !== undefined) {
            template.reason = reason
        }
        return template
    },
    leaveHill: function(playerIndex) {
        return {
            template: 'leaveHill',
            timestamp: this.timestamp(),
            playerIndex
        }
    },
    reroll: function(playerIndex, diceToKeep, newDice) {
        return {
            template: 'reroll',
            timestamp: this.timestamp(),
            playerIndex,
            diceToKeep,
            newDice,
        }
    },
    lastPlayerStanding: function(playerIndex) {
        return {
            template: 'lastPlayerStanding',
            timestamp: this.timestamp(),
            playerIndex,
        }
    },
    allPlayersDead: function() {
        return {
            template: 'allPlayersDead',
            timestamp: this.timestamp(),
        }
    },
    wonByScore: function(playerIndex) {
        return {
            template: 'wonByScore',
            timestamp: this.timestamp(),
            playerIndex
        }
    },
    buy: function(playerIndex, itemName) {
        return {
            template: 'buy',
            timestamp: this.timestamp(),
            playerIndex,
            itemName,
        }
    },
    heal: function(playerIndex, healAmount) {
        return {
            template: 'heal',
            timestamp: this.timestamp(),
            playerIndex,
            healAmount,
        }
    },
    damage: function(playerIndex, damage) {
        return {
            template: 'damage',
            timestamp: this.timestamp(),
            playerIndex,
            damage,
        }
    },
    money: function(playerIndex, money) {
        return {
            template: 'money',
            timestamp: this.timestamp(),
            playerIndex,
            money,
        }
    },
    attack: function(attacker, defender, damage) {
        return {
            template: 'attack',
            timestamp: this.timestamp(),
            attacker,
            defender,
            damage,
        }
    },
    death: function(playerIndex) {
        return {
            template: 'death',
            timestamp: this.timestamp(),
            playerIndex,
        }
    },
    botsWin: function() {
        return {
            template: 'botsWin',
            timestamp: this.timestamp(),
        }
    },
    timestamp: function() {
        return new Date().toISOString()
    }
}
