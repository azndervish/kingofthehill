import log from '../log.js'('commutertrain')
export default {
    name: 'Commuter Train',
    description: 'Gain 2 points',
    cost: 4,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        return engineModule.score(game, playerIndex, 2)
    }
}