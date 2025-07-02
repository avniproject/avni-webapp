import React, { Fragment, useEffect } from "react";
import {
  NativeSelect,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getRelationshipTypes, saveRelationShip } from "../../../reducers/relationshipReducer";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import { useHistory, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { ModelGeneral as General } from "avni-models";
import FindRelative from "../components/FindRelative";
import { LineBreak } from "../../../../common/components/utils";
import { useTranslation } from "react-i18next";
import { find, get, head, includes, isEmpty } from "lodash";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { getGenders, getOrganisationConfig } from "../../../reducers/metadataReducer";
import { findApplicableRelations, getRelationshipType, validateRelative } from "../../../utils/RelationshipUtil";

const useStyles = makeStyles(theme => ({
  root: {
    // padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1,
    boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
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
    marginLeft: 20
  },
  buttomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  },
  tableContainer: {
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
  getRelationshipTypes,
  relationshipTypes,
  saveRelationShip,
  getSubjectProfile,
  subjectProfile,
  operationalModules,
  getGenders,
  genders,
  getOrganisationConfig,
  organisationConfigs,
  searchRequest
}) => {
  useEffect(() => {
    getSubjectProfile(match.queryParams.uuid);
    getRelationshipTypes();
    getOrganisationConfig();
    getGenders();
  }, []);

  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const selectedRelative = head(JSON.parse(sessionStorage.getItem("selectedRelativeslist")));
  const [error, setError] = React.useState();
  const [state, setState] = React.useState({
    age: "",
    name: ""
  });
  const [relationData, setRelationData] = React.useState({
    uuid: General.randomUUID(),
    relationshipTypeUUID: "",
    individualAUUID: "",
    individualBUUID: "",
    enterDateTime: new Date()
  });

  const existingRelatives = get(subjectProfile, "relationships", []);
  const applicableRelations = findApplicableRelations(relationshipTypes, selectedRelative);

  const handleChange = event => {
    const selectedRelationUUID = event.target.value;
    const relationshipType = getRelationshipType(subjectProfile, selectedRelationUUID, relationshipTypes);
    const name = event.target.name;
    setState({
      ...state,
      [name]: selectedRelationUUID
    });
    const selectedRelation = find(applicableRelations, ar => ar.uuid === selectedRelationUUID);
    const validationError = validateRelative(selectedRelative, subjectProfile, selectedRelation, existingRelatives);
    if (validationError) {
      setError(validationError);
      return;
    } else {
      setError("");
    }
    const isReverseRelation = includes(get(relationshipType, "individualAIsToBRelation.uuid", []), selectedRelationUUID);
    setRelationData({
      ...relationData,
      relationshipTypeUUID: relationshipType.uuid,
      individualAUUID: isReverseRelation ? selectedRelative.uuid : match.queryParams.uuid,
      individualBUUID: isReverseRelation ? match.queryParams.uuid : selectedRelative.uuid
    });
  };

  const addRelatives = () => {
    saveRelationShip(relationData);
    sessionStorage.removeItem("selectedRelativeslist");
    (async function fetchData() {
      await getSubjectProfile(match.queryParams.uuid);
    })();
    history.push(`/app/subject/subjectProfile?uuid=${match.queryParams.uuid}`);
  };
  const cancelRelation = () => {
    sessionStorage.removeItem("selectedRelativeslist");
    history.push(`/app/subject/subjectProfile?uuid=${match.queryParams.uuid}`);
  };

  return subjectProfile ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.innerPaper}>
          <Grid
            container
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "baseline"
            }}
          >
            <Typography component={"span"} className={classes.mainHeading}>
              {t("addRelative")}
            </Typography>
          </Grid>
          {(isEmpty(selectedRelative) || error) && (
            <div>
              <div className={classes.scheduleddateStyle} />
              <div className={classes.scheduleddateStyle} style={{ marginLeft: 10 }}>
                <FindRelative
                  setError={setError}
                  subjectProfile={subjectProfile}
                  operationalModules={operationalModules}
                  genders={genders}
                  organisationConfigs={organisationConfigs}
                  searchRequest={searchRequest}
                />
              </div>
            </div>
          )}
          {!isEmpty(selectedRelative) && (
            <div key={selectedRelative.fullName}>
              <div className={classes.scheduleddateStyle}>
                <Typography component={"span"} className={classes.subHeading}>
                  Give relationship
                </Typography>
              </div>
              <div className={classes.scheduleddateStyle}>
                <div className={classes.tableView}>
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      alignItems: "center"
                    }}
                  >
                    <Grid size={6}>
                      <Table aria-label="caption table" className={classes.tableContainer}>
                        <TableHead>
                          <TableRow className={classes.tableHeader}>
                            <TableCell className={classes.tableCell} style={{ width: "25%" }}>
                              {t("name")}
                            </TableCell>
                            <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                              {t("gender")}
                            </TableCell>
                            <TableCell className={classes.tableCell} style={{ width: "20%" }}>
                              {t("age")}
                            </TableCell>
                            <TableCell className={classes.tableCell} style={{ width: "35%" }}>
                              {t("Village")}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell key={selectedRelative.fullName} className={classes.tableCellDetails}>
                              {t(selectedRelative.fullName)}
                            </TableCell>
                            <TableCell key={selectedRelative.gender} className={classes.tableCellDetails}>
                              {t(selectedRelative.gender)}
                            </TableCell>
                            <TableCell key={selectedRelative.dateOfBirth} className={classes.tableCellDetails}>
                              {selectedRelative.dateOfBirth
                                ? new Date().getFullYear() - new Date(selectedRelative.dateOfBirth).getFullYear() + " " + `${t("years")}`
                                : "-"}
                            </TableCell>
                            <TableCell key={selectedRelative.addressLevel} className={classes.tableCellDetails}>
                              {t(selectedRelative.addressLevel)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div style={{ marginLeft: 10 }}>
                        <LineBreak num={1} />
                        <Typography variant="body1" sx={{ mb: 1 }} className={classes.lableStyle}>
                          Relationship
                        </Typography>
                        <div>
                          <div>
                            <FormControl className={classes.formControl} style={{ width: "50%" }}>
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
                                {applicableRelations.map((relation, index) => (
                                  <option key={index} value={relation.uuid}>
                                    {t(relation.name)}
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            {
                              <Typography variant="subtitle1" sx={{ color: theme => theme.palette.error.main, mt: 1.25 }}>
                                {t(error)}
                              </Typography>
                            }
                          </div>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          )}
        </div>
        <Box
          className={classes.buttomboxstyle}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start"
          }}
        >
          <Box>
            <Button variant="outlined" className={classes.cancelBtn} onClick={cancelRelation}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              className={classes.addBtn}
              color="primary"
              onClick={addRelatives}
              disabled={isEmpty(relationData.relationshipTypeUUID) || !isEmpty(error)}
            >
              ADD
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={isEmpty(subjectProfile)} />
  );
};
const mapStateToProps = state => ({
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes,
  relationshipTypes: state.dataEntry.relations.relationshipTypes,
  RelationsData: state.dataEntry.relations.relationData,
  subjects: state.dataEntry.search.subjects,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  searchRequest: state.dataEntry.searchFilterReducer.request,
  operationalModules: state.dataEntry.metadata.operationalModules,
  genders: state.dataEntry.metadata.genders,
  organisationConfigs: state.dataEntry.metadata.organisationConfigs
});
const mapDispatchToProps = {
  getRelationshipTypes,
  saveRelationShip,
  getSubjectProfile,
  getGenders,
  getOrganisationConfig
};
export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AddRelative)
  )
);
