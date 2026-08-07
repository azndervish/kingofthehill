export default {
    name: 'Giant Brain',
    description: 'You have 1 extra reroll each turn',
    cost: 5,
    type: 'keep',
    getRerolls: function(rerolls) {
        return rerolls + 1
    }
}