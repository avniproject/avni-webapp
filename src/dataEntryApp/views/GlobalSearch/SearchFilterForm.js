import React, { Fragment, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams, LineBreak } from "../../../common/components/utils";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { getOperationalModules } from "../../reducers/metadataReducer";
import { getOrgConfigInfo } from "i18nTranslations/TranslationReducers";
import { getSearchFilters } from "../../reducers/searchFilterReducer";
import Button from "@material-ui/core/Button";
import { Link } from "react-router-dom";
import BasicForm from "../GlobalSearch/BasicForm";
import NonCodedConceptForm from "../GlobalSearch/NonCodedConceptForm";
import NonConceptForm from "../GlobalSearch/NonConceptForm";
import CodedConceptForm from "../GlobalSearch/CodedConceptForm";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  buttons: {
    "& > *": {
      margin: theme.spacing(1)
    }
  }
}));

function SearchFilterForm({
  match,
  getOperationalModules,
  operationalModules,
  getOrgConfigInfo,
  orgConfig,
  getSearchFilters,
  searchResults
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  useEffect(() => {
    getOperationalModules();
    getOrgConfigInfo();
  }, []);

  const [selectedSubjectType, setSelectedSubjectType] = useState(
    operationalModules.subjectTypes[0].uuid
  );

  const organizations = orgConfig._embedded.organisationConfig.map(organization => organization);
  const initialSubjetTypeSearchFilter =
    organizations[0].settings.searchFilters &&
    organizations[0].settings.searchFilters.filter(
      searchFilter => searchFilter.subjectTypeUUID === operationalModules.subjectTypes[0].uuid
    );
  const [selectedSearchFilter, setSelectedSearchFilter] = useState(initialSubjetTypeSearchFilter);

  const onSubjectTypeChange = event => {
    setSelectedSubjectType(event.target.value);
    organizations.map(organization => {
      const slectedSubjetTypeSearchFilter =
        organization.settings.searchFilters &&
        organization.settings.searchFilters.filter(
          serarchFilter => serarchFilter.subjectTypeUUID === event.target.value
        );
      setSelectedSearchFilter(slectedSubjetTypeSearchFilter);
    });
  };

  const [enterValue, setEnterValue] = useState("");
  console.log("enter value", enterValue);

  const searchFilterValue = event => {
    setEnterValue(event.target.value);
  };

  const searchResult = (subjectTypeUUID, name) => {
    const request = {
      subjectType: subjectTypeUUID,
      name: name
    };
    getSearchFilters(request);
  };

  console.log("orgnization search filter", selectedSearchFilter);

  return operationalModules && orgConfig ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Typography component={"span"} className={classes.mainHeading}>
          Search
        </Typography>
        <LineBreak num={1} />
        <FormControl component="fieldset">
          <FormLabel component="legend">Subject Type</FormLabel>
          <RadioGroup
            row
            aria-label="position"
            name="position"
            onChange={onSubjectTypeChange}
            defaultValue={selectedSubjectType}
          >
            {operationalModules.subjectTypes
              ? operationalModules.subjectTypes.map(subjectType => (
                  <FormControlLabel
                    value={subjectType.uuid}
                    control={<Radio color="primary" />}
                    label={subjectType.name}
                  />
                ))
              : ""}
          </RadioGroup>
          {selectedSearchFilter ? (
            <div>
              <BasicForm searchFilterForms={selectedSearchFilter} onChange={searchFilterValue} />
              <NonCodedConceptForm />
              <NonConceptForm />
              <CodedConceptForm />
            </div>
          ) : (
            ""
          )}
          {/* 
          {selectedSearchFilter &&
            selectedSearchFilter.map(searchFilterForm => (
              <div>
                {searchFilterForm.type === "Name" ||
                searchFilterForm.type === "Age" ||
                searchFilterForm.type === "SearchAll" ||
                searchFilterForm.type === "Gender" ||
                searchFilterForm.type === "Address" ? (
                  <BasicForm searchFilterForm={searchFilterForm} onChange={searchFilterValue} />
                ) : (
                  ""
                )}
              </div>
            ))}
          {selectedSearchFilter &&
            selectedSearchFilter.map(searchFilterForm => (
              <div>
                {searchFilterForm.type === "Concept" &&
                !searchFilterForm.conceptDataType === "Coded" ? (
                  <NonCodedConceptForm />
                ) : (
                  ""
                )}
              </div>
            ))}
          {selectedSearchFilter &&
            selectedSearchFilter.map(searchFilterForm => (
              <div>
                {searchFilterForm.type === "RegistrationDate" ||
                searchFilterForm.type === "EnrolmentDate" ||
                searchFilterForm.type === "ProgramEncounterDate" ||
                searchFilterForm.type === "EncounterDate" ? (
                  <NonConceptForm />
                ) : (
                  ""
                )}
              </div>
            ))}
          {selectedSearchFilter &&
            selectedSearchFilter.map(searchFilterForm => (
              <div>
                {searchFilterForm.type === "Concept" &&
                searchFilterForm.conceptDataType === "Coded" ? (
                  <CodedConceptForm />
                ) : (
                  ""
                )}
              </div>
            ))} */}
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => searchResult(selectedSubjectType, enterValue)}
              component={Link}
              to="/app/searchResult"
            >
              Search
            </Button>
            <Button variant="contained" color="secondary">
              Cancel
            </Button>
          </div>
        </FormControl>
      </Paper>
    </Fragment>
  ) : (
    ""
  );
}

const mapStateToProps = state => {
  return {
    operationalModules: state.dataEntry.metadata.operationalModules,
    orgConfig: state.translationsReducer.orgConfig,
    searchResults: state.dataEntry.searchFilterReducer.searchFilters
    // load: state.dataEntry.loadReducer.load
  };
};

const mapDispatchToProps = {
  getOperationalModules,
  getOrgConfigInfo,
  getSearchFilters
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(SearchFilterForm)
  )
);
