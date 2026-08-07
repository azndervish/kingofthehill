import React from 'react';
import { Grid, Paper, Icon, Typography, Button } from '@material-ui/core';
import './Items.scss';

const PHASE_BUY = 'PHASE_BUY'
/**
 * Render a block of for sale items
 */
export default function(props) {
    const myPlayer = props.game.players.find(it => {
        return !it.bot
    });
    const saleItem = props.game.item.sale.concat(['sweep'])
    const itemsForSale = saleItem.map( (it, index) => {
        const key = `sale_time_${index}`
        const fullItem = props.items[it]
        if (!fullItem) {
            return null
        }
        const canBuy = myPlayer !== undefined ? myPlayer.money >= fullItem.cost : false

        const button = (
            props.game.phase === PHASE_BUY 
            && canBuy 
            && props.isMyTurn
            && !props.game.over
        ) ?
        (
            <Button variant="contained"
                    color="primary"
                    disabled={props.awaitUpdate}
                    onClick={() => {
                        props.onBuy(it)
                    }}>
                Buy
            </Button>
        ) : (<Icon>block</Icon>)

        const type = it === 'sweep' ? (null) : (
            <Typography className="card-content">
                Type: {fullItem.type}
            </Typography>
        );

        return (
            <Paper key={key} className="item-card">
                <Grid
                    container
                    direction="column"
                    alignItems="center"
                    justify="space-between"
                    style={{'height':'100%'}}
                >
                    <Typography className="card-title">
                        <b>{fullItem.name}</b> ({fullItem.cost})
                    </Typography>
                    <Typography className="card-content">
                        {fullItem.description}
                    </Typography>
                    {type}
                    {button}
                </Grid>
            </Paper>
        )
    });

    return (
        <div className="section">
            <h3>Items for Sale</h3>
            <Grid container justify="center">
                {itemsForSale}
            </Grid>
        </div>
    )
}
