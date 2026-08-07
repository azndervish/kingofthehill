import React, { Component } from 'react';
import { Dialog, DialogTitle, Grid, Icon, IconButton, Button, CircularProgress } from '@material-ui/core';
import './HillStrategy.scss';

const hillStrategyDescriptions = {
    'stay': () => { return 'Always stay on the hill' },
    'leave': () => { return 'Leave at first opportunity' },
    'stayUntil': (stayThreshold) => { return `Stay while health is above ${stayThreshold}` },
}

class HillStrategyDialogComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeStrategyThreshold: 5,
        }
        this.handleUpdateStrategy = this.handleUpdateStrategy.bind(this)
    }

    handleClose = () => {
        this.props.onClose();
    };

    handleUpdateStrategy = (strategy, threshold) => {
        this.props.onClose(strategy, threshold);
    };

    render() {
        const subDisabled = this.state.changeStrategyThreshold <= 1;
        const changeStrategy =
            (
            <Grid container alignItems="center" direction="column">
                <Grid container alignItems="center" justify="center" direction="column">
                    <Button variant="contained"
                            className="stay-strategy-button"
                            color="primary"
                            onClick={() => this.handleUpdateStrategy('stay')}>
                        {hillStrategyDescriptions['stay']()}
                    </Button>
                    <Button variant="contained"
                            className="leave-strategy-button"
                            color="primary"
                            onClick={() => this.handleUpdateStrategy('leave')}>
                        {hillStrategyDescriptions['leave']()}
                    </Button>
                    <Grid container alignItems="center" justify="center">
                        <Button variant="contained"
                                className="stay-until-strategy-button"
                                color="primary"
                                onClick={() => this.handleUpdateStrategy('stayUntil', this.state.changeStrategyThreshold)}>
                            {hillStrategyDescriptions['stayUntil'](this.state.changeStrategyThreshold)}
                        </Button>
                        <IconButton onClick={() => this.setState({changeStrategyThreshold: this.state.changeStrategyThreshold + 1})}>
                            <Icon>add</Icon>
                        </IconButton>
                        <IconButton disabled={subDisabled}
                                    onClick={() => this.setState({changeStrategyThreshold: this.state.changeStrategyThreshold - 1})}>
                            <Icon>remove</Icon>
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container alignItems="center" justify="flex-end">
                    <Button onClick={this.handleClose} className="cancel-button">
                        Cancel
                    </Button>
                </Grid>
            </Grid>
            )
        return (
            <Dialog onClose={this.handleClose}
                    open={this.props.open}
                    className="hill-strategy-dialog"
                    fullWidth={true}
                    maxWidth="md">
                <DialogTitle>Update Hill Strategy</DialogTitle>
                <Grid container>
                    {changeStrategy}
                </Grid>
            </Dialog>
        )
    }
}

class HillStrategyComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            changingStrategy: false,
            updatingStrategy: false,
        }
        this.handleUpdateStrategy = this.handleUpdateStrategy.bind(this)
    }

    /**
     * Render a block to make changes to the hill strategy
     */
    render() {
        const toShow = this.state.updatingStrategy ? 
            (
                <CircularProgress size="18px"
                                  className="update-progress"
                                  color="secondary">                    
                </CircularProgress>
            ) :
            hillStrategyDescriptions[this.props.myPlayer.hillStrategy](this.props.myPlayer.stayThreshold);
        const startStrategyChangeButton = this.props.game && this.props.game.over ?
            (null) :
            (
                <IconButton onClick={() => {this.setState({ changingStrategy: true })}}>
                    <Icon>create</Icon>
                </IconButton>
            )
        return (
            <div className="hill-strategy-container">
                Hill Strategy: {toShow} {startStrategyChangeButton}
                <HillStrategyDialogComponent open={this.state.changingStrategy} onClose={this.handleUpdateStrategy} />
            </div>
        )
    }

    /**
     * Update strategy for current player
     * @param {String} strategy - 'leave', 'stay', 'stayUntil'
     * @param {Number} threshold - optional. required for stayUntil
     */
    handleUpdateStrategy(strategy, threshold) {
        this.setState({ changingStrategy: false });
        if (!strategy) { return; }
        
        this.setState({ updatingStrategy: true });
        this.props.onUpdateStrategy(strategy, threshold);
        this.setState({ updatingStrategy: false });
    }
}

export default HillStrategyComponent