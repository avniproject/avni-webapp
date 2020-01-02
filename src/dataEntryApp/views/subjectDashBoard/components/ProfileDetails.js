import React, { Fragment } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Grid from "@material-ui/core/Grid";
import Fab from "@material-ui/core/Fab";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  
  tableCell: {
    borderBottom: "none",
    padding: "4px 40px 8px 16px"
  },
  enrollButtonStyle: {
    backgroundColor: "#fc9153"
  },
  bigAvatar: {
    width: 60,
    height: 60,
    marginLeft: theme.spacing(1)
  },
  tableView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mainHeading: {
    fontSize: "20px"
  }
}));

const ProfileDetails = ({ profileDetails }) => {
  const classes = useStyles();
  return (
    <Fragment className={classes.tableView}>
      <Typography className={classes.mainHeading}>
        {`${profileDetails.firstName} ${profileDetails.lastName}`} Dashboard
      </Typography>
      <Grid justify="center" alignItems="center" container spacing={2}>
        <Grid item xs={1}>
          <Avatar
            src="https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-512.png"
            className={classes.bigAvatar}
          />
        </Grid>
        <Grid item xs={5}>
          <Table  aria-label="caption table">
            <TableHead>
              <TableRow>
                <TableCell   className={classes.tableCell}>Name</TableCell>
                <TableCell   className={classes.tableCell}>Gender</TableCell>
                <TableCell   className={classes.tableCell}>Age</TableCell>
                <TableCell   className={classes.tableCell}>Village</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell   className={classes.tableCell}>{`${profileDetails.firstName} ${
                  profileDetails.lastName
                }`}</TableCell>
                <TableCell   className={classes.tableCell}>{profileDetails.gender}</TableCell>
                <TableCell   className={classes.tableCell}>
                  {new Date().getFullYear() -
                    new Date(profileDetails.dateOfBirth).getFullYear() +
                    " Year"}
                </TableCell>
                <TableCell   className={classes.tableCell}>{profileDetails.addressLevel}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
        <Grid item xs={6} align="right">
          <Fab
            className={classes.enrollButtonStyle}
            variant="extended"
            color="primary"
            aria-label="add"
          >
            Enroll In Program
          </Fab>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default ProfileDetails;
