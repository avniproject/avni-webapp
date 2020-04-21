import React, { Fragment } from "react";
import { Box, TextField } from "@material-ui/core";
import moment from "moment/moment";
import _ from "lodash";
import { LineBreak } from "../../../src/common/components/utils";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";

export const DateOfBirth = ({ dateOfBirth, onChange, dobErrorMsg }) => {
  const { t } = useTranslation();
  const [years, setYears] = React.useState("");
  const [months, setMonths] = React.useState("");
  const dob = (dateOfBirth && moment(dateOfBirth).isValid() && new Date(dateOfBirth)) || null;

  React.useEffect(() => {
    if (dateOfBirth) {
      setYears(moment().diff(dateOfBirth, "years"));
      setMonths(moment().diff(dateOfBirth, "months") % 12);
    } else {
      setYears("");
      setMonths("");
    }
  }, [dateOfBirth]);

  const _onChange = date => {
    onChange(date);
  };

  const _onYearsChange = value => {
    setYears(value);
    onChange(
      moment()
        .subtract(value, "years")
        .subtract(months, "months")
        .toDate()
    );
  };

  return (
    <Fragment>
      <Box display="flex" flexDirection="column">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            error={!_.isEmpty(dobErrorMsg)}
            helperText={t(dobErrorMsg)}
            required
            margin="normal"
            id="date-picker-dialog"
            autoComplete="off"
            placeholder="mm/dd/yyyy"
            format="MM/dd/yyyy"
            style={{ width: "30%" }}
            name="dateOfBirth"
            label={t("date of birth")}
            value={_.isNil(dateOfBirth) ? null : dateOfBirth}
            onChange={date => onChange(date)}
            InputLabelProps={{
              shrink: true
            }}
            KeyboardButtonProps={{
              "aria-label": "change date",
              color: "primary"
            }}
          />
        </MuiPickersUtilsProvider>
        <LineBreak num={1} />
        <TextField
          label={t("age")}
          type={"numeric"}
          autoComplete="off"
          required
          name="ageYearsPart"
          value={_.isNaN(years) ? "" : years}
          style={{ width: "30%" }}
          // error={Boolean(_.isEmpty(dateOfBirth) && dobErrorMsg)}
          // helperText={_.isEmpty(dateOfBirth) && t(dobErrorMsg)}
          error={Boolean(_.isNil(dob) && dobErrorMsg)}
          helperText={_.isNil(dob) && dobErrorMsg && t("emptyValidationMessage")}
          onChange={e => _onYearsChange(e.target.value)}
        />
      </Box>
    </Fragment>
  );
};
