import { useEffect, useState } from "react";
import { Paper, Typography, Grid, Button, styled } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import SubjectSearchTable from "dataEntryApp/views/search/SubjectSearchTable";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  types,
  clearSavedSearchRequest,
  saveSearchRequest,
  searchRequestAfterReset
} from "../../reducers/searchFilterReducer";
import { get, isEmpty, isNil } from "lodash";
import { getOrganisationConfig, selectSubjectTypes } from "../../reducers/metadataReducer";

const StyledPaper = styled(Paper)({
  padding: "1.5rem",
  margin: "2rem 1rem",
  elevation: 2
});

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

const SubjectSearch = () => {
  const dispatch = useDispatch();
  const searchRequest = useSelector(
    state => state.dataEntry.searchFilterReducer.request
  );
  const organisationConfigs = useSelector(
    state => state.dataEntry.metadata.organisationConfigs
  );
  const organisationConfigsFailed = useSelector(
    state => state.dataEntry.metadata.organisationConfigsFailed
  );

  useEffect(() => {
    if (!organisationConfigs) {
      dispatch(getOrganisationConfig());
    }
  }, [dispatch, organisationConfigs]);

  const { t } = useTranslation();
  const [resetCount, setResetCount] = useState(0);
  const subjectTypes = useSelector(selectSubjectTypes);
  const username = useSelector(state => get(state, "app.userInfo.username"));
  const resetClick = () => {
    const requestAfterReset = searchRequestAfterReset(searchRequest, subjectTypes);
    if (isNil(requestAfterReset)) clearSavedSearchRequest();
    else saveSearchRequest(requestAfterReset, username);
    setResetCount(count => count + 1);
    dispatch({
      type: types.ADD_SEARCH_REQUEST,
      value: requestAfterReset ?? { includeVoided: false }
    });
  };

  return (
    <StyledPaper>
      <StyledGrid container direction="row">
        <StyledTypography component="span">
          {!isEmpty(searchRequest.subjectType) ? t("searchResults") : ""}
        </StyledTypography>
        <StyledButton onClick={resetClick} aria-label="add an alarm">
          <StyledCancel /> {t("resetFilter")}
        </StyledButton>
      </StyledGrid>
      <SubjectSearchTable
        key={resetCount}
        searchRequest={searchRequest}
        organisationConfigs={organisationConfigs}
        organisationConfigsFailed={organisationConfigsFailed}
      />
    </StyledPaper>
  );
};

export default SubjectSearch;
