import React, { useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Modal from "./CommonModal";
import programs from "./programsJson";
import { getPrograms } from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";

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
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#fc9153",
    height: "30px"
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    //width: 'fit-content',
    minWidth: "450px",
    minHeight: "170px"
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
    width: "211px"
  },
  formControlLabel: {
    marginTop: theme.spacing(1)
  },
  selectEmpty: {
    width: "211px"
  },
  btnBottom: {
    margin: 0,
    padding: "11px",
    backgroundColor: "#F8F9F9",
    float: "left",
    display: "inline"
  }
}));

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: "black",
    padding: "6px 16px",
    color: "white"
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: "0px",
    color: "white"
  }
});

const ProfileDetails = ({ profileDetails, getPrograms, programs, match }) => {
  const classes = useStyles();
  const [age, setAge] = React.useState("");

  const handleChange = event => {
    setAge(event.target.value);
  };

  const { t } = useTranslation();
  console.log(programs);

  useEffect(() => {
    debugger;
    console.log("use effect...");
    getPrograms();
  }, []);

  const content = (
    <DialogContent>
      <form className={classes.form} noValidate>
        <FormControl className={classes.formControl}>
          <InputLabel shrink id="demo-simple-select-placeholder-label-label">
            Program
          </InputLabel>
          <Select
            labelId="demo-simple-select-placeholder-label-label"
            id="demo-simple-select-placeholder-label"
            value={age}
            onChange={handleChange}
            displayEmpty
            className={classes.selectEmpty}
          >
            <MenuItem value={10}>Child</MenuItem>
            <MenuItem value={20}>Pregnancy</MenuItem>
            <MenuItem value={30}>Abortion</MenuItem>
            <MenuItem value={30}>Diabetis</MenuItem>
          </Select>
        </FormControl>
      </form>
    </DialogContent>
  );

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
          <div onClick={getPrograms}>
            <Modal
              content={content}
              buttonsSet={[
                {
                  buttonType: "openButton",
                  label: t("enrolInProgram"),
                  classes: classes.enrollButtonStyle
                },
                { buttonType: "saveButton", label: t("Enrol"), classes: classes.btnCustom },
                { buttonType: "cancelButton", label: t("Cancel"), classes: classes.cancelBtnCustom }
              ]}
              title={t("Enrol in program")}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const mapStateToProps = state => ({
  programs: state.dataEntry.programs
});

const mapDispatchToProps = {
  getPrograms
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProfileDetails)
  )
);
