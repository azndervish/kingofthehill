export default {
    name: 'Death From Above',
    description: 'Gain 2 points and take control of the hill',
    cost: 5,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 2)
        if(game.playersOnHill.indexOf(playerIndex) !== -1) {
            return game
        }
        const emptyHillSpots = game.playersOnHill.length < game.maxHillSpots
        if(!emptyHillSpots) {
            // if there are no hill slots, remove the last person from the hill
            const removedPlayersIndex = game.playersOnHill.filter((pin, index) => {
                return index >= game.maxHillSpots - 1
            })
            removedPlayersIndex.forEach(pin => {
                game.gameLog.push(engineModule.gameLogTemplates.leaveHill(pin))
            });
            game.playersOnHill = game.playersOnHill.filter((pin, index) => {
                return index < game.maxHillSpots - 1
            })
        }
        game = engineModule.enterHill(game)
        return game
    }
}