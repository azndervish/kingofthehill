export default {
    name: 'Complete Destruction',
    description: 'If you roll 1,2,3,H,A,$, gain 9 points in addition to the regular results',
    cost: 3,
    type: 'keep',
    applyRoll: function(game, playerIndex, engineModule) {
        const condition = ['1','2','3','H','A','$'].every( it => {
            return game.currentPlayer.roll.indexOf(it) !== -1
        })
        if(condition) {
            game = engineModule.score(game, playerIndex, 9)
        }
        return game
    }
}