export default {
    name: 'Spiked Tail',
    description: 'When you attacks, deal 1 extra damage',
    cost: 5,
    type: 'keep',
    getAttackBonus: function(numAttacks) {
        if(numAttacks > 0) {
            return numAttacks + 1
        }
        return numAttacks
    }
}