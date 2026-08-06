export default {
    name: 'National Guard',
    description: 'Gain 2 points and take 2 damage',
    cost: 3,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 2)
        game = engineModule.damage(game, playerIndex, 2)
        return game
    }
}