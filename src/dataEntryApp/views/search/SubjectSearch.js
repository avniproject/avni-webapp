import React from "react";
import { Paper } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import CancelIcon from "@material-ui/icons/Cancel";
import SubjectSearchTable from "dataEntryApp/views/search/SubjectSearchTable";
import { useTranslation } from "react-i18next";
import { store } from "../../../common/store";
import { types } from "../../reducers/searchFilterReducer";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { isEmpty } from "lodash";
import { getOrganisationConfig } from "../../reducers/metadataReducer";

const useStyle = makeStyles(theme => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(3),
    overflowX: "auto",
    flexShrink: 0,
    marginLeft: theme.spacing(2.5)
  },
  searchCreateToolbar: {
    display: "flex"
  },
  searchForm: {
    marginLeft: theme.spacing(3),
    marginBottom: theme.spacing(8),
    display: "flex",
    alignItems: "flex-end",
    flex: 8
  },
  searchFormItem: {
    margin: theme.spacing(1)
  },
  searchBtnShadow: {
    boxShadow: "none",
    backgroundColor: "#0e6eff",
    marginRight: 10
  },
  resetBtnShadow: {
    boxShadow: "none",
    backgroundColor: "#FF8C00",
    marginRight: 10
  },
  createButtonHolder: {
    flex: 1
  },
  searchBox: {
    padding: "1.5rem",
    margin: "2rem 1rem"
  }
}));

const SubjectSearch = ({ searchRequest, getOrganisationConfig, organisationConfigs }) => {
  const classes = useStyle();

  React.useEffect(() => {
    if (!organisationConfigs) {
      getOrganisationConfig();
    }
  }, []);

  const { t } = useTranslation();
  const resetClick = () => {
    store.dispatch({ type: types.ADD_SEARCH_REQUEST, value: { includeVoided: false } });
  };

  return (
    <Paper className={classes.searchBox}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="baseline"
        style={{ marginBottom: "1%" }}
      >
        <Typography
          component={"span"}
          style={{
            fontSize: "22px",
            fontWeight: "500",
            float: "left",
            paddingTop: "1%",
            paddingLeft: "4px"
          }}
        >
          {!isEmpty(searchRequest.subjectType) ? t("searchResults") : ""}
        </Typography>
        <Button onClick={() => resetClick()} aria-label="add an alarm" style={{ color: "#212529" }}>
          <CancelIcon style={{ fontSize: "12px" }} /> {t("resetFilter")}
        </Button>
      </Grid>

      <SubjectSearchTable searchRequest={searchRequest} organisationConfigs={organisationConfigs} />
    </Paper>
  );
};

const mapStateToProps = state => {
  return {
    searchRequest: state.dataEntry.searchFilterReducer.request,
    organisationConfigs: state.dataEntry.metadata.organisationConfigs
  };
};

const mapDispatchToProps = {
  getOrganisationConfig
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SubjectSearch)
);
