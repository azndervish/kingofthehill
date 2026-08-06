import React, { Component } from 'react';
import {
    Paper,
    Grid,
    Typography,
    withStyles,
    Box,
    Icon
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import './GamePlayers.scss';

const styles = {
    'paper': {
        'margin': 'auto',
        'marginBottom': '20px',
    },
    'player-contents': {
        'padding': '8px',
        'maxWidth': '250px',
    },
    'empty-slot': {
        'minWidth': '110px',
        'minHeight': '70px',
        'color': '#888888',
    }
};

const StyledRating = withStyles({
    iconFilled: {
        color: '#ff6d75',
    },
    iconHover: {
        color: '#ff3d47',
    },
})(Rating);

class GamePlayersComponent extends Component {
    render() {
        return (<div className="section">
            <h3>King of the Hill</h3>
            {this.hillPlayers()}
            <h3>Everyone Else</h3>
            {this.nonHillPlayers()}
            {this.deadPlayers()}
        </div>)
    }

    hillPlayers() {
        const players = this.props.game.playersOnHill.map(pin => {
            return {player: this.props.game.players[pin], playerIndex: pin}
        })
        let unoccupiedSlots = []
        for (let i = this.props.game.playersOnHill.length; i < this.props.game.maxHillSpots; i++) {
            const unoccupiedSlotsKey = `unoccupied${i}`
            unoccupiedSlots.push((
                <Paper key={unoccupiedSlotsKey} style={styles.paper}>
                    <Grid
                        container
                        direction="column"
                        alignItems="center"
                        justify="center"
                        style={styles["empty-slot"]}
                    >
                        <Icon>block</Icon>
                        <Typography style={{'marginTop':'2px'}}>Empty</Typography>
                    </Grid>
                </Paper>
            ))
        }
        return (
            <Grid container>
                {players.map((p) => { return this.playerDetails(p.player, p.playerIndex) })}
                {unoccupiedSlots}
            </Grid>
        )
    }

    nonHillPlayers() {
        const players = this.props.game.players.reduce((acc, p, pin) => {
            if(this.props.game.playersOnHill.indexOf(pin) === -1
                    && this.props.game.players[pin].health > 0) {
                acc.push({player: p, playerIndex: pin})
            }
            return acc
        }, [])
        return (
            <Grid container wrap="wrap">
                {players.map((p) => { return this.playerDetails(p.player, p.playerIndex) })}
            </Grid>
        )
    }

    deadPlayers() {
        const players = this.props.game.players.reduce((acc, p, pin) => {
            if(this.props.game.players[pin].health <= 0) {
                acc.push({player: p, playerIndex: pin})
            }
            return acc
        }, [])
        return (
            <Grid container justify="center">
                {players.map((p) => { return this.playerDetails(p.player, p.playerIndex) })}
            </Grid>
        )
    }
    /**
     * Render player details
     * @param {Player} p 
     * @param {Number} pin - player index
     */
    playerDetails(p, pin) {
        if(p.health <= 0) {
            const str = `\u{00A0}\u{00A0}${p.name}\u{00A0}\u{00A0}`
            return (
                <div key={p.name} className={`${this.props.playerColorMap[pin]} dead`}>
                    {str}
                </div>
            )

        }

        const isCurrentPlayer = this.props.game.currentPlayer !== undefined 
                && this.props.game.players[this.props.game.currentPlayer.playerIndex] !== undefined
                && p.sub === this.props.game.players[this.props.game.currentPlayer.playerIndex].sub
        const currentPlayer = (isCurrentPlayer) ? <Icon>stars</Icon> : ''

        const items = p.items.length > 0 ? 
                p.items.map( it => {
                    const key = `${p.name}_${it}`;
                    const fullItem = this.props.items[it];

                    return (
                        <div key={key} className="item">
                            <div className="item-title">
                                <Icon>star</Icon>
                                <b>{fullItem.name}</b>
                            </div>
                            <div className="item-description">{fullItem.description}</div>
                        </div>
                    );
                })
                : (null);

        return (
            <Paper key={p.name} style={styles.paper}>
                <Grid container spacing={1} direction="column" style={styles["player-contents"]}>
                    <Grid item container alignItems="center">
                        <b className={this.props.playerColorMap[pin]}>
                            {p.name}
                        </b>
                        <Box ml={1}>
                            {currentPlayer}
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box mb={1}>
                            <StyledRating
                                name={p.name + 'health'}
                                value={p.health}
                                max={p.maxHealth}
                                getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                                icon={<Icon>favorite</Icon>}
                                className="hearts-container"
                                readOnly
                            />
                        </Box>
                    </Grid>
                    <Grid item container justify="space-between">
                        <Grid item>
                            <Typography>{`${p.points} Point${p.points !== 1 ? 's' : ''}`}</Typography>
                        </Grid>
                        <Grid item>
                            <Typography>$ {p.money}</Typography>
                        </Grid>
                    </Grid>
                    {items}
                </Grid>
            </Paper>
        )
    }
}
export default GamePlayersComponent