import React, {Fragment, Component} from 'react';
import {connect} from 'react-redux';
import {Confirm, crudDelete} from 'react-admin';
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
        const {basePath, crudDelete, record, resource} = this.props;
        crudDelete(`${resource}/${record.id}?disable=${this.props.disable}`, record.id, record, basePath);
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
                    title={this.props.label}
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

export default connect(undefined, {crudDelete})(withStyles(styles)(UserActionButton));
