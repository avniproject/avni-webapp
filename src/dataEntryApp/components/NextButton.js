import React from "react";
import { Button } from "@material-ui/core";
import Chip from '@material-ui/core/Chip';
import { makeStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/styles";
const useStyles = makeStyles(theme => ({  
  buttonStyle:{  
   backgroundColor:"orange",
   color:'white',
   width:100
  }
}));

export default ({ children, ...props }) => {
  const classes = useStyles();
  console.log(children,'-------',props);
  return(
  <Chip className={classes.buttonStyle} type='button' variant="contained" {...props} label={children}/> 
);
}
