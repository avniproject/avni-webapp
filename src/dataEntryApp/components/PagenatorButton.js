import React from "react";
import { Button } from "@material-ui/core";
import Chip from '@material-ui/core/Chip';
import { makeStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/styles";
const useStyles = makeStyles(theme => ({  
  privbuttonStyle:{  
  //  backgroundColor:"orange",
   color:'orange',
   width:100,
   borderColor:"orange"
  },
  nextbuttonStyle:{  
    backgroundColor:"orange",
    color:'white',
    width:100
   }
}));

export default ({ children, ...props }) => {
  const classes = useStyles();
 // console.log(children,'-------',props);
  if(children == "Previous"){
    return(
      <Chip className={classes.privbuttonStyle} type='button' variant="outlined" {...props} label={children}/> 
    );

  }else{
    return(
      <Chip className={classes.nextbuttonStyle} type='button' variant="contained" {...props} label={children}/> 
    );
  }
  
}
