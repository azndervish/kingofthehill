export default {
    run: function(game, engineModule) {
        if(game.currentPlayer === undefined
                || game.over
                || !game.players[game.currentPlayer.playerIndex].bot) {
            return game;
        }
        const botPlayer = game.players[game.currentPlayer.playerIndex];
        if(game.phase === engineModule.PHASE_ROLL) {
            const totalRerolls = engineModule.getTotalRerolls(game, game.currentPlayer.playerIndex);
            let counter = 0;
            while(game.currentPlayer.usedRerolls < totalRerolls && counter < 5) {
                const roll = game.currentPlayer.roll;
                const thingsToKeep = roll.filter(r => ['$', 'A'].includes(r));
                const isOnHill = game.playersOnHill.indexOf(game.currentPlayer.playerIndex) !== -1;
                const fullHealth = botPlayer.health === botPlayer.maxHealth;
                if(!isOnHill && !fullHealth) {
                    thingsToKeep.concat(roll.filter(r => r === 'H'))
                }
                counter++;
                if(thingsToKeep.length === roll.length) {
                    break;
                }
                else {
                    engineModule.reroll(game, botPlayer.sub, thingsToKeep);
                }
            }
            game = engineModule.applyRoll(game);
            game = engineModule.enterHill(game);
        }
        if(game.phase === engineModule.PHASE_BUY) {
            let buyable = game.item.sale.filter(it => engineModule.canBuy(game, it, botPlayer.sub));
            let counter = 0;
            while(buyable.length > 0 && counter < 5) {
                game = engineModule.buy(game, buyable[0], botPlayer.sub);
                buyable = game.item.sale.filter(it => engineModule.canBuy(game, it, botPlayer.sub));
                counter++;
            }
            game = engineModule.nextTurn(game);
            game = engineModule.checkForVictory(game);
        }
        return game
    }
}
