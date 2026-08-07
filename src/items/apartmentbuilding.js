export default {
    name: 'Apartment Building',
    description: 'Gain 3 points',
    cost: 5,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 3)
        return game
    }
}