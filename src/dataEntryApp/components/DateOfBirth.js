import React, { Fragment } from "react";
import { Box, TextField } from "@material-ui/core";
import moment from "moment/moment";
import { LineBreak } from "../../../src/common/components/utils";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";

export const DateOfBirth = ({ dateOfBirth, onChange }) => {
  const { t } = useTranslation();
  const dob = dateOfBirth && dateOfBirth.toISOString().substr(0, 10);
  const [years, setYears] = React.useState("");
  const [months, setMonths] = React.useState("");

  React.useEffect(() => {
    if (dateOfBirth) {
      setYears(moment().diff(dateOfBirth, "years"));
      setMonths(moment().diff(dateOfBirth, "months") % 12);
    } else {
      setYears("");
      setMonths("");
    }
  }, [dateOfBirth]);

  const _onChange = value => {
    const date = new Date(value);
    onChange(moment(date).isValid() ? date : undefined);
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
        <TextField
          label={t("dateOfBirth")}
          type="date"
          autoComplete="off"
          required
          style={{ width: "30%" }}
          name="dateOfBirth"
          value={dob}
          onChange={e => _onChange(e.target.value)}
          InputLabelProps={{
            shrink: true
          }}
        />
        {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            required
            id="date-picker-inline"
            style={{ width: "30%" }}
            name="dateOfBirth"
            value={dob}
            onChange={e => _onChange(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />

        </MuiPickersUtilsProvider> */}
        <LineBreak num={1} />
        <TextField
          label={t("age")}
          type={"numeric"}
          autoComplete="off"
          name={"ageYearsPart"}
          value={years}
          style={{ width: "30%" }}
          onChange={e => _onYearsChange(e.target.value)}
        />
      </Box>
    </Fragment>
  );
};
