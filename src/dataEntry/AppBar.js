import React from "react";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';

const useStyle = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
        color: 'white',
        fontSize: theme.spacing(3),
    },
    appbar: {
        height: theme.spacing(6),
        flexDirection: 'row',
        alignItems: 'center',
    }
}));

export default (props) => {
    const classes = useStyle();
    return <div className={classes.root}>
        <AppBar position="static" className={classes.appbar}>
            <Toolbar>
                <Typography variant="headline" className={classes.title}>
                    {props.title}
                </Typography>
            </Toolbar>
        </AppBar>
    </div>
}