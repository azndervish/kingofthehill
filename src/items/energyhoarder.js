export default {
    name: 'Energy hoarder',
    description: 'You gain 1 point for every $6 you have at the end of your turn',
    cost: 3,
    type: 'keep',
    nextTurn: function(game, playerIndex, engineModule) {
        const extraPoints = Math.floor(game.players[playerIndex].money / 6)
        if(extraPoints > 0) {
            return engineModule.score(game, playerIndex, extraPoints)
        }
        return game
    }
}