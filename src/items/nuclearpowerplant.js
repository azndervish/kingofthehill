import log from '../log.js'
const logInstance = log('nuclearpowerplant')
export default {
    name: 'Nuclear Power Plant',
    description: 'Gain 2 points and heal 3 damage',
    cost: 6,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 2)
        game = engineModule.heal(game, playerIndex, 3)
        return game
    }
}