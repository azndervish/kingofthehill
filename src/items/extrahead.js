export default {
    name: 'Extra Head',
    description: 'You get 1 extra die',
    cost: 7,
    type: 'keep',
    getDiceCount: function(diceCount) {
        return diceCount + 1
    }
}