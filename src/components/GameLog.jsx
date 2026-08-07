import React, { Component } from 'react';
import {
    TimelineItem,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    Timeline,
    TimelineContent
} from '@material-ui/lab';
import './GameLog.scss';
import { Icon } from '@material-ui/core';

class GameLogComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    
    render() {
        if(this.props.gameLog.length > 0) {
            const gameEventsToShow = this.props.gameLog.map((gameLog, i) => {
                const key = `gameLogEvent${i}`;
                return(
                    <TimelineItem key={key}>
                        {this.stringify(gameLog)}
                    </TimelineItem>
                );
            }).reverse();

            return (
                <Timeline>
                    {gameEventsToShow}
                </Timeline>
            )
        }
        else {
            return (null)
        }
    }

    stringify(gameLogObject) {
        if(templates[gameLogObject.template] !== undefined) {
            const content = templates[gameLogObject.template](
                gameLogObject,
                this.props.players,
                this.props.playerColorMap,
                this.props.items);
            const icon = templateIcons[gameLogObject.template];

            return (
                <>
                <TimelineSeparator>
                    <TimelineDot className={this.props.playerColorMap[gameLogObject.playerIndex]}
                                 variant="outlined">
                        <Icon fontSize="small">
                            {icon}
                        </Icon>
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                    {content}
                </TimelineContent>
                </>
            )
        }
        return JSON.stringify(gameLogObject)
    }
}

const templates = {
    startTurn: (log, players, playerColorMap) => {
        return (<span>Start <b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> turn. Rolled {log.roll.join(', ')}</span>)
    },
    score: (log, players, playerColorMap) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> scored {log.score} points</span>)
    },
    leaveHill: (log, players, playerColorMap) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> left the hill</span>)
    },
    reroll: (log, players, playerColorMap) => {
        let keepStr = log.diceToKeep.length === 0 ? `rerolled all dice` : `kept ${log.diceToKeep.join(', ')}`
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> {keepStr}. Rolled {log.newDice.join(', ')}</span>)
    },
    lastPlayerStanding: (log, players, playerColorMap) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> is the last player standing</span>)
    },
    allPlayersDead: (log, players, playerColorMap) => {
        return (<span>All players died</span>)
    },
    wonByScore: (log, players, playerColorMap) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> won by score</span>)
    },
    buy: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> bought {items[log.itemName].name}</span>)
    },
    heal: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> gained {log.healAmount} health</span>)
    },
    damage: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> took {log.damage} damage</span>)
    },
    money: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> gained ${log.money}</span>)
    },
    attack: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.attacker]}>{players[log.attacker].name}</b> attacked <b className={playerColorMap[log.defender]}>{players[log.defender].name}</b> for {log.damage} damage</span>)
    },
    death: (log, players, playerColorMap, items) => {
        return (<span><b className={playerColorMap[log.playerIndex]}>{players[log.playerIndex].name}</b> died</span>)
    },
    botsWin: (log, players, playerColorMap, items) => {
        return (<span>The robots have killed all humans</span>)
    },
};

const templateIcons = {
    startTurn: "play_arrow",
    score: "add",
    leaveHill: "exit_to_app",
    reroll: "casino",
    lastPlayerStanding: "emoji_events",
    allPlayersDead: "person_remove",
    wonByScore: "emoji_events",
    buy: "shopping_cart",
    heal: "favorite",
    damage: "sick",
    money: "attach_money",
    attack: "pets",
    death: "person_remove",
    botsWin: "android",
};

export default GameLogComponent
