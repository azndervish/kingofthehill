export default {
    name: 'Alpha Monster',
    description: 'Gain 1 point when you attack',
    cost: 5,
    type: 'keep',
    applyRoll: function(game, playerIndex, engineModule) {
        const condition = game.currentPlayer.roll.indexOf('A') !== -1
        if(condition) {
            game = engineModule.score(game, playerIndex, 1)
        }
        return game
    }
}