import React from "react";
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
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  tableCell: {
    borderBottom: "none",
    padding: "0px 0px 0px 16px"
  },
  enrollButtonStyle: {
    backgroundColor: "#fc9153",
    height: "38px",
    zIndex: 1
  },
  bigAvatar: {
    width: 42,
    height: 42
  },
  tableView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mainHeading: {
    fontSize: "20px"
  },
  tableHeader: {
    color: "#555555",
    fontSize: "12px",
    fontFamily: "Roboto Reg"
  }
}));

const ProfileDetails = ({ profileDetails }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.tableView}>
      <Typography component={"span"} className={classes.mainHeading}>
        {`${profileDetails.firstName} ${profileDetails.lastName}`} {t("Dashboard")}
      </Typography>
      <Grid justify="center" alignItems="center" container spacing={2}>
        <Grid item>
          <Avatar
            src="https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-512.png"
            className={classes.bigAvatar}
          />
        </Grid>
        <Grid item xs={5}>
          <Table aria-label="caption table">
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell className={classes.tableCell}>{t("name")}</TableCell>
                <TableCell className={classes.tableCell}>{t("gender")}</TableCell>
                <TableCell className={classes.tableCell}>{t("Age")}</TableCell>
                <TableCell className={classes.tableCell}>{t("Village")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className={classes.tableCell}>{`${profileDetails.firstName} ${
                  profileDetails.lastName
                }`}</TableCell>
                <TableCell className={classes.tableCell}>{t(profileDetails.gender)}</TableCell>
                <TableCell className={classes.tableCell}>
                  {new Date().getFullYear() -
                    new Date(profileDetails.dateOfBirth).getFullYear() +
                    `${t("year")}`}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {profileDetails.lowestAddressLevel}
                </TableCell>
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
            {t("enrolInProgram")}
          </Fab>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProfileDetails;
