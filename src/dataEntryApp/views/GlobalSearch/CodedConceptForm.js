import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Grid, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const StyledGrid = styled(Grid)({
  marginTop: "1%",
  marginBottom: "1%"
});

const StyledLabel = styled(Typography)({
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)"
});

function CodedConceptForm({ searchFilterForms, onChange, conceptList, selectedConcepts }) {
  const { t } = useTranslation();
  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <StyledGrid container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) => {
          const selectedValue = _.head(selectedConcepts.filter(c => c.conceptUUID === searchFilterForm.conceptUUID));
          let selected = {};
          selectedValue && _.forEach(selectedValue.values, sv => _.assign(selected, { [sv]: true }));
          return searchFilterForm.type === "Concept" && searchFilterForm.conceptDataType === "Coded" ? (
            <Grid key={index} size={12}>
              <StyledLabel variant="body1">{t(searchFilterForm.titleKey)}</StyledLabel>
              <FormGroup row key={index}>
                {conceptList.map((concept, index) =>
                  concept.uuid === searchFilterForm.conceptUUID
                    ? concept.conceptAnswers.map((conceptAnswer, index) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selected != null ? selected[conceptAnswer.answerConcept.uuid] : false}
                              onChange={event => onChange(event, searchFilterForm)}
                              name={conceptAnswer.answerConcept.uuid}
                              color="primary"
                            />
                          }
                          label={t(conceptAnswer.answerConcept.name)}
                          key={index}
                        />
                      ))
                    : ""
                )}
              </FormGroup>
            </Grid>
          ) : (
            ""
          );
        })}
      </StyledGrid>
    </Fragment>
  ) : (
    <div />
  );
}

CodedConceptForm.defaultProps = {
  searchFilterForms: []
};

export default CodedConceptForm;
