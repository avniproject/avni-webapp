import React from "react";
import { Backdrop, Fade } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyle = makeStyles(theme => ({
  backdrop: {
    color: "#fff",
    zIndex: theme.zIndex.drawer + 1,
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)"
  }
}));

const CustomizedBackdrop = React.forwardRef(function Backdrop(props, ref) {
  //const { classes, className, invisible = false, open, transitionDuration, children, ...other } = props;
  const classes = useStyle();
  const open = props.load ? false : true;
  const invisible = false;
  return (
    <Fade in={open}>
      <div
        data-mui-test="Backdrop"
        className={clsx(classes.backdrop, {
          [classes.invisible]: invisible
        })}
        aria-hidden
        ref={ref}
      >
        {/* {children} */}
        <CircularProgress color="inherit" />
      </div>
    </Fade>
  );
});

export default CustomizedBackdrop;
