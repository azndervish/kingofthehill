export default {
    name: 'Poison Quills',
    description: 'When you score 2,2,2, your attack deals 2 extra damage',
    cost: 3,
    type: 'keep',
    getAttackBonus: function(numAttacks, game) {
        if(numAttacks > 0) {
            const condition = game.currentPlayer.roll.filter(it => {
                return it === '2'
            }).length >= 3
            if(condition) {
                return numAttacks + 2
            }
        }
        return numAttacks
    }
}