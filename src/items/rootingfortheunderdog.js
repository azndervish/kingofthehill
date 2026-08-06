export default {
    name: 'Rooting for the Underdog',
    description: 'At the end of a turn, if you have the fewest points, gain 1 point',
    cost: 3,
    type: 'keep',
    nextTurnAnyPlayer: function(game, playerIndex, engineModule) {
        const myScore = game.players[playerIndex].points
        const condition = game.players.every(p => {
            return p.points >= myScore
        })
        if(condition) {
            return engineModule.score(game, playerIndex, 1)
        }
        return game
    }
}