export default {
    name: 'Sweep',
    description: 'Discard all items for sale and draw new items',
    cost: 2,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game.item.discard = game.item.discard.concat(game.item.sale)
        game.item.sale = []
        return game
    }
}