export default {
    name: 'Nova Breath',
    description: 'Your attacks damage all other players',
    cost: 7,
    type: 'keep',
    applyRoll: function(game, playerIndex, engineModule) {
        const numAttacks = game.currentPlayer.roll.filter(it => {
            return it === 'A'
        }).length
        if(numAttacks > 0) {
            const isOnHill = game.playersOnHill.indexOf(playerIndex) != -1
            const additionalPlayersToAttack = isOnHill ? 
                    game.playersOnHill.filter(pin => { return pin !== playerIndex }) :
                    game.players.map((p, pin) => {
                        return pin
                    }).filter(pin => { 
                        return pin !== playerIndex && game.playersOnHill.indexOf(pin) === -1
                    }) 
            additionalPlayersToAttack.forEach(targetPlayerIndex => {
                game = engineModule.attack(game, numAttacks, playerIndex, targetPlayerIndex)
            })
        }
        return game
    }
}