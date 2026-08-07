import log from '../log.js'('jetfighters')
export default {
    name: 'Jet Fighters',
    description: 'Gain 5 points and take 4 damage',
    cost: 5,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 5)
        game = engineModule.damage(game, playerIndex, 4)
        return game
    }
}