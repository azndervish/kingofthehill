export default {
    name: 'Omnivore',
    description: 'Once each turn, you can score 1,2,3 for 2 points. You can also use these dice in other combinations',
    cost: 4,
    type: 'keep',
    applyRoll: function(game, playerIndex, engineModule) {
        const condition = ['1','2','3'].every( it => {
            return game.currentPlayer.roll.indexOf(it) !== -1
        })
        if(condition) {
            game = engineModule.score(game, playerIndex, 2)
        }
        return game
    }
}