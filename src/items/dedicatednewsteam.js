export default {
    name: 'Dedicated News Team',
    description: 'Gain 1 point whenever you buy an item',
    cost: 3,
    type: 'keep',
    onBuy: function(game, playerIndex, engineModule) {
        return engineModule.score(game, playerIndex, 1)
    }
}