import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@material-ui/core/NativeSelect";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getRelations, saveRelationShip } from "../../../reducers/relationshipReducer";
// import { getEncounter, getProgramEncounter } from "../../../reducers/viewVisitReducer";
import { withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { default as UUID } from "uuid";
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
// import Observations from "common/components/Observations";
import FindRelative from "../components/FindRelative";
import FindRelativeTable from "../components/FindRelativeTable";
import { InternalLink, LineBreak, RelativeLink } from "../../../../common/components/utils";
import { isEqual } from "lodash";
import moment from "moment/moment";
import { useTranslation } from "react-i18next";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { Cancel } from "@material-ui/icons";
import { blue } from "@material-ui/core/colors";

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
  findButton: {
    marginLeft: "8px",
    color: "white",
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50
  },
  visitButton: {
    marginLeft: "8px",
    fontSize: "14px"
  },
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
  // selectStyle: {
  //   width: '100%',
  //   height: '50px',
  //   'font-size': '100%',
  //   'font-weight': 'bold',
  //   cursor: 'pointer',
  //   'border-radius': 0,
  //   'background-color': '#c0392b',
  //   border: 'none',
  //   'border-bottom': '2px solid #962d22',
  //   color: 'white',
  //   padding: '10px',
  //   appearance: 'none',
  //   '-webkit-appearance': 'none',
  //   '-moz-appearance': 'none',
  //   padding: '10px'
  // }
}));

const AddRelative = ({
  match,
  subjectTypes,
  Relations,
  getRelations,
  load,
  subjects,
  saveRelationShip
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  console.log("Relations------->", Relations);
  console.log("subjectTypes------->", subjectTypes);
  console.log("subjects-------->", subjects);
  console.log("match-------->", match.queryParams.uuid);
  let relativeLists = JSON.parse(sessionStorage.getItem("selectedRelativeslist"));
  console.log("relativeLists-------->", relativeLists);
  const profileDetails = relativeLists;
  const [selectname, setSelectname] = React.useState("");
  const duplicatuuid = General.randomUUID();
  // console.log("General.randomUUID", duplicatuuid);
  // console.log("randomUUID", UUID.v4());

  const [relationData, setRelationData] = React.useState({
    uuid: General.randomUUID(),
    // uuid: '',
    relationshipTypeUUID: "",
    individualAUUID: match.queryParams.uuid,
    individualBUUID: "",
    enterDateTime: new Date()
    // exitDateTime: "",
    // exitObservations: []
  });

  //   {
  //     "enterDateTime": "2020-07-17T11:20:38.479Z",
  // "individualAUUID": "35253eab-6594-4bad-9243-ca6ef15fc054",

  // "individualBUUID": "5e5a87fb-c70d-4a50-aeac-5964f04625b2",

  // "relationshipTypeUUID": "1d9c019a-9350-44f9-9ef9-a699f0d94a13",
  // "uuid":"fc4a0802-1855-4da1-88ed-1b028edf05bf"
  // }

  const handleChange = event => {
    // console.log("handleChange event target type------->",event.target.value);
    console.log("handleChange event target type------->", event.target.value);
    console.log("handleChange event target uuidA------->", event.target.name);
    // console.log("handleChange event target uuidB------->", event.target.uuidb);
    // console.log("handleChange event target------->",event.target.value);
    // const relationshipTypeUUID = event.target.value;
    setRelationData({
      ...relationData,
      // name: event.target.name,
      relationshipTypeUUID: event.target.value,
      individualBUUID: profileDetails[0].uuid
    });
  };

  const addRelatives = () => {
    const itemuuid = UUID.v4();
    console.log("itemuuid---->", itemuuid);
    console.log("relationData----->", JSON.stringify(relationData));
    saveRelationShip(JSON.stringify(relationData));
    console.log("saveRelationShip---->", relationData);

    // uuid: UUID.v4(),
    sessionStorage.removeItem("selectedRelativeslist");
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
              {/* {t("ViewVisit")}:  */}
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
                                    value={""}
                                    onChange={handleChange}
                                    inputProps={{
                                      name: " ",
                                      id: "age-native-helper"
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
                  <hr className={classes.horizontalLine} />
                </div>
              ))
            : ""}

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
              onClick={addRelatives}
            >
              ADD
            </Button>
            <Button variant="outlined" className={classes.cancelBtn} onClick={history.goBack}>
              CANCEL
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  // encounter: state.dataEntry.viewVisitReducer.encounter,
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes,
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects
  // load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  getRelations,
  saveRelationShip
  // getEncounter,
  // getProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AddRelative)
  )
);
