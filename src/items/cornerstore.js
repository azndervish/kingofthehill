export default {
    name: 'Corner Store',
    description: 'Gain 1 point',
    cost: 3,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        return engineModule.score(game, playerIndex, 1)
    }
}