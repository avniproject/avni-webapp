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

  const onTestClick=(e)=> {
    if(subject.subject.firstName === undefined){
      alert("Please enter First Name")
      e.preventDefault();   
      return false;
    }else if(subject.subject.lastName === undefined){
      alert("Please enter Last Name")
      e.preventDefault();   
      return false;      
    }else if(subject.subject.dateOfBirth === undefined){
      alert("Please enter date Of Birth")
      e.preventDefault();   
    return false;      
    }else if(subject.subject.gender.name === ""){
      alert("Please select gender")
      e.preventDefault();    
    return false;      
    }else if(subject.subject.lowestAddressLevel.title === undefined){
      alert("Please enter village name")
      e.preventDefault();   
    return false;
    }else{
      return true;
    }
    console.log("12345--->",subject.subject.firstName);
    console.log("12345--->",subject.subject.lastName);
    console.log("12345--->",subject.subject.dateOfBirth);
    console.log("12345--->",subject.subject.gender.name);
    console.log("12345--->",subject.subject.lowestAddressLevel.title);
    console.log("12345--->",subject.subject.gender);
    
}

  const classes = useStyles();
  if(props.type === "text") {
    return <Typography className={classes.topnav} variant="subtitle1" gutterBottom {...props} onClick={onTestClick}> {children} </Typography>
  }else if(children === "PREVIOUS") {
    return <Button className={classes.privbuttonStyle} type="button" variant="outlined" {...props} >{children} </Button>   
  }else {     
    return <Button className={classes.nextbuttonStyle} type="button" {...props} onClick={onTestClick}>{children}</Button>
  }
}
