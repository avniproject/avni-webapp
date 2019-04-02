import React, {Fragment, Component} from 'react';
import {connect} from 'react-redux';
import {Confirm, crudUpdate} from 'react-admin';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';

class UserActionButton extends Component {
    state = {
        isOpen: false,
    };

    handleClick = () => {
        this.setState({isOpen: true});
    };

    handleDialogClose = () => {
        this.setState({isOpen: false});
    };

    handleConfirm = () => {
        const {basePath, crudUpdate, record, resource} = this.props;
        //dirty hack: passing request param appended in id.
        crudUpdate(`${resource}`, `${record.id}/disable${this.props.pathParam}`, record, record, basePath, basePath);
        this.setState({isOpen: true});
    };


    render() {
        const {classes} = this.props;
        return (
            <Fragment>
                <Button onClick={this.handleClick} variant="contained" color="secondary"
                        className={classes.button}>{this.props.label}
                </Button>
                <Confirm
                    isOpen={this.state.isOpen}
                    title={`${this.props.label} #${this.props.record.id}`}
                    content={`Are you sure you want to ${this.props.label} ?`}
                    onConfirm={this.handleConfirm}
                    onClose={this.handleDialogClose}
                />
            </Fragment>
        );
    }
}

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    }
});

export default connect(undefined, {crudUpdate})(withStyles(styles)(UserActionButton));
