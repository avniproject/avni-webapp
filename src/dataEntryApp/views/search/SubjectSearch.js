import { useEffect } from "react";
import { Paper, Typography, Grid, Button } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import SubjectSearchTable from "dataEntryApp/views/search/SubjectSearchTable";
import { useTranslation } from "react-i18next";
import { store } from "../../../common/store";
import { types } from "../../reducers/searchFilterReducer";
import { isEmpty } from "lodash";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getOrganisationConfig } from "../../reducers/metadataReducer";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "1.5rem",
  margin: "2rem 1rem",
  elevation: 2
}));

const StyledGrid = styled(Grid)({
  marginBottom: "1%",
  justifyContent: "space-between",
  alignItems: "baseline"
});

const StyledTypography = styled(Typography)({
  fontSize: "22px",
  fontWeight: "500",
  float: "left",
  paddingTop: "1%",
  paddingLeft: "4px"
});

const StyledButton = styled(Button)({
  color: "#212529"
});

const StyledCancel = styled(Cancel)({
  fontSize: "12px"
});

const SubjectSearch = ({ searchRequest, getOrganisationConfig, organisationConfigs }) => {
  useEffect(() => {
    if (!organisationConfigs) {
      getOrganisationConfig();
    }
  }, []);

  const { t } = useTranslation();
  const resetClick = () => {
    store.dispatch({ type: types.ADD_SEARCH_REQUEST, value: { includeVoided: false } });
  };

  return (
    <StyledPaper>
      <StyledGrid container direction="row">
        <StyledTypography component="span">{!isEmpty(searchRequest.subjectType) ? t("searchResults") : ""}</StyledTypography>
        <StyledButton onClick={resetClick} aria-label="add an alarm">
          <StyledCancel /> {t("resetFilter")}
        </StyledButton>
      </StyledGrid>
      <SubjectSearchTable searchRequest={searchRequest} organisationConfigs={organisationConfigs} />
    </StyledPaper>
  );
};

const mapStateToProps = state => ({
  searchRequest: state.dataEntry.searchFilterReducer.request,
  organisationConfigs: state.dataEntry.metadata.organisationConfigs
});

const mapDispatchToProps = {
  getOrganisationConfig
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
