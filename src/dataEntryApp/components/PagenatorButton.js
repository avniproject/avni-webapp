import React from "react";
import { Chip, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
  privbuttonStyle: {
    //  backgroundColor:"orange",
    color: 'orange',
    width: 100,
    borderColor: "orange"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: 'white',
    width: 100
  },  
  topnav: {
    color: "orange",
    'font-size': "12px",
    cursor:"pointer"
  }
}));

export default ({ children, ...props }) => {
  const classes = useStyles();
  if(props.type === "text") {
    return <Typography className={classes.topnav} variant="subtitle1" gutterBottom {...props}> {children} </Typography>
  }else if(children === "Previous") {
    return <Chip className={classes.privbuttonStyle} type="button" variant="outlined" {...props} label={children} />    
  }else {
    return <Chip className={classes.nextbuttonStyle} type="button" variant="outlined" {...props} label={children} />  
  }
}
