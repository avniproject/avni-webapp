import React, { Fragment } from "react";
import Typography from '@material-ui/core/Typography';
//import { makeStyles } from "@material-ui/core/styles";

// const useStyles = makeStyles(theme => ({
//   root: {
//     padding: theme.spacing(3, 2),
//     margin: theme.spacing(4),
//     flexGrow: 1
//   },
//   form: {
//     padding: theme.spacing(3, 3)
//   },
//   detailslable: {
//     color: "rgba(0, 0, 0, 0.54)",
//     padding: 0,
//     'font-size': "12px",
//     'font-family': "Roboto, Helvetica, Arial, sans-serif",
//     'font-weight': 400,
//     'line-height': 1,
//     'letter-spacing': "0.00938em",
//     marginBottom: 20
//   }
// }));

const Stepper = () => {
  // const classes = useStyles();
  return (
    <Fragment>
      <Typography variant="h6" gutterBottom>
        Register Individual
      </Typography>

      {/* <Typography className={classes.detailslable} variant="caption" gutterBottom>
        No Details
      </Typography> */}


      {/* <h3>Register and enroll - Mother Program</h3>
      <h3>No Details</h3>
      <h6>Stepper coming soon</h6> */}
    </Fragment>
  );
};

export default Stepper;
