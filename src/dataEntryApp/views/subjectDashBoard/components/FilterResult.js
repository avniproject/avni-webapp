import React from "react";
import { styled } from '@mui/material/styles';
import { LineBreak } from "common/components/utils";
import { Grid, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, TextField, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import Modal from "../components/CommonModal";
import DialogContent from "@mui/material/DialogContent";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment/moment";
import { noop, isNil, isEmpty } from "lodash";
import CancelIcon from "@mui/icons-material/Cancel";
import { dateFormat } from "dataEntryApp/constants";

const StyledForm = styled('form')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  margin: "auto",
  width: "fit-content",
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  justifyContent: "flex-end",
  alignItems: "flex-start",
}));

const StyledDateGrid = styled(Grid)(({ theme }) => ({
  justifyContent: "flex-start",
  alignItems: "flex-start",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  fontSize: "13px",
  color: "#212529",
  "&:hover": {
    backgroundColor: "#fff",
  },
  "&:focus": {
    outline: "0",
  },
}));

const StyledCancelIcon = styled(CancelIcon)(({ theme }) => ({
  fontSize: "14px",
}));

const filterButtonStyle = {
  height: "28px",
  zIndex: 1,
  marginTop: "1px",
  boxShadow: "none",
  backgroundColor: "#0e6eff",
};

const applyButtonStyle = {
  float: "left",
  backgroundColor: "#f27510",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510",
  },
};

const cancelButtonStyle = {
  float: "left",
  backgroundColor: "#F8F9F9",
  color: "#fc9153",
  border: "1px solid #fc9153",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#F8F9F9",
  },
};

const FilterResult = ({ encounterTypes, setFilterParams }) => {
  const { t } = useTranslation();
  const [selectedScheduleDate, setSelectedScheduleDate] = React.useState(null);
  const [selectedCompletedDate, setSelectedCompletedDate] = React.useState(null);
  const [filterDateErrors, setFilterDateErrors] = React.useState({
    SCHEDULED_DATE: "",
    COMPLETED_DATE: "",
  });
  const [selectedVisitTypes, setVisitTypes] = React.useState(null);

  const visitTypesChange = event => {
    if (event.target.checked) {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    } else {
      setVisitTypes({ ...selectedVisitTypes, [event.target.name]: event.target.checked });
    }
  };

  const close = () => {
    if (!moment(selectedScheduleDate).isValid()) setSelectedScheduleDate(null);
    if (!moment(selectedCompletedDate).isValid()) setSelectedCompletedDate(null);
    filterDateErrors["COMPLETED_DATE"] = "";
    filterDateErrors["SCHEDULED_DATE"] = "";
    setFilterDateErrors({ ...filterDateErrors });
  };

  const scheduleDateChange = scheduledDate => {
    setSelectedScheduleDate(scheduledDate);
    filterDateErrors["SCHEDULED_DATE"] = "";
    if (!isNil(scheduledDate) && !moment(scheduledDate).isValid()) {
      filterDateErrors["SCHEDULED_DATE"] = "invalidDateFormat";
    }
    setFilterDateErrors({ ...filterDateErrors });
  };

  const completedDateChange = completedDate => {
    setSelectedCompletedDate(completedDate);
    filterDateErrors["COMPLETED_DATE"] = "";
    if (!isNil(completedDate) && !moment(completedDate).isValid()) {
      filterDateErrors["COMPLETED_DATE"] = "invalidDateFormat";
    }
    setFilterDateErrors({ ...filterDateErrors });
  };

  const applyClick = () => {
    let filterParams = {};
    if (selectedScheduleDate != null) {
      let dateformat = moment(selectedScheduleDate).format("YYYY-MM-DD");
      let earliestVisitDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
      filterParams.earliestVisitDateTime = earliestVisitDateTime;
    }
    if (selectedCompletedDate != null) {
      let dateformat = moment(selectedCompletedDate).format("YYYY-MM-DD");
      let encounterDateTime = moment(dateformat).format("YYYY-MM-DDT00:00:00.000") + "Z";
      filterParams.encounterDateTime = encounterDateTime;
    }

    const SelectedvisitTypesListSort =
      selectedVisitTypes != null
        ? Object.keys(selectedVisitTypes)
          .filter(selectedId => selectedVisitTypes[selectedId])
          .map(String)
        : [];

    if (SelectedvisitTypesListSort.length > 0) {
      const SelectedvisitTypesList = [...new Set(SelectedvisitTypesListSort.map(item => item))];
      filterParams.encounterTypeUuids = SelectedvisitTypesList.join();
    }
    setFilterParams(filterParams);
  };

  const resetClick = () => {
    setSelectedScheduleDate(null);
    setSelectedCompletedDate(null);
    setVisitTypes(null);
  };

  const content = (
    <DialogContent>
      <StyledGrid container direction="row">
        <StyledIconButton color="secondary" onClick={resetClick} aria-label="add an alarm" size="large">
          <StyledCancelIcon /> {t("resetAll")}
        </StyledIconButton>
      </StyledGrid>
      <StyledForm noValidate>
        <FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StyledDateGrid container direction="row" spacing={3}>
              <Grid size={6}>
                <DatePicker
                  allowKeyboardControl
                  id="date-picker-dialog"
                  format={dateFormat}
                  autoComplete="off"
                  value={selectedScheduleDate}
                  onChange={scheduleDateChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("visitscheduledate")}
                      margin="normal"
                      error={!isEmpty(filterDateErrors["SCHEDULED_DATE"])}
                      helperText={!isEmpty(filterDateErrors["SCHEDULED_DATE"]) && t(filterDateErrors["SCHEDULED_DATE"])}
                    />
                  )}
                  slotProps={{
                    actionBar: { actions: ["clear"] },
                    openPickerButton: { "aria-label": "change date", color: "primary" },
                  }}
                />
              </Grid>
              <Grid size={6}>
                <DatePicker
                  allowKeyboardControl
                  id="date-picker-dialog"
                  format={dateFormat}
                  autoComplete="off"
                  value={selectedCompletedDate}
                  onChange={completedDateChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("visitcompleteddate")}
                      margin="normal"
                      error={!isEmpty(filterDateErrors["COMPLETED_DATE"])}
                      helperText={!isEmpty(filterDateErrors["COMPLETED_DATE"]) && t(filterDateErrors["COMPLETED_DATE"])}
                    />
                  )}
                  slotProps={{
                    actionBar: { actions: ["clear"] },
                    openPickerButton: { "aria-label": "change date", color: "primary" },
                  }}
                />
              </Grid>
            </StyledDateGrid>
          </LocalizationProvider>
        </FormControl>
        <LineBreak num={1} />
        <FormLabel component="legend">{t("visitType")}</FormLabel>
        <FormGroup row>
          {encounterTypes.map(visitType => (
            <FormControlLabel
              key={visitType.uuid}
              control={
                <Checkbox
                  checked={selectedVisitTypes != null ? selectedVisitTypes[visitType.uuid] : false}
                  onChange={visitTypesChange}
                  name={visitType.uuid}
                  color="primary"
                />
              }
              label={t(visitType.name)}
            />
          ))}
        </FormGroup>
      </StyledForm>
    </DialogContent>
  );

  return (
    <Modal
      content={content}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: t("filterResults"),
          sx: filterButtonStyle,
        },
        {
          buttonType: "applyButton",
          label: t("apply"),
          sx: applyButtonStyle,
          redirectTo: `/app/completeVisit`,
          click: applyClick,
          disabled: !isEmpty(filterDateErrors["COMPLETED_DATE"]) || !isEmpty(filterDateErrors["SCHEDULED_DATE"]),
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          sx: cancelButtonStyle,
        },
      ]}
      title={t("filterResults")}
      btnHandleClose={close}
    />
  );
};

export default FilterResult;