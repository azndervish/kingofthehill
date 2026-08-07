const log = require('../log')('energize')
export default {
    name: 'Energize',
    description: 'Gain $9',
    cost: 8,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        return engineModule.money(game, playerIndex, 9)
    }
}