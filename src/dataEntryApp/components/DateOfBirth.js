import React, { Fragment } from "react";
import { Box, Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import moment from "moment/moment";

function isValidMonth(month) {
  return 0 <= month && month <= 12;
}

export const DateOfBirth = ({
  dateOfBirth,
  dateOfBirthVerified,
  onChange,
  markVerified
}) => {
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

  const _onMonthsChange = value => {
    setMonths(value);
    isValidMonth(value) &&
      onChange(
        moment()
          .subtract(years, "years")
          .subtract(value, "months")
          .toDate()
      );
  };

  return (
    <Fragment>
      <Box display="flex" flexWrap="wrap" alignContent="flex-start">
        <Box p={1}>
          <TextField
            label="Date of Birth"
            type="date"
            required
            name="dateOfBirth"
            value={dob}
            onChange={e => _onChange(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
          />
        </Box>
        <Box
          display="flex"
          flexWrap="wrap"
          alignContent="flex-end"
          p={1}
          px={2}
        >
          <Box>OR</Box>
        </Box>
        <Box p={1}>
          <TextField
            label={"Years"}
            type={"numeric"}
            name={"ageYearsPart"}
            value={years}
            onChange={e => _onYearsChange(e.target.value)}
          />
        </Box>
        <Box p={1}>
          <TextField
            label={"Months"}
            type={"numeric"}
            name={"ageMonthsPart"}
            value={months}
            error={!isValidMonth(months)}
            helperText={
              isValidMonth(months) ? "" : "Months must be between 0 and 12"
            }
            onChange={e => _onMonthsChange(e.target.value)}
          />
        </Box>
        <Box p={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={dateOfBirthVerified}
                onChange={e => {
                  markVerified(e.target.checked);
                }}
                value="checkedB"
                color="primary"
              />
            }
            label="Date of Birth Verified"
          />
        </Box>
      </Box>
    </Fragment>
  );
};
