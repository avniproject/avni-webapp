import React, { Fragment } from "react";
import { Box, TextField } from "@material-ui/core";
import moment from "moment/moment";
import { LineBreak } from "../../../src/common/components/utils";
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";

export const DateOfBirth = ({ dateOfBirth, onChange }) => {
  const { t } = useTranslation();
  const dob = (dateOfBirth && new Date(dateOfBirth).toISOString().substr(0, 10)) || null;
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

  const _onChange = date => {
    const date1 = new Date(date);
    onChange(moment(date1).isValid() ? date1 : undefined);
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
            margin="normal"
            id="date-picker-dialog"
            autoComplete="off"
            placeholder="mm/dd/yyyy"
            format="MM/dd/yyyy"
            style={{ width: "30%" }}
            name="dateOfBirth"
            label={t("date of birth")}
            value={dob}
            onChange={date => _onChange(date)}
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
          name={"ageYearsPart"}
          value={years}
          style={{ width: "30%" }}
          onChange={e => _onYearsChange(e.target.value)}
        />
      </Box>
    </Fragment>
  );
};
