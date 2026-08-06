export default {
    name: 'Frenzy',
    description: 'Take another turn immediately after this one',
    cost: 7,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game.takeAnotherTurn = true
        return game
    }
}