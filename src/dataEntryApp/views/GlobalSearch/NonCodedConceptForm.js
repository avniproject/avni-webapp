import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { DatePicker, DateTimePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import _ from "lodash";
import { dateFormat, dateTimeFormat } from "dataEntryApp/constants";

const StyledGrid = styled(Grid)({
  marginTop: "1%",
  marginBottom: "1%"
});

const StyledTypography = styled(Typography)({
  marginBottom: 10,
  color: "rgba(0, 0, 0, 0.54)"
});

const StyledTextField = styled(TextField)({
  width: "30%"
});

const StyledTextFieldRangeFrom = styled(TextField)({
  width: "14%",
  marginRight: "1%"
});

const StyledTextFieldRangeTo = styled(TextField)({
  width: "14%",
  marginLeft: "1%"
});

function NonCodedConceptForm({ searchFilterForms, selectedConcepts, onChange }) {
  const { t } = useTranslation();

  return searchFilterForms ? (
    <Fragment key={searchFilterForms.uuid}>
      <StyledGrid container spacing={3}>
        {searchFilterForms.map((searchFilterForm, index) => {
          const selectedValue = _.head(
            selectedConcepts.filter(selectedConcept => selectedConcept.conceptUUID === searchFilterForm.conceptUUID)
          );
          return searchFilterForm.type === "Concept" && searchFilterForm.conceptDataType !== "Coded" ? (
            ["Text", "Id"].includes(searchFilterForm.conceptDataType) ? (
              <Grid key={index} size={12}>
                <StyledTypography variant="body1" sx={{ mb: 1 }}>
                  {t(searchFilterForm.titleKey)}
                </StyledTypography>
                <StyledTextField
                  id={searchFilterForm.titleKey}
                  autoComplete="off"
                  type="text"
                  onChange={event => onChange(event, searchFilterForm)}
                  value={selectedValue?.value || null}
                />
              </Grid>
            ) : searchFilterForm.widget === "Range" ? (
              searchFilterForm.conceptDataType === "Date" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <DatePicker
                      id={`date-picker-${searchFilterForm.titleKey}-min`}
                      format={dateFormat}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { placeholder: "From", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                    <DatePicker
                      id={`date-picker-${searchFilterForm.titleKey}-max`}
                      format={dateFormat}
                      value={selectedValue?.maxValue || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      slotProps={{
                        textField: { placeholder: "To", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <DateTimePicker
                      id={`datetime-picker-${searchFilterForm.titleKey}-min`}
                      format={dateTimeFormat}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { placeholder: "From", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change datetime", color: "primary" }
                      }}
                    />
                    <DateTimePicker
                      id={`datetime-picker-${searchFilterForm.titleKey}-max`}
                      format={dateTimeFormat}
                      value={selectedValue?.maxValue || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      slotProps={{
                        textField: { placeholder: "To", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change datetime", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <TimePicker
                      id={`time-picker-${searchFilterForm.titleKey}-min`}
                      format={"HH:mm"}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { placeholder: "From", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change time", color: "primary" }
                      }}
                    />
                    <TimePicker
                      id={`time-picker-${searchFilterForm.titleKey}-max`}
                      format={"HH:mm"}
                      value={selectedValue?.maxValue || null}
                      onChange={event => onChange(event, searchFilterForm, "maxValue")}
                      slotProps={{
                        textField: { placeholder: "To", variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change time", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Numeric" ? (
                <Grid key={index} size={12}>
                  <StyledTypography variant="body1" sx={{ mb: 1 }}>
                    {t(searchFilterForm.titleKey)}
                  </StyledTypography>
                  <StyledTextFieldRangeFrom
                    id={`${searchFilterForm.titleKey}-min`}
                    autoComplete="off"
                    type="number"
                    placeholder="From"
                    onChange={event => onChange(event, searchFilterForm, "minValue")}
                    value={selectedValue?.minValue || null}
                  />
                  <StyledTextFieldRangeTo
                    id={`${searchFilterForm.titleKey}-max`}
                    autoComplete="off"
                    type="number"
                    placeholder="To"
                    onChange={event => onChange(event, searchFilterForm, "maxValue")}
                    value={selectedValue?.maxValue || null}
                  />
                </Grid>
              ) : null
            ) : searchFilterForm.widget === "Default" ? (
              searchFilterForm.conceptDataType === "Numeric" ? (
                <Grid key={index} size={12}>
                  <StyledTypography variant="body1" sx={{ mb: 1 }}>
                    {t(searchFilterForm.titleKey)}
                  </StyledTypography>
                  <StyledTextField
                    id={searchFilterForm.titleKey}
                    autoComplete="off"
                    type="number"
                    onChange={event => onChange(event, searchFilterForm, "minValue")}
                    value={selectedValue?.minValue || null}
                  />
                </Grid>
              ) : searchFilterForm.conceptDataType === "Date" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <DatePicker
                      id={`date-picker-${searchFilterForm.titleKey}`}
                      format={dateFormat}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change date", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "DateTime" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <DateTimePicker
                      id={`datetime-picker-${searchFilterForm.titleKey}`}
                      format={dateTimeFormat}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change datetime", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : searchFilterForm.conceptDataType === "Time" ? (
                <Grid key={index} size={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <StyledTypography variant="body1" sx={{ mb: 1 }}>
                      {t(searchFilterForm.titleKey)}
                    </StyledTypography>
                    <TimePicker
                      id={`time-picker-${searchFilterForm.titleKey}`}
                      format={"HH:mm"}
                      value={selectedValue?.minValue || null}
                      onChange={event => onChange(event, searchFilterForm, "minValue")}
                      slotProps={{
                        textField: { variant: "outlined" },
                        actionBar: { actions: ["clear"] },
                        openPickerButton: { "aria-label": "change time", color: "primary" }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              ) : null
            ) : null
          ) : null;
        })}
      </StyledGrid>
    </Fragment>
  ) : null;
}

NonCodedConceptForm.defaultProps = {
  searchFilterForms: {}
};

export default NonCodedConceptForm;
