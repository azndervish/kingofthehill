import log from '../log.js'('evacuationorders')
export default {
    name: 'Evacuation Orders',
    description: 'All other players lose 5 points',
    cost: 7,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game.players.map( (p, pin) => {
            if(pin !== playerIndex) {
                engineModule.score(game, pin, -5)
            }
            return game.players[pin]
        })
        return game
    }
}