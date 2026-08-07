export default {
    name: 'High-Altitude Bombing',
    description: 'All players (including you) take 3 damage',
    cost: 4,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game.players.forEach( (p, pin)=> {
            game = engineModule.damage(game, pin, 3)
        });
        return game
    }
}