export default {
    name: 'Vast Storm',
    description: 'Gain 2 points. All other players lose $1 for every $2 they have',
    cost: 6,
    type: 'discard',
    discard: function(game, playerIndex, engineModule) {
        game = engineModule.score(game, playerIndex, 2)
        game.players.forEach((p, pin) => {
            if(pin !== playerIndex && p.money > 1) {
                const deduction = -Math.floor(p.money / 2)
                game = engineModule.money(game, pin, deduction)
            }
        })
        return game
    }
}