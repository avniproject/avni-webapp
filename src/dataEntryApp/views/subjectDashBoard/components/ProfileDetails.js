import React, { useEffect } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import DialogContent from "@material-ui/core/DialogContent";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Modal from "./CommonModal";
import { getPrograms } from "../../../reducers/programReducer";
import { Link, withRouter } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import { withParams } from "common/components/utils";
import NativeSelect from "@material-ui/core/NativeSelect";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { CommentDrawer } from "./comments/CommentDrawer";
import CommentIcon from "@material-ui/icons/Comment";
import { selectOrganisationConfig } from "../../../sagas/selectors";
import { get, isNil, isEmpty } from "lodash";
import Fab from "@material-ui/core/Fab";
import { ExtensionOption } from "./extension/ExtensionOption";
import { extensionScopeTypes } from "../../../../formDesigner/components/Extensions/ExtensionReducer";
import SubjectProfilePicture from "../../../components/SubjectProfilePicture";
import { getDisplayAge } from "../../../utils/AgeUtil";

const useStyles = makeStyles(theme => ({
  tableCellDetails: {
    borderBottom: "none",
    padding: "0px 21px 0px 11px",
    fontWeight: "500",
    color: "#1010101",
    fontSize: "14px"
  },
  enrollButtonStyle: {
    backgroundColor: "#f27510",
    height: "38px",
    zIndex: 1,
    boxShadow: "none",
    whiteSpace: "nowrap"
  },
  bigAvatar: {
    width: 42,
    height: 42,
    marginTop: "20px",
    marginBottom: "8px"
  },
  tableContainer: {
    marginTop: "10px"
  },
  tableView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px"
  },
  mainHeading: {
    fontSize: "20px",
    fontWeight: "500"
  },
  tableCell: {
    color: "#555555",
    fontSize: "12px",
    borderBottom: "none",
    padding: "0px 0px 0px 11px",
    fontWeight: "500"
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
  },
  error: {
    color: "red",
    padding: "3px",
    fontSize: "12px"
  },
  errorText: {
    color: "red"
  },
  commentButton: {
    margin: theme.spacing(1),
    backgroundColor: "#f27510",
    height: "38px",
    zIndex: 1,
    boxShadow: "none",
    whiteSpace: "nowrap"
  }
}));

const ProfileDetails = ({
  profileDetails,
  getPrograms,
  programs,
  subjectUuid,
  match,
  load,
  tabsStatus
}) => {
  const classes = useStyles();
  const [selectedProgram, setSelectedProgram] = React.useState("");
  const [openComment, setOpenComment] = React.useState(false);
  const [errorStatus, setError] = React.useState(false);
  const orgConfig = useSelector(selectOrganisationConfig);
  const enableComment = get(orgConfig, "settings.enableComments", false);
  const handleChange = event => {
    setSelectedProgram(event.target.value);
    setError(!event.target.value);
  };

  const handleError = isError => {
    setError(isError);
  };

  const { t } = useTranslation();

  useEffect(() => {
    getPrograms(subjectUuid);
  }, []);
  const close = () => {
    return true;
  };
  const isMultipleProgramEligible = !isNil(programs) ? programs.length > 1 : isNil(programs);

  const content = (
    <DialogContent>
      <form className={classes.form} noValidate>
        <FormControl className={classes.formControl}>
          <InputLabel
            shrink
            id="demo-simple-select-placeholder-label-label"
            className={errorStatus ? classes.errorText : ""}
          >
            {t("Program")}
          </InputLabel>

          <NativeSelect
            value={selectedProgram}
            onChange={handleChange}
            inputProps={{
              name: "selected_program",
              id: "selected_program-native-helper"
            }}
            error={errorStatus}
          >
            <option key={"emptyElement"} value="" />

            {programs
              ? programs.map((element, index) => (
                  <option key={index} value={element.name}>
                    {t(element.name)}
                  </option>
                ))
              : ""}
          </NativeSelect>
          {errorStatus ? <div className={classes.error}>Please select program to enrol.</div> : ""}
        </FormControl>
      </form>
    </DialogContent>
  );

  console.log("selectedProgram", selectedProgram);
  console.log("programs", programs);
  return (
    <div className={classes.tableView}>
      <CommentDrawer open={openComment} setOpen={setOpenComment} subjectUUID={subjectUuid} />
      <CustomizedBackdrop load={load} />
      <Typography component={"span"} className={classes.mainHeading}>
        {`${profileDetails.nameString}`}
      </Typography>
      <Grid alignItems="center" container spacing={1}>
        <Grid item container xs={4} alignItems="center">
          <Grid item>
            <SubjectProfilePicture
              allowEnlargementOnClick={false}
              firstName={profileDetails.firstName}
              profilePicture={profileDetails.profilePicture}
              subjectType={profileDetails.subjectType}
              subjectTypeName={profileDetails.subjectType.name}
              size={200}
              style={{ margin: "0px" }}
            />
          </Grid>
          <Grid item>
            <Table aria-label="caption table" className={classes.tableContainer}>
              <TableHead>
                <TableRow className={classes.tableHeader}>
                  {profileDetails.subjectType.isPerson() && (
                    <TableCell className={classes.tableCell}>{t("gender")}</TableCell>
                  )}
                  {profileDetails.subjectType.isPerson() && (
                    <TableCell className={classes.tableCell}>{t("age")}</TableCell>
                  )}
                  {profileDetails.lowestAddressLevel.titleLineage && (
                    <TableCell className={classes.tableCell}>{t("Address")}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {profileDetails.subjectType.isPerson() && (
                    <TableCell className={classes.tableCellDetails}>
                      {t(profileDetails.gender.name)}
                    </TableCell>
                  )}
                  {profileDetails.subjectType.isPerson() && (
                    <TableCell className={classes.tableCellDetails}>
                      {profileDetails.dateOfBirth
                        ? getDisplayAge(profileDetails.dateOfBirth, t)
                        : "-"}
                    </TableCell>
                  )}
                  <TableCell className={classes.tableCellDetails}>
                    {profileDetails.lowestAddressLevel.titleLineage}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
        </Grid>
        <Grid container item xs={8} align="right" direction={"column"}>
          <ExtensionOption
            subjectUUIDs={profileDetails.uuid}
            typeUUID={profileDetails.subjectType.uuid}
            typeName={profileDetails.subjectType.name}
            scopeType={extensionScopeTypes.subjectDashboard}
          />
          <Grid item>
            {enableComment && (
              <Fab
                id={"comments"}
                className={classes.commentButton}
                variant="extended"
                color="primary"
                aria-label="add"
                onClick={() => setOpenComment(true)}
              >
                <CommentIcon style={{ marginRight: 4 }} />
                {t("comments")}
              </Fab>
            )}
          </Grid>
          <Grid item>
            {tabsStatus &&
            tabsStatus.showProgramTab &&
            !profileDetails.voided &&
            isMultipleProgramEligible ? (
              <div>
                <Modal
                  content={content}
                  handleError={handleError}
                  buttonsSet={[
                    {
                      buttonType: "openButton",
                      label: t("enrolInProgram"),
                      classes: classes.enrollButtonStyle
                    },
                    {
                      buttonType: "saveButton",
                      label: t("Enrol"),
                      classes: classes.btnCustom,
                      redirectTo: `/app/subject/enrol?uuid=${subjectUuid}&programName=${selectedProgram}&formType=ProgramEnrolment&subjectTypeName=${
                        profileDetails.subjectType.name
                      }`,
                      requiredField: selectedProgram,
                      handleError: handleError
                    },
                    {
                      buttonType: "cancelButton",
                      label: t("Cancel"),
                      classes: classes.cancelBtnCustom
                    }
                  ]}
                  title={t("Enrol in program")}
                  btnHandleClose={close}
                />
              </div>
            ) : (
              !isEmpty(programs) && (
                <Link
                  to={`/app/subject/enrol?uuid=${subjectUuid}&programName=${
                    programs[0].name
                  }&formType=ProgramEnrolment&subjectTypeName=${profileDetails.subjectType.name}`}
                >
                  <Fab
                    id={programs[0].name}
                    className={classes.enrollButtonStyle}
                    variant="extended"
                    color="primary"
                    aria-label="add"
                  >
                    {t(`Enrol in ${programs[0].name}`)}
                  </Fab>
                </Link>
              )
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const mapStateToProps = state => ({
  programs: state.dataEntry.programs ? state.dataEntry.programs.programs : "",
  load: state.dataEntry.loadReducer.load,
  tabsStatus: state.dataEntry.subjectProfile.tabsStatus
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
