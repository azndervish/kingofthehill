export default {
    name: 'Heal',
    description: 'Heal 2 damage',
    cost: 3,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.heal(game, playerIndex, 2)
        return game
    }
}