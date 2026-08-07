export default {
    name: 'Tanks',
    description: 'Gain 4 points and take 3 damage',
    cost: 4,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 4)
        game = engineModule.damage(game, playerIndex, 3)
        return game
    }
}