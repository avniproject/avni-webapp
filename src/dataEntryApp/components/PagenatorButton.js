import React from "react";
import { Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
  privbuttonStyle: {
    color: "orange",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "orange",
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px",
    backgroundColor: "white"
  },
  privbuttonDisabledStyle: {
    color: "#B3B6B7",
    width: 110,
    height: 30,
    fontSize: 12,
    borderColor: "#B3B6B7",
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px",
    backgroundColor: "#F8F9F9"
  },
  nextbuttonStyle: {
    backgroundColor: "orange",
    color: "white",
    height: 30,
    fontSize: 12,
    width: 110,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  savebuttonStyle: {
    backgroundColor: "orange",
    marginLeft: 630,
    color: "white",
    height: 30,
    fontSize: 12,
    width: 300,
    cursor: "pointer",
    "border-radius": 50,
    padding: "4px 25px"
  },
  topnav: {
    color: "orange",
    fontSize: "12px",
    cursor: "pointer"
  },
  topnavDisable: {
    color: "gray",
    fontSize: "12px",
    cursor: "pointer"
  }
}));

export default ({ children, ...props }) => {
  const classes = useStyles();
  if (props.type === "text") {
    return (
      <Typography
        className={props.isDisable ? classes.topnavDisable : classes.topnav}
        variant="overline"
        {...props}
      >
        {" "}
        {children}{" "}
      </Typography>
    );
  } else if (children === "PREVIOUS") {
    return (
      <Button
        className={props.isDisable ? classes.privbuttonDisabledStyle : classes.privbuttonStyle}
        type="button"
        variant="outlined"
        {...props}
      >
        {children}{" "}
      </Button>
    );
  } else if (children === "Save") {
    return (
      <div>
        <Button className={classes.nextbuttonStyle} type="button" {...props}>
          {children}
        </Button>
        {/* <Button className={classes.savebuttonStyle} type="button" {...props}>SAVE AND REGISTER ANOTHER INDIVIDUAL</Button> */}
      </div>
    );
  } else {
    return (
      <Button className={classes.nextbuttonStyle} type="button" {...props}>
        {children}
      </Button>
    );
  }
};
