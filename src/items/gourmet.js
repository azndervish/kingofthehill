export default {
    name: 'Gourmet',
    description: 'When scoring 1,1,1, gain 2 extra points',
    cost: 4,
    type: 'keep',
    applyRoll: function(game, playerIndex, engineModule) {
        const condition = game.currentPlayer.roll.filter( it => {
            return it === '1'
        }).length >= 3
        if(condition) {
            game = engineModule.score(game, playerIndex, 2)
        }
        return game
    }
}