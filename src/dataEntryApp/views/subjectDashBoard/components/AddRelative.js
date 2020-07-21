import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@material-ui/core/NativeSelect";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getRelations, saveRelationShip } from "../../../reducers/relationshipReducer";
import { withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { ModelGeneral as General, EncounterType } from "avni-models";
import {
  Grid,
  Box,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Typography,
  Paper,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Select,
  Button
} from "@material-ui/core";
import FindRelative from "../components/FindRelative";
// import FindRelativeTable from "../components/FindRelativeTable";
import { InternalLink, LineBreak, RelativeLink } from "../../../../common/components/utils";
// import { isEqual } from "lodash";
// import moment from "moment/moment";
import { useTranslation } from "react-i18next";
// import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { Cancel } from "@material-ui/icons";
// import { blue } from "@material-ui/core/colors";

const useStyles = makeStyles(theme => ({
  root: {
    // padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1,
    boxShadow:
      "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  innerPaper: {
    padding: theme.spacing(2, 2),
    margin: theme.spacing(1, 1),
    height: 500
  },
  mainHeading: {
    fontSize: "20px",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10
  },
  subHeading: {
    fontWeight: "bold",
    fontSize: "12px",
    padding: theme.spacing(0.6, 0.6),
    margin: theme.spacing(1, 1)
  },
  scheduleddateStyle: {
    marginBottom: 20,
    marginTop: 10
  },
  // findButton: {
  //   marginLeft: "8px",
  //   color: "white",
  //   cursor: "pointer",
  //   height: 30,
  //   padding: "4px 25px",
  //   fontSize: 12,
  //   borderRadius: 50
  // },
  // visitButton: {
  //   marginLeft: "8px",
  //   fontSize: "14px"
  // },
  cancelBtn: {
    color: "orange",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    borderColor: "orange"
  },
  addBtn: {
    color: "white",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    marginRight: 20
  },
  buttomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  },
  table: {
    marginTop: "10px"
  },
  tableView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  tableCell: {
    color: "#555555",
    fontSize: "12px",
    borderBottom: "none",
    padding: "0px 0px 0px 11px",
    fontWeight: "500"
  },
  tableCellDetails: {
    borderBottom: "none",
    padding: "0px 21px 0px 11px",
    fontWeight: "500",
    color: "#1010101",
    fontSize: "14px"
  },
  lableStyle: {
    width: "50%",
    // marginBottom: 5,
    color: "rgba(0, 0, 0, 0.54)"
  },
  horizontalLine: {
    padding: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    border: "1px solid lightgray;",
    width: "100%"
  }
}));

const AddRelative = ({
  match,
  subjectTypes,
  Relations,
  getRelations,
  load,
  subjects,
  saveRelationShip,
  RelationsData
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  console.log("RelationsDatafrom store------->", RelationsData);
  let relativeLists = JSON.parse(sessionStorage.getItem("selectedRelativeslist"));
  console.log("relativeLists-------->", relativeLists);
  const profileDetails = relativeLists;
  const [selectname, setSelectname] = React.useState("");
  const duplicatuuid = General.randomUUID();
  const [state, setState] = React.useState({
    age: "",
    name: "hai"
  });
  const [relationData, setRelationData] = React.useState({
    uuid: General.randomUUID(),
    relationshipTypeUUID: "",
    individualAUUID: match.queryParams.uuid,
    individualBUUID: "",
    enterDateTime: new Date()
  });

  const handleChange = event => {
    const name = event.target.name;
    setState({
      ...state,
      [name]: event.target.value
    });
    setRelationData({
      ...relationData,
      relationshipTypeUUID: event.target.value,
      individualBUUID: profileDetails[0].uuid
    });
  };

  const addRelatives = () => {
    saveRelationShip(relationData);
    sessionStorage.removeItem("selectedRelativeslist");
    history.goBack();
  };
  const cancelRelation = () => {
    // saveRelationShip(relationData);
    sessionStorage.removeItem("selectedRelativeslist");
    history.goBack();
  };

  useEffect(() => {
    getRelations();
  }, []);
  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.innerPaper}>
          <Grid container direction="row" justify="space-between" alignItems="baseline">
            <Typography component={"span"} className={classes.mainHeading}>
              Add Relative
            </Typography>
          </Grid>

          {profileDetails !== null
            ? profileDetails.map(row => (
                <div>
                  <div className={classes.scheduleddateStyle}>
                    <Typography component={"span"} className={classes.subHeading}>
                      {/* {t("Completed")} */}
                      Give relationship
                    </Typography>
                  </div>
                  <div className={classes.scheduleddateStyle}>
                    <div className={classes.tableView}>
                      <Grid alignItems="center" container spacing={1}>
                        <Grid item xs={6}>
                          <Table aria-label="caption table" className={classes.table}>
                            <TableHead>
                              <TableRow className={classes.tableHeader}>
                                <TableCell className={classes.tableCell} style={{ width: "25%" }}>
                                  Name
                                </TableCell>
                                <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                                  {t("gender")}
                                </TableCell>
                                <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                                  {t("Age")}
                                </TableCell>{" "}
                                <TableCell className={classes.tableCell} style={{ width: "35%" }}>
                                  Village
                                  {/* {t(profileDetails.addressLevelTypeName)} */}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell className={classes.tableCellDetails}>
                                  {t(row.fullName)}
                                </TableCell>

                                <TableCell className={classes.tableCellDetails}>
                                  {t(row.gender.name)}
                                </TableCell>

                                <TableCell className={classes.tableCellDetails}>
                                  {row.dateOfBirth
                                    ? new Date().getFullYear() -
                                      new Date(row.dateOfBirth).getFullYear() +
                                      " " +
                                      `${t("years")}`
                                    : "-"}
                                </TableCell>

                                <TableCell className={classes.tableCellDetails}>
                                  {row.addressLevel.title}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <div style={{ marginLeft: 10 }}>
                            <LineBreak num={1} />

                            <Typography variant="body1" gutterBottom className={classes.lableStyle}>
                              Relationship
                            </Typography>
                            <div>
                              <div>
                                <FormControl
                                  className={classes.formControl}
                                  style={{ width: "50%" }}
                                >
                                  <InputLabel htmlFor="age-native-helper" />
                                  <NativeSelect
                                    value={state.age}
                                    onChange={handleChange}
                                    inputProps={{
                                      name: "age",
                                      id: "age-native-simple"
                                    }}
                                  >
                                    <option value="" disabled>
                                      Select relation
                                    </option>
                                    {Relations.relationships
                                      ? Relations.relationships.map(row1 =>
                                          row.gender.name ===
                                          row1.individualAIsToBRelation.gender ? (
                                            <option value={row1.uuid}>
                                              {row1.individualBIsToARelation.name}
                                            </option>
                                          ) : (
                                            ""
                                          )
                                        )
                                      : ""}
                                  </NativeSelect>
                                </FormControl>
                              </div>
                            </div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                  {/* <hr className={classes.horizontalLine} /> */}
                </div>
              ))
            : ""}

          {profileDetails === null ? (
            <div>
              <div className={classes.scheduleddateStyle}>
                <Typography component={"span"} className={classes.subHeading}>
                  {/* {t("Completed")} */}
                  Find Relative
                </Typography>
              </div>
              <div className={classes.scheduleddateStyle}>
                {/* <Button variant="contained" className={classes.findButton} color="primary">
              Find Relative
            </Button> */}
                <FindRelative subjectTypes={subjectTypes} />
                {/* {subjects.content ? (
                <FindRelative subjectTypes={subjectTypes} />
              ) : ( */}
                {/* <FindRelativeTable /> */}
                {/* // )} */}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <Box
          className={classes.buttomboxstyle}
          display="flex"
          flexDirection={"row"}
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          <Box>
            <Button
              variant="contained"
              className={classes.addBtn}
              color="primary"
              // redirectTo = {`/#/app/subject?uuid=${match.queryParams.uuid}`}
              onClick={addRelatives}
            >
              ADD
            </Button>
            <Button variant="outlined" className={classes.cancelBtn} onClick={cancelRelation}>
              CANCEL
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes,
  Relations: state.dataEntry.relations,
  RelationsData: state.dataEntry.relations.relationData,
  subjects: state.dataEntry.search.subjects
});

const mapDispatchToProps = {
  getRelations,
  saveRelationShip
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AddRelative)
  )
);
