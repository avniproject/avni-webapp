import React from "react";
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
  privbuttonStyle: {    
    color: 'orange',
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor:"pointer",
    'border-radius': 50,
    padding:"4px 25px",
    backgroundColor: "white"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: 'white',
    height: 30,
    fontSize: 12,
    width: 110,
    cursor:"pointer",
    'border-radius': 50,
    padding:"4px 25px"
  },  
  topnav: {
    color: "orange",
    fontSize: "12px",
    cursor:"pointer"
  }
}));

export default ({ children, ...props }) => {
  let subject = props.formdata;
  const classes = useStyles();
  if(props.type === "text") {
    return <Typography className={classes.topnav} variant="subtitle1" gutterBottom {...props}> {children} </Typography>
  }else if(children === "PREVIOUS") {
    return <Button className={classes.privbuttonStyle} type="button" variant="outlined" {...props} >{children} </Button>   
  }else {     
    return <Button className={classes.nextbuttonStyle} type="button" {...props}>{children}</Button>
  }
}
