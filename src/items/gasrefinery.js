export default {
    name: 'Gas Refinery',
    description: 'Gain 2 points and deal 3 damage to all other players',
    cost: 6,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 2)
        game.players.forEach( (p, pin)=> {
            if(pin !== playerIndex) {
                game = engineModule.damage(game, pin, 3)
            }
        });
        return game
    }
}