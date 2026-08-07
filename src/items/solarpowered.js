export default {
    name: 'Solar Powered',
    description: 'At the end of your turn gain $1 if you have no money',
    cost: 2,
    type: 'keep',
    nextTurn: function(game, playerIndex, engineModule) {
        if(game.players[playerIndex].money === 0) {
            return engineModule.money(game, playerIndex, 1)
        }
        return game
    }
}