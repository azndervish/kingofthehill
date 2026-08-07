export default {
    name: 'Fire Blast',
    description: 'Deal 2 damage to all other players',
    cost: 3,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game.players.forEach( (p, pin)=> {
            if(pin !== playerIndex) {
                game = engineModule.damage(game, pin, 2)
            }
        });
        return game
    }
}