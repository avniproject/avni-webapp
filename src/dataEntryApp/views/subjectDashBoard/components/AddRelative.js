import { useState, Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1, 3),
  flexGrow: 1,
  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
}));

const StyledInnerDiv = styled("div")(({ theme }) => ({
  padding: theme.spacing(2, 2),
  margin: theme.spacing(1, 1),
  height: 500
}));

const StyledMainHeading = styled(Typography)(({ theme }) => ({
  fontSize: "20px",
  fontWeight: "500",
  marginLeft: 10,
  marginBottom: 10
}));

const StyledSubHeading = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "12px",
  padding: theme.spacing(0.6, 0.6),
  margin: theme.spacing(1, 1)
}));

const StyledScheduledDateDiv = styled("div")(({ theme }) => ({
  marginBottom: 20,
  marginTop: 10
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
  color: "orange",
  width: 110,
  cursor: "pointer",
  height: 30,
  padding: "4px 25px",
  fontSize: 12,
  borderRadius: 50,
  borderColor: "orange"
}));

const StyledAddButton = styled(Button)(({ theme }) => ({
  color: "white",
  width: 110,
  cursor: "pointer",
  height: 30,
  padding: "4px 25px",
  fontSize: 12,
  borderRadius: 50,
  marginLeft: 20
}));

const StyledButtonBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#f8f4f4",
  height: 80,
  width: "100%",
  padding: 25,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start"
}));

const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: "10px"
}));

const StyledTableView = styled("div")(({ theme }) => ({
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "center"
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "#555555",
  fontSize: "12px",
  borderBottom: "none",
  padding: "0px 0px 0px 11px",
  fontWeight: "500"
}));

const StyledTableCellDetails = styled(TableCell)(({ theme }) => ({
  borderBottom: "none",
  padding: "0px 21px 0px 11px",
  fontWeight: "500",
  color: "#1010101",
  fontSize: "14px"
}));

const StyledLabelTypography = styled(Typography)(({ theme }) => ({
  width: "50%",
  color: "rgba(0, 0, 0, 0.54)"
}));

const StyledHorizontalLine = styled("hr")(({ theme }) => ({
  padding: "0px",
  marginTop: "0px",
  marginBottom: "0px",
  border: "1px solid lightgray",
  width: "100%"
}));

const StyledErrorTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginTop: theme.spacing(1.25)
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
  const history = useHistory();
  const selectedRelative = head(JSON.parse(sessionStorage.getItem("selectedRelativeslist")));
  const [error, setError] = useState();
  const [state, setState] = useState({
    age: "",
    name: ""
  });
  const [relationData, setRelationData] = useState({
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
      nyl: true;
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
      <StyledPaper>
        <StyledInnerDiv>
          <Grid
            container
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "baseline"
            }}
          >
            <StyledMainHeading component="span">{t("addRelative")}</StyledMainHeading>
          </Grid>
          {(isEmpty(selectedRelative) || error) && (
            <div>
              <StyledScheduledDateDiv />
              <StyledScheduledDateDiv style={{ marginLeft: 10 }}>
                <FindRelative
                  setError={setError}
                  subjectProfile={subjectProfile}
                  operationalModules={operationalModules}
                  genders={genders}
                  organisationConfigs={organisationConfigs}
                  searchRequest={searchRequest}
                />
              </StyledScheduledDateDiv>
            </div>
          )}
          {!isEmpty(selectedRelative) && (
            <div key={selectedRelative.fullName}>
              <StyledScheduledDateDiv>
                <StyledSubHeading component="span">Give relationship</StyledSubHeading>
              </StyledScheduledDateDiv>
              <StyledScheduledDateDiv>
                <StyledTableView>
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      alignItems: "center"
                    }}
                  >
                    <Grid size={6}>
                      <StyledTable aria-label="caption table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell style={{ width: "25%" }}>{t("name")}</StyledTableCell>
                            <StyledTableCell style={{ width: "20%" }}>{t("gender")}</StyledTableCell>
                            <StyledTableCell style={{ width: "20%" }}>{t("age")}</StyledTableCell>
                            <StyledTableCell style={{ width: "35%" }}>{t("Village")}</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <StyledTableCellDetails key={selectedRelative.fullName}>{t(selectedRelative.fullName)}</StyledTableCellDetails>
                            <StyledTableCellDetails key={selectedRelative.gender}>{t(selectedRelative.gender)}</StyledTableCellDetails>
                            <StyledTableCellDetails key={selectedRelative.dateOfBirth}>
                              {selectedRelative.dateOfBirth
                                ? new Date().getFullYear() - new Date(selectedRelative.dateOfBirth).getFullYear() + " " + t("years")
                                : "-"}
                            </StyledTableCellDetails>
                            <StyledTableCellDetails key={selectedRelative.addressLevel}>
                              {t(selectedRelative.addressLevel)}
                            </StyledTableCellDetails>
                          </TableRow>
                        </TableBody>
                      </StyledTable>
                      <div style={{ marginLeft: 10 }}>
                        <LineBreak num={1} />
                        <StyledLabelTypography variant="body1" sx={{ mb: 1 }}>
                          Relationship
                        </StyledLabelTypography>
                        <div>
                          <FormControl style={{ width: "50%" }}>
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
                          {error && <StyledErrorTypography variant="subtitle1">{t(error)}</StyledErrorTypography>}
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </StyledTableView>
              </StyledScheduledDateDiv>
            </div>
          )}
        </StyledInnerDiv>
        <StyledButtonBox>
          <Box>
            <StyledCancelButton variant="outlined" onClick={cancelRelation}>
              CANCEL
            </StyledCancelButton>
            <StyledAddButton
              variant="contained"
              color="primary"
              onClick={addRelatives}
              disabled={isEmpty(relationData.relationshipTypeUUID) || !isEmpty(error)}
            >
              ADD
            </StyledAddButton>
          </Box>
        </StyledButtonBox>
      </StyledPaper>
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
