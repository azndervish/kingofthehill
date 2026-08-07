export default {
    name: 'Skyscraper',
    description: 'Gain 4 points',
    cost: 6,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 4)
        return game
    }
}