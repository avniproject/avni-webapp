import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from "@material-ui/core/styles";

const useStyle = makeStyles(theme => ({
    container: {
        width: "100%",
        display: "flex",
        backgroundColor: "white",
        color: "black",
        height:'750px'
    }
}));

export default function Header() {
    const classes = useStyle();

    return (
        <div className={classes.container}>
            <label></label>
        </div>
    );
}
