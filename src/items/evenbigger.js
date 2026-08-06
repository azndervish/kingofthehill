export default {
    name: 'Even Bigger',
    description: 'Your maximum health is increased by 2. Gain 2 health when you get this card',
    cost: 4,
    type: 'keep',
    onEquip: function(game, playerIndex, engineModule) {
        game.players[playerIndex].maxHealth += 2
        return engineModule.heal(game, playerIndex, 2)
    },
}
    